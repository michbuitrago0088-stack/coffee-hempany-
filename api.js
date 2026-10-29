// ========================================
// api.js · habla con los archivos PHP de la carpeta api/
// Cárgalo en menu.html y pedido.html, justo después de datos.js.
// ========================================


// ----------------------------------------
// PEDIR ALGO AL SERVIDOR
// Devuelve los datos si todo salió bien; si no, lanza un error
// con un mensaje que se le puede mostrar a la persona.
// ----------------------------------------

async function pedirApi(url, opciones) {

  // Los archivos PHP no funcionan si abres la página con doble clic (file://)
  if (location.protocol === "file:") {
    throw new Error("Abre la página desde http://localhost/ (con XAMPP encendido), no con doble clic.");
  }

  let respuesta;
  let datos;

  try {
    respuesta = await fetch(url, opciones);
    datos = await respuesta.json();
  } catch (error) {
    throw new Error("No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos en XAMPP.");
  }

  if (!respuesta.ok || !datos.ok) {
    throw new Error(datos.error || "Ocurrió un error. Intenta de nuevo.");
  }

  return datos;
}


// ----------------------------------------
// CARTA: lista de productos activos
// ----------------------------------------

async function cargarProductosApi() {

  const datos = await pedirApi("api/productos.php");

  return datos.productos;
}


// ----------------------------------------
// PEDIDO: guarda un pedido nuevo
// "pedido" lleva: nombre, correo, piso, oficina, metodo y
// productos (una lista de { id, cantidad }).
// Devuelve { ok, id, total }.
// ----------------------------------------

function enviarPedidoApi(pedido) {

  return pedirApi("api/pedido.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido)
  });
}
