<?php
// ========================================
// productos_admin.php · el administrador maneja los productos
//   GET  api/productos_admin.php                  -> todos los productos (activos e inactivos)
//   POST {"accion":"crear", nombre, precio, descripcion, imagen}
//   POST {"accion":"imagen", id, imagen}
//   POST {"accion":"activo", id, activo}
//   POST {"accion":"eliminar", id}
// "imagen" llega como texto base64 (data:image/jpeg;base64,...) y se guarda
// como archivo dentro de la carpeta img/; en la base solo va su ruta.
// Solo responde si el administrador inició sesión.
// ========================================

require __DIR__ . '/config.php';

session_start();

if (empty($_SESSION['admin_id'])) {
    responder(401, ['ok' => false, 'error' => 'Debes iniciar sesión.']);
}

class DatosInvalidos extends Exception
{
}

const CARPETA_IMG = __DIR__ . '/../img/';
const PREFIJO_IMG = 'producto_';


// ----------------------------------------
// GUARDAR UNA IMAGEN EN LA CARPETA img/
// Devuelve la ruta para la base de datos (por ejemplo img/producto_6_123.jpg)
// ----------------------------------------

function guardarImagen($datosImagen, $idProducto)
{
    if (!preg_match('#^data:image/jpeg;base64,([A-Za-z0-9+/=]+)$#', $datosImagen, $m)) {
        throw new DatosInvalidos('La imagen no es válida.');
    }

    $binario = base64_decode($m[1], true);

    if ($binario === false || strlen($binario) > 2 * 1024 * 1024) {
        throw new DatosInvalidos('La imagen es demasiado grande (máximo 2 MB).');
    }

    $info = @getimagesizefromstring($binario);

    if (!$info || $info['mime'] !== 'image/jpeg') {
        throw new DatosInvalidos('El archivo no es una imagen válida.');
    }

    if (!is_dir(CARPETA_IMG) || !is_writable(CARPETA_IMG)) {
        throw new Exception('La carpeta img/ no existe o no se puede escribir.');
    }

    $nombre = PREFIJO_IMG . $idProducto . '_' . time() . '.jpg';

    if (file_put_contents(CARPETA_IMG . $nombre, $binario) === false) {
        throw new Exception('No se pudo guardar la imagen.');
    }

    return 'img/' . $nombre;
}


// Borra la imagen anterior, pero solo si la subió el panel (producto_...).
// Las imágenes originales de la página no se tocan.
function borrarImagen($ruta)
{
    $archivo = basename((string) $ruta);

    if (strpos($archivo, PREFIJO_IMG) === 0 && is_file(CARPETA_IMG . $archivo)) {
        @unlink(CARPETA_IMG . $archivo);
    }
}


