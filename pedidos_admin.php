<?php
// ========================================
// pedidos_admin.php · lista los pedidos y cambia su estado
//   GET  api/pedidos_admin.php                       -> todos los pedidos
//   POST api/pedidos_admin.php {"id": 3, "estado": "entregado"}
// Solo responde si el administrador inició sesión (ver sesion_admin.php).
// ========================================

require __DIR__ . '/config.php';

session_start();

if (empty($_SESSION['admin_id'])) {
    responder(401, ['ok' => false, 'error' => 'Debes iniciar sesión.']);
}

const ESTADOS_VALIDOS = ['pendiente', 'en_preparacion', 'entregado', 'anulado'];

try {

    $bd = conectar();

    // ----------------------------------------
    // CAMBIAR EL ESTADO DE UN PEDIDO
    // ----------------------------------------

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $entrada = json_decode(file_get_contents('php://input'), true);
        $id      = (int) ($entrada['id'] ?? 0);
        $estado  = (string) ($entrada['estado'] ?? '');

        if ($id < 1 || !in_array($estado, ESTADOS_VALIDOS, true)) {
            responder(400, ['ok' => false, 'error' => 'Datos no válidos.']);
        }

        $bd->prepare('UPDATE pedidos SET estado = ? WHERE id = ?')->execute([$estado, $id]);

        responder(200, ['ok' => true]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        responder(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }

    // ----------------------------------------
    // LISTAR LOS PEDIDOS (del más nuevo al más viejo)
    // ----------------------------------------

    $filas = $bd->query(
        'SELECT p.id, p.nombre, p.oficina, p.total, p.estado, p.creado_en,
                pi.nombre AS piso, mp.nombre AS metodo
         FROM pedidos p
         JOIN pisos pi        ON pi.id = p.piso_id
         JOIN metodos_pago mp ON mp.id = p.metodo_pago_id
         ORDER BY p.id DESC'
    )->fetchAll();

    // Productos de todos los pedidos en una sola consulta
    $items = [];
    foreach ($bd->query('SELECT pedido_id, nombre, cantidad FROM pedido_items ORDER BY id')->fetchAll() as $i) {
        $items[(int) $i['pedido_id']][] = [
            'nombre'   => $i['nombre'],
            'cantidad' => (int) $i['cantidad'],
        ];
    }

    $pedidos = array_map(function ($f) use ($items) {
        return [
            'id'      => (int) $f['id'],
            'nombre'  => $f['nombre'],
            'piso'    => $f['piso'],
            'oficina' => $f['oficina'],
            'metodo'  => $f['metodo'],
            'total'   => (int) $f['total'],
            'estado'  => $f['estado'],
            'fecha'   => str_replace(' ', 'T', $f['creado_en']),
            'items'   => $items[(int) $f['id']] ?? [],
        ];
    }, $filas);

    responder(200, ['ok' => true, 'pedidos' => $pedidos]);

} catch (PDOException $e) {

    error_log('pedidos_admin.php: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudieron cargar los pedidos. ¿Ya agregaste la columna estado (con la opción anulado)?']);
}