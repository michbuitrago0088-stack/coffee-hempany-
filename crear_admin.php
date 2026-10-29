<?php
// ========================================
// crear_admin.php · crea un administrador (SE USA UNA SOLA VEZ)
// 1. Escribe abajo el usuario y la clave que quieres.
// 2. Abre http://localhost/coffee-hempany/api/crear_admin.php
// 3. BORRA este archivo (y no dejes la clave escrita aquí).
// ========================================

$USUARIO = 'admin';
$CLAVE   = 'admin123';

require __DIR__ . '/config.php';

if ($CLAVE === 'ESCRIBE-AQUI-UNA-CLAVE-LARGA' || strlen($CLAVE) < 8) {
    responder(400, ['ok' => false, 'error' => 'Cambia la clave en el archivo (mínimo 8 caracteres).']);
}

try {

    conectar()
        ->prepare('INSERT INTO administradores (usuario, clave_hash, estado) VALUES (?, ?, 1)')
        ->execute([$USUARIO, password_hash($CLAVE, PASSWORD_DEFAULT)]);

    responder(201, ['ok' => true, 'mensaje' => 'Administrador creado. Ahora borra crear_admin.php.']);

} catch (PDOException $e) {

    error_log('crear_admin.php: ' . $e->getMessage());
    responder(500, ['ok' => false, 'error' => 'No se pudo crear (¿ya existe ese usuario o revisa que la tabla se llame administradores?).']);
}