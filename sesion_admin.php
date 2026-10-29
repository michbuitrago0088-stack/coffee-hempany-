<?php
// ========================================
// sesion_admin.php · inicio de sesión del administrador (en el servidor)
//   GET                                   -> ¿hay sesión iniciada?
//   POST {"usuario": "...", "clave": "..."} -> iniciar sesión
//   POST {"salir": true}                    -> cerrar sesión
// Usa la tabla "administradores" (id, usuario, clave_hash, creado_en, estado).
// ========================================

require __DIR__ . '/config.php';

session_start();

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    responder(200, ['ok' => true, 'activa' => !empty($_SESSION['admin_id'])]);
}

if ($metodo !== 'POST') {
    responder(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

$entrada = json_decode(file_get_contents('php://input'), true);

if (!is_array($entrada)) {
    responder(400, ['ok' => false, 'error' => 'Datos no válidos.']);
}

// ----------------------------------------
// CERRAR SESIÓN
// ----------------------------------------

if (!empty($entrada['salir'])) {
    $_SESSION = [];
    session_destroy();
    responder(200, ['ok' => true]);
}

// ----------------------------------------
// INICIAR SESIÓN
// ----------------------------------------

$usuario = trim((string) ($entrada['usuario'] ?? ''));
$clave   = (string) ($entrada['clave'] ?? '');

try {

    $consulta = conectar()->prepare('SELECT id, clave_hash FROM administradores WHERE usuario = ? AND estado = 1');
    $consulta->execute([$usuario]);
    $fila = $consulta->fetch();

    if (!$fila || !password_verify($clave, $fila['clave_hash'])) {
        sleep(1);   // frena los intentos de adivinar la clave
        responder(401, ['ok' => false, 'error' => 'Usuario o contraseña incorrectos.']);
    }

    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $fila['id'];

    responder(200, ['ok' => true]);

} catch (PDOException $e) {

    error_log('sesion_admin.php: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudo iniciar sesión. Intenta de nuevo.']);
}