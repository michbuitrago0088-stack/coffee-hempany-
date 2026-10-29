<?php
// ========================================
// pedido.php · guarda un pedido nuevo
// Uso desde la página: fetch("api/pedido.php", { method: "POST", body: JSON })
//
// Recibe este JSON:
//   {
//     "nombre": "Ana Gómez", "correo": "ana@correo.com",
//     "piso": "Piso 3", "oficina": "304", "metodo": "Efectivo",
//     "productos": [ { "id": 1, "cantidad": 2 }, { "id": 5, "cantidad": 1 } ]
//   }
// Para EDITAR un pedido que ya se envió, se agrega además:
//     "id": 8, "correo_original": "ana@correo.com"
// El pedido solo se puede editar si sigue en estado "pendiente" y si el
// correo coincide con el del pedido original.
//
// Los precios NO se reciben de la página: se leen de la base de datos,
// para que nadie pueda cambiarlos desde el navegador.
// ========================================

require __DIR__ . '/config.php';

// Error de datos mal enviados (se responde con código 400)
class DatosInvalidos extends Exception
{
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

$entrada = json_decode(file_get_contents('php://input'), true);

if (!is_array($entrada)) {
    responder(400, ['ok' => false, 'error' => 'Los datos del pedido no son válidos.']);
}


try {

    // ----------------------------------------
    // 1. REVISAR LOS DATOS DEL CLIENTE
    // ----------------------------------------

    $nombre  = trim((string) ($entrada['nombre'] ?? ''));
    $correo  = trim((string) ($entrada['correo'] ?? ''));
    $piso    = trim((string) ($entrada['piso'] ?? ''));
    $oficina = trim((string) ($entrada['oficina'] ?? ''));
    $metodo  = trim((string) ($entrada['metodo'] ?? ''));

    if ($nombre === '' || $correo === '' || $piso === '' || $oficina === '' || $metodo === '') {
        throw new DatosInvalidos('Por favor completa todos los campos.');
    }

    if (mb_strlen($nombre) > 100 || mb_strlen($oficina) > 50 || mb_strlen($correo) > 150) {
        throw new DatosInvalidos('Alguno de los datos es demasiado largo.');
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        throw new DatosInvalidos('El correo no es válido.');
    }


    // Si viene un id, no se crea un pedido nuevo: se edita ese
    $idEditar = (int) ($entrada['id'] ?? 0);

    // Al editar, el correo puede cambiar; se comprueba con el que tenía el pedido
    $correoOriginal = trim((string) ($entrada['correo_original'] ?? $correo));


    // ----------------------------------------
    // 2. REVISAR LOS PRODUCTOS
    // Si un producto viene repetido, se suman sus cantidades.
    // ----------------------------------------

    $lineas = $entrada['productos'] ?? null;

    if (!is_array($lineas) || count($lineas) === 0 || count($lineas) > 50) {
        throw new DatosInvalidos('El pedido no tiene productos.');
    }

    $cantidades = [];   // id del producto => cantidad

    foreach ($lineas as $linea) {

        $id       = (int) ($linea['id'] ?? 0);
        $cantidad = (int) ($linea['cantidad'] ?? 0);

        if ($id < 1 || $cantidad < 1) {
            throw new DatosInvalidos('Hay un producto con datos no válidos.');
        }

        $cantidades[$id] = ($cantidades[$id] ?? 0) + $cantidad;

        if ($cantidades[$id] > 20) {
            throw new DatosInvalidos('El máximo es 20 unidades por producto.');
        }
    }


    // ----------------------------------------
    // 3. GUARDAR TODO JUNTO
    // Con la transacción, o se guarda el pedido completo o no se guarda nada.
    // ----------------------------------------

    $bd = conectar();

    $consulta = $bd->prepare('SELECT id FROM pisos WHERE nombre = ?');
    $consulta->execute([$piso]);
    $pisoId = $consulta->fetchColumn();

    $consulta = $bd->prepare('SELECT id FROM metodos_pago WHERE nombre = ?');
    $consulta->execute([$metodo]);
    $metodoId = $consulta->fetchColumn();

    if (!$pisoId) {
        throw new DatosInvalidos('El piso elegido no es válido.');
    }

    if (!$metodoId) {
        throw new DatosInvalidos('El método de pago elegido no es válido.');
    }

    $bd->beginTransaction();

    if ($idEditar > 0) {

        // ---- EDITAR UN PEDIDO EXISTENTE ----
        // FOR UPDATE bloquea la fila mientras se edita
        $consulta = $bd->prepare('SELECT correo, estado FROM pedidos WHERE id = ? FOR UPDATE');
        $consulta->execute([$idEditar]);
        $original = $consulta->fetch();

        if (!$original || strcasecmp($original['correo'], $correoOriginal) !== 0) {
            throw new DatosInvalidos('No se encontró ese pedido.');
        }

        if ($original['estado'] !== 'pendiente') {
            throw new DatosInvalidos('Este pedido ya no se puede cambiar (está en preparación, entregado o anulado).');
        }

        $bd->prepare('UPDATE pedidos
                      SET nombre = ?, correo = ?, piso_id = ?, oficina = ?, metodo_pago_id = ?
                      WHERE id = ?')
           ->execute([$nombre, $correo, $pisoId, $oficina, $metodoId, $idEditar]);

        // Se borran los productos anteriores y se guardan los nuevos
        $bd->prepare('DELETE FROM pedido_items WHERE pedido_id = ?')->execute([$idEditar]);

        $pedidoId = $idEditar;

    } else {

        // ---- PEDIDO NUEVO ----
        $bd->prepare('INSERT INTO pedidos (nombre, correo, piso_id, oficina, metodo_pago_id)
                      VALUES (?, ?, ?, ?, ?)')
           ->execute([$nombre, $correo, $pisoId, $oficina, $metodoId]);

        $pedidoId = (int) $bd->lastInsertId();
    }

    $buscarProducto = $bd->prepare('SELECT nombre, precio FROM productos WHERE id = ? AND activo = 1');
    $guardarItem = $bd->prepare('INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio, cantidad)
                                 VALUES (?, ?, ?, ?, ?)');
    $total = 0;

    foreach ($cantidades as $productoId => $cantidad) {

        $buscarProducto->execute([$productoId]);
        $producto = $buscarProducto->fetch();

        if (!$producto) {
            throw new DatosInvalidos('Un producto del pedido ya no está disponible. Revisa la carta.');
        }

        $guardarItem->execute([$pedidoId, $productoId, $producto['nombre'], $producto['precio'], $cantidad]);

        $total += $producto['precio'] * $cantidad;
    }

    $bd->prepare('UPDATE pedidos SET total = ? WHERE id = ?')->execute([$total, $pedidoId]);

    $bd->commit();

    responder($idEditar > 0 ? 200 : 201, ['ok' => true, 'id' => $pedidoId, 'total' => $total, 'editado' => $idEditar > 0]);

} catch (DatosInvalidos $e) {

    if (isset($bd) && $bd->inTransaction()) {
        $bd->rollBack();
    }
    responder(400, ['ok' => false, 'error' => $e->getMessage()]);

} catch (Throwable $e) {

    if (isset($bd) && $bd->inTransaction()) {
        $bd->rollBack();
    }
    error_log('pedido.php: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudo guardar el pedido. Intenta de nuevo.']);
}
