<?php
// ========================================
// probar.php · comprueba que PHP y la base de datos están conectados
// Ábrelo en el navegador: http://localhost/coffee-hempany/api/probar.php
// BÓRRALO cuando termines de probar.
// ========================================

require __DIR__ . '/config.php';

try {

    $bd = conectar();

    responder(200, [
        'ok'                => true,
        'mensaje'           => 'Conexión correcta con la base de datos.',
        'productos_activos' => (int) $bd->query('SELECT COUNT(*) FROM productos WHERE activo = 1')->fetchColumn(),
        'pedidos'           => (int) $bd->query('SELECT COUNT(*) FROM pedidos')->fetchColumn(),
    ]);

} catch (PDOException $e) {

    error_log('probar.php: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'Conecta, pero faltan tablas: importa coffee_hempany.sql.']);
}
