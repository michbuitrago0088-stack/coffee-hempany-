// ========================================
// menu.js · carta con cantidades y total en vivo
// Los productos ahora vienen de la base de datos (api/productos.php).
// ========================================


// ----------------------------------------
// ELEMENTOS DE LA PÁGINA
// ----------------------------------------

const lista = document.getElementById("lista-productos");
const total = document.getElementById("total");
const continuar = document.getElementById("btn-continuar");

// Los productos activos; se llenan cuando llegan de la base de datos
let productos = [];

// Si la dirección es menu.html?editar=8, la persona está editando
// un pedido que ya envió (viene de la página de confirmación)
const idEditar = new URLSearchParams(location.search).get("editar");

// Si es la primera vez que entra a editar, el carrito está vacío:
// lo llenamos con los productos del pedido que ya había enviado
if (idEditar) {
  const ultimoPedido = Almacen.leer("ultimoPedido", null);
  const esSuPedido = ultimoPedido && String(ultimoPedido.id) === idEditar;

  if (esSuPedido && !Almacen.leer("carrito", []).length) {
    Almacen.guardar("carrito", ultimoPedido.productos);
  }

  // Si no se encuentra el pedido ni hay carrito, se avisa en pantalla
  if (!esSuPedido && !Almacen.leer("carrito", []).length) {
    lista.insertAdjacentHTML("beforebegin",
      '<p class="error">No se encontró el pedido anterior en este navegador. Elige los productos de nuevo.</p>');
  }
}


// ----------------------------------------
// DIBUJAR LOS PRODUCTOS
// Orden: imagen, nombre, precio y descripción
// ----------------------------------------

function dibujarProductos() {

  if (!productos.length) {
    lista.innerHTML = '<li class="vacio">Aún no hay productos disponibles. Vuelve pronto.</li>';
    return;
  }

  lista.innerHTML = productos.map(p => `
    <li class="producto" data-id="${p.id}" data-precio="${p.precio}">

      <div class="producto-info">
        ${p.imagen ? `<img class="producto-img" src="${esc(p.imagen)}" alt="${esc(p.nombre)}">` : ""}
        <h2>${esc(p.nombre)}</h2>
        <p class="precio">${dinero(p.precio)}</p>
        ${p.descripcion ? `<p class="descripcion">${esc(p.descripcion)}</p>` : ""}
      </div>

      <div class="cantidad">
        <button type="button" class="menos" aria-label="Quitar uno">−</button>
        <input type="number" value="0" min="0" max="20" aria-label="Cantidad de ${esc(p.nombre)}">
        <button type="button" class="mas" aria-label="Agregar uno">+</button>
      </div>

    </li>`).join("");
}


// ----------------------------------------
// PONER LAS CANTIDADES QUE LA PERSONA YA HABÍA ELEGIDO
// Se leen del carrito guardado, así puede quitar o agregar
// productos sin empezar de cero.
// ----------------------------------------

function cargarCantidades() {

  Almacen.leer("carrito", []).forEach(item => {
    const fila = lista.querySelector(`.producto[data-id="${item.id}"]`);
    if (fila) fila.querySelector("input").value = item.cantidad;
  });
}


// ----------------------------------------
// CALCULAR EL TOTAL
// ----------------------------------------

function recalcular() {

  let suma = 0;

  lista.querySelectorAll(".producto").forEach(fila => {
    suma += (parseInt(fila.querySelector("input").value, 10) || 0) * Number(fila.dataset.precio);
  });

  total.textContent = dinero(suma);

  // El botón Continuar solo se activa si hay algo en el pedido
  continuar.disabled = suma === 0;
}


// ----------------------------------------
// BOTONES + Y −
// ----------------------------------------

lista.addEventListener("click", e => {

  const boton = e.target.closest(".mas, .menos");
  if (!boton) return;

  const input = boton.parentElement.querySelector("input");
  const valor = parseInt(input.value, 10) || 0;

  input.value = boton.classList.contains("mas")
    ? Math.min(valor + 1, 20)
    : Math.max(valor - 1, 0);

  recalcular();
});

// Si la persona escribe la cantidad a mano, también se recalcula
lista.addEventListener("input", recalcular);


// ----------------------------------------
// BOTÓN CONTINUAR
// ----------------------------------------

continuar.addEventListener("click", () => {

  const carrito = [];

  lista.querySelectorAll(".producto").forEach(fila => {

    const cantidad = parseInt(fila.querySelector("input").value, 10) || 0;

    if (cantidad > 0) {
      const p = productos.find(x => x.id === Number(fila.dataset.id));
      carrito.push({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad });
    }
  });

  if (!carrito.length) return;

  Almacen.guardar("carrito", carrito);

  // Si está editando, se conserva el número del pedido en la dirección
  location.href = idEditar ? `pedido.html?editar=${idEditar}` : "pedido.html";
});


// ----------------------------------------
// CARGAR LA CARTA DESDE LA BASE DE DATOS
// ----------------------------------------

lista.innerHTML = '<li class="vacio">Cargando la carta…</li>';

cargarProductosApi()
  .then(datos => {
    productos = datos;
    dibujarProductos();
    cargarCantidades();
    recalcular();
  })
  .catch(error => {
    lista.innerHTML = `<li class="error">${esc(error.message)}</li>`;
  });

// Calcular el total apenas carga la página
recalcular();
