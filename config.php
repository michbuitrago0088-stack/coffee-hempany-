<?php
// ========================================
// config.php · conexión a la base de datos y ayudas comunes
// Todos los archivos de la carpeta api/ lo cargan con require.
// ========================================


// ----------------------------------------
// DATOS DE LA CONEXIÓN
// Con XAMPP, el usuario por defecto es "root" y la clave está vacía.
// Eso sirve para practicar en tu computador. Antes de publicar la
// página, crea un usuario propio (en phpMyAdmin, pestaña SQL):
//
//   CREATE USER 'hempany_app'@'localhost' IDENTIFIED BY 'una_clave_larga';
//   GRANT SELECT, INSERT, UPDATE, DELETE ON coffee_hempany.* TO 'hempany_app'@'localhost';
//
// y escribe ese usuario y esa clave aquí abajo.
// ----------------------------------------

const DB_HOST = 'localhost';
const DB_NOMBRE = 'coffee_hempany';
const DB_USUARIO = 'root';
const DB_CLAVE = '';


// Los errores se guardan en el registro del servidor y no se muestran
// en pantalla (así nunca se filtran datos de la base y el JSON no se rompe).
ini_set('display_errors', '0');
ini_set('log_errors', '1');


// ----------------------------------------
// RESPONDER EN JSON
// Envía la respuesta al navegador y termina el programa.
// ----------------------------------------

function responder($codigo, $datos)
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}


// ----------------------------------------
// CONECTAR A LA BASE DE DATOS
// Devuelve la conexión (PDO). Se abre una sola vez por visita.
// ----------------------------------------

function conectar()
{
    static $conexion = null;

    if ($conexion !== null) {
        return $conexion;
    }

    try {
        $conexion = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NOMBRE . ';charset=utf8mb4',
            DB_USUARIO,
            DB_CLAVE,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,        // los fallos lanzan excepción
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,   // filas como arreglos con nombre
                PDO::ATTR_EMULATE_PREPARES => false,                // consultas preparadas de verdad
            ]
        );
    } catch (PDOException $e) {
        error_log('Conexión a la base de datos: ' . $e->getMessage());
        responder(500, ['ok' => false, 'error' => 'No se pudo conectar con la base de datos.']);
    }

    return $conexion;
}
