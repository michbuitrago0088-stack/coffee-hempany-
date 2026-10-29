<?php
// ========================================
// productos.php · devuelve la carta (solo productos activos)
// Uso desde la página: fetch("api/productos.php")
// ========================================

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responder(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

try {

    $filas = conectar()
        ->query('SELECT id, nombre, descripcion, precio, imagen
                 FROM productos
                 WHERE activo = 1
                 ORDER BY id')
        ->fetchAll();

    // Convertir los números (la base de datos los entrega como texto)
    $productos = array_map(function ($f) {
        return [
            'id'          => (int) $f['id'],
            'nombre'      => $f['nombre'],
            'descripcion' => $f['descripcion'],
            'precio'      => (int) $f['precio'],
            'imagen'      => $f['imagen'] ?? '',
        ];
    }, $filas);

    responder(200, ['ok' => true, 'productos' => $productos]);

} catch (PDOException $e) {

    error_log('productos.php: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudo cargar la carta.']);
}