try {

    $bd = conectar();

    // ----------------------------------------
    // LISTAR
    // ----------------------------------------

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {

        $filas = $bd->query('SELECT id, nombre, descripcion, precio, imagen, activo FROM productos ORDER BY id')->fetchAll();

        $productos = array_map(function ($f) {
            return [
                'id'          => (int) $f['id'],
                'nombre'      => $f['nombre'],
                'descripcion' => $f['descripcion'] ?? '',
                'precio'      => (int) $f['precio'],
                'imagen'      => $f['imagen'] ?? '',
                'activo'      => (int) $f['activo'] === 1,
            ];
        }, $filas);

        responder(200, ['ok' => true, 'productos' => $productos]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }

    $entrada = json_decode(file_get_contents('php://input'), true);

    if (!is_array($entrada)) {
        throw new DatosInvalidos('Los datos no son válidos.');
    }

    $accion = (string) ($entrada['accion'] ?? '');
    $id     = (int) ($entrada['id'] ?? 0);


    // ----------------------------------------
    // CREAR UN PRODUCTO
    // ----------------------------------------

    if ($accion === 'crear') {

        $nombre      = trim((string) ($entrada['nombre'] ?? ''));
        $descripcion = trim((string) ($entrada['descripcion'] ?? ''));
        $precio      = $entrada['precio'] ?? null;
        $imagen      = (string) ($entrada['imagen'] ?? '');

        if ($nombre === '' || mb_strlen($nombre) > 100) {
            throw new DatosInvalidos('El nombre es obligatorio (máximo 100 letras).');
        }

        if (!is_numeric($precio) || $precio < 0 || $precio > 10000000) {
            throw new DatosInvalidos('El precio no es válido.');
        }

        if (mb_strlen($descripcion) > 120) {
            throw new DatosInvalidos('La descripción es demasiado larga (máximo 120 letras).');
        }

        $bd->prepare('INSERT INTO productos (nombre, descripcion, precio, imagen, activo) VALUES (?, ?, ?, ?, 1)')
           ->execute([$nombre, $descripcion, (int) $precio, '']);

        $nuevoId = (int) $bd->lastInsertId();
        $ruta    = '';

        if ($imagen !== '') {
            try {
                $ruta = guardarImagen($imagen, $nuevoId);
                $bd->prepare('UPDATE productos SET imagen = ? WHERE id = ?')->execute([$ruta, $nuevoId]);
            } catch (Throwable $e) {
                // Si la imagen falla, no se deja el producto a medias
                $bd->prepare('DELETE FROM productos WHERE id = ?')->execute([$nuevoId]);
                throw $e;
            }
        }

        responder(201, ['ok' => true, 'id' => $nuevoId, 'imagen' => $ruta]);
    }


    // Las demás acciones necesitan el id de un producto que exista
    if ($id < 1) {
        throw new DatosInvalidos('Producto no válido.');
    }

    $buscar = $bd->prepare('SELECT imagen FROM productos WHERE id = ?');
    $buscar->execute([$id]);
    $producto = $buscar->fetch();

    if (!$producto) {
        throw new DatosInvalidos('Ese producto ya no existe.');
    }


    // ----------------------------------------
    // PONER O CAMBIAR LA IMAGEN
    // ----------------------------------------

    if ($accion === 'imagen') {

        $ruta = guardarImagen((string) ($entrada['imagen'] ?? ''), $id);

        $bd->prepare('UPDATE productos SET imagen = ? WHERE id = ?')->execute([$ruta, $id]);
        borrarImagen($producto['imagen']);

        responder(200, ['ok' => true, 'imagen' => $ruta]);
    }


    // ----------------------------------------
    // ACTIVAR / DESACTIVAR
    // ----------------------------------------

    if ($accion === 'activo') {

        $bd->prepare('UPDATE productos SET activo = ? WHERE id = ?')
           ->execute([!empty($entrada['activo']) ? 1 : 0, $id]);

        responder(200, ['ok' => true]);
    }


    // ----------------------------------------
    // ELIMINAR
    // Si el producto ya está en pedidos, la base no deja borrarlo:
    // en ese caso se desactiva (así los pedidos viejos no se dañan).
    // ----------------------------------------

    if ($accion === 'eliminar') {

        try {

            $bd->prepare('DELETE FROM productos WHERE id = ?')->execute([$id]);
            borrarImagen($producto['imagen']);

            responder(200, ['ok' => true, 'desactivado' => false]);

        } catch (PDOException $e) {

            if ($e->getCode() !== '23000') {
                throw $e;
            }

            $bd->prepare('UPDATE productos SET activo = 0 WHERE id = ?')->execute([$id]);

            responder(200, ['ok' => true, 'desactivado' => true]);
        }
    }

    throw new DatosInvalidos('Acción no válida.');

} catch (DatosInvalidos $e) {

    responder(400, ['ok' => false, 'error' => $e->getMessage()]);

} catch (Throwable $e) {

    error_log('productos_admin.php: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudo completar la acción. Intenta de nuevo.']);
}