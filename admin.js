// ========================================
// admin.js · acceso, pedidos y catálogo del administrador
// ========================================

// El usuario y la clave se validan en el servidor (api/sesion_admin.php).


// ----------------------------------------
// AYUDAS
// ----------------------------------------

const $ = id => document.getElementById(id);

const ESTADOS = ["pendiente", "en_preparacion", "entregado", "anulado"];

const nombreEstado = e => e.replace("_", " ");

// Texto de cada opción del selector de estado.
// "anulado" se ve como "anular pedido" mientras el pedido siga activo.
const textoOpcion = (estado, actual) =>
  estado === "anulado" && actual !== "anulado" ? "anular pedido" : nombreEstado(estado);


// ----------------------------------------
// MOSTRAR LOGIN O PANEL
// ----------------------------------------

function mostrarPanel(activo) {
  $("vista-login").hidden = activo;
  $("vista-panel").hidden = !activo;

  if (activo) {
    pintarPedidos();
    pintarCatalogo();
  }
}


// ----------------------------------------
// INICIAR Y CERRAR SESIÓN
// ----------------------------------------

$("form-login").addEventListener("submit", async e => {
  e.preventDefault();

  const d = Object.fromEntries(new FormData(e.target));

  try {
    await pedirApi("api/sesion_admin.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: d.usuario.trim(), clave: d.clave })
    });
    $("error-login").hidden = true;
    mostrarPanel(true);
  } catch (error) {
    $("error-login").textContent = error.message;
    $("error-login").hidden = false;
    $("clave").value = "";
  }
});

$("ver-clave").addEventListener("change", e => {
  $("clave").type = e.target.checked ? "text" : "password";
});

$("salir").addEventListener("click", async () => {
  try {
    await pedirApi("api/sesion_admin.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salir: true })
    });
  } catch (error) { /* si falla, igual se muestra el login */ }
  mostrarPanel(false);
});


// ----------------------------------------
// PESTAÑAS (Pedidos / Catálogo)
// ----------------------------------------

document.querySelectorAll(".pestana").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".pestana").forEach(b => b.classList.toggle("activa", b === btn));
  $("panel-pedidos").hidden = btn.dataset.vista !== "pedidos";
  $("panel-catalogo").hidden = btn.dataset.vista !== "catalogo";
  $("panel-nuevo").hidden = btn.dataset.vista !== "nuevo";
}));


// ========================================
// PEDIDOS
// ========================================

async function pintarPedidos() {

  let pedidos;

  try {
    pedidos = (await pedirApi("api/pedidos_admin.php")).pedidos;
  } catch (error) {
    $("panel-pedidos").innerHTML = `<p class="error">${esc(error.message)}</p>`;
    return;
  }

  $("panel-pedidos").innerHTML = pedidos.length ? pedidos.map(p => `
    <article class="pedido estado-${p.estado}">
      <header><h2>#${p.id} · ${esc(p.nombre)}</h2><span class="etiqueta">${nombreEstado(p.estado)}</span></header>
      <p>${esc(p.piso)}, oficina ${esc(p.oficina)} · ${esc(p.metodo)} ·
         ${new Date(p.fecha).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}</p>
      <ul>${p.items.map(i => `<li>${i.cantidad} × ${esc(i.nombre)}</li>`).join("")}</ul>
      <footer><b>${dinero(p.total)}</b>
        <select data-pedido="${p.id}" aria-label="Estado del pedido ${p.id}">
          ${ESTADOS.map(e => `<option value="${e}"${e === p.estado ? " selected" : ""}>${textoOpcion(e, p.estado)}</option>`).join("")}
        </select>
      </footer>
    </article>`).join("") : '<p class="vacio">No hay pedidos todavía.</p>';
}

// Cambiar el estado de un pedido (se guarda en la base de datos)
$("panel-pedidos").addEventListener("change", async e => {

  const sel = e.target.closest("select[data-pedido]");
  if (!sel) return;

  // Pedir confirmación antes de anular
  if (sel.value === "anulado" && !confirm(`¿Seguro que quieres anular el pedido #${sel.dataset.pedido}?`)) {
    pintarPedidos();   // vuelve a mostrar el estado anterior
    return;
  }

  try {
    await pedirApi("api/pedidos_admin.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(sel.dataset.pedido), estado: sel.value })
    });
  } catch (error) {
    alert(error.message);
  }

  pintarPedidos();
});


// ========================================
// CATÁLOGO
// Los productos viven en la base de datos (api/productos_admin.php).
// ========================================

// Enviar una acción sobre los productos (crear, imagen, activo, eliminar)
function accionProducto(datos) {
  return pedirApi("api/productos_admin.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
}


// ----------------------------------------
// DIBUJAR LA LISTA (igual que en la carta:
// imagen, nombre, precio y descripción)
// ----------------------------------------

async function pintarCatalogo() {

  let productos;

  try {
    productos = (await pedirApi("api/productos_admin.php")).productos;
  } catch (error) {
    $("lista-admin").innerHTML = `<li class="error">${esc(error.message)}</li>`;
    return;
  }

  $("lista-admin").innerHTML = productos.length ? productos.map(p => `
    <li class="producto${p.activo ? "" : " inactivo"}">

      <div class="producto-info">
        ${p.imagen ? `<img class="producto-img" src="${esc(p.imagen)}" alt="${esc(p.nombre)}">` : ""}
        <h2>${esc(p.nombre)}</h2>
        <p class="precio">${dinero(p.precio)}</p>
        ${p.descripcion ? `<p class="descripcion">${esc(p.descripcion)}</p>` : ""}
      </div>

      <div class="acciones-producto">

        <label class="btn secundario">
          ${p.imagen ? "Cambiar imagen" : "Poner imagen"}
          <input type="file" accept="image/*" data-imagen="${p.id}" hidden>
        </label>

        <button class="btn secundario" data-producto="${p.id}" data-activo="${p.activo ? 1 : 0}">${p.activo ? "Desactivar" : "Activar"}</button>

        <button class="btn secundario peligro" data-eliminar="${p.id}" data-nombre="${esc(p.nombre)}">Eliminar</button>

      </div>

    </li>`).join("") : '<li class="vacio">Todavía no hay productos.</li>';
}


// ----------------------------------------
// ACTIVAR / DESACTIVAR UN PRODUCTO
// ----------------------------------------

$("lista-admin").addEventListener("click", async e => {

  const btn = e.target.closest("[data-producto]");
  if (!btn) return;

  try {
    await accionProducto({
      accion: "activo",
      id: Number(btn.dataset.producto),
      activo: btn.dataset.activo !== "1"
    });
  } catch (error) {
    alert(error.message);
  }

  pintarCatalogo();
});


// ----------------------------------------
// ELIMINAR UN PRODUCTO
// ----------------------------------------

$("lista-admin").addEventListener("click", async e => {

  const btn = e.target.closest("[data-eliminar]");
  if (!btn) return;

  // Pedir confirmación antes de borrar
  if (!confirm(`¿Seguro que quieres eliminar "${btn.dataset.nombre}"? Esta acción no se puede deshacer.`)) return;

  try {
    const respuesta = await accionProducto({ accion: "eliminar", id: Number(btn.dataset.eliminar) });

    if (respuesta.desactivado) {
      alert("Este producto ya aparece en pedidos, así que no se puede borrar. Quedó desactivado y ya no se muestra en la carta.");
    }
  } catch (error) {
    alert(error.message);
  }

  pintarCatalogo();
});


// ----------------------------------------
// REDUCIR LA IMAGEN
// Convierte la foto elegida en una imagen más liviana
// (máximo 600 px de ancho) para que quepa en el navegador.
// ----------------------------------------

function reducirImagen(archivo) {

  return new Promise((resolver, rechazar) => {

    const lector = new FileReader();

    lector.onerror = () => rechazar(new Error("No se pudo leer la imagen."));

    lector.onload = () => {

      const img = new Image();

      img.onerror = () => rechazar(new Error("El archivo no es una imagen válida."));

      img.onload = () => {

        const ANCHO_MAXIMO = 600;
        const escala = Math.min(1, ANCHO_MAXIMO / img.width);

        const lienzo = document.createElement("canvas");
        lienzo.width = Math.round(img.width * escala);
        lienzo.height = Math.round(img.height * escala);

        const pincel = lienzo.getContext("2d");

        // Fondo blanco (por si la imagen tiene partes transparentes)
        pincel.fillStyle = "#fff";
        pincel.fillRect(0, 0, lienzo.width, lienzo.height);
        pincel.drawImage(img, 0, 0, lienzo.width, lienzo.height);

        resolver(lienzo.toDataURL("image/jpeg", 0.7));
      };

      img.src = lector.result;
    };

    lector.readAsDataURL(archivo);
  });
}


// ----------------------------------------
// MOSTRAR UN ERROR EN EL FORMULARIO DE PRODUCTO
// ----------------------------------------

function mostrarErrorProducto(mensaje) {
  $("error-producto").textContent = mensaje;
  $("error-producto").hidden = false;
}


// ----------------------------------------
// PONER O CAMBIAR LA IMAGEN DE UN PRODUCTO QUE YA EXISTE
// ----------------------------------------

$("lista-admin").addEventListener("change", async e => {

  const input = e.target.closest("input[data-imagen]");
  if (!input || !input.files[0]) return;

  try {
    const imagen = await reducirImagen(input.files[0]);
    await accionProducto({ accion: "imagen", id: Number(input.dataset.imagen), imagen });
  } catch (error) {
    alert(error.message);
  }

  pintarCatalogo();
});


// ----------------------------------------
// AGREGAR UN PRODUCTO NUEVO (se guarda en la base de datos)
// ----------------------------------------

$("form-producto").addEventListener("submit", async e => {

  e.preventDefault();

  const formulario = e.target;
  const d = Object.fromEntries(new FormData(formulario));
  const precio = Number(d.precio);

  if (!d.nombre.trim() || !(precio >= 0)) return;

  const boton = formulario.querySelector("button");
  $("error-producto").hidden = true;

  // Evitar que se envíe dos veces si la persona hace clic de nuevo
  boton.disabled = true;

  try {

    // 1. Preparar la imagen (es opcional)
    let imagen = "";

    if (d.imagen && d.imagen.size > 0) {
      imagen = await reducirImagen(d.imagen);
    }

    // 2. Guardar el producto en la base de datos
    await accionProducto({
      accion: "crear",
      nombre: d.nombre.trim(),
      precio,
      descripcion: d.descripcion.trim(),
      imagen
    });

  } catch (error) {
    mostrarErrorProducto(error.message);
    boton.disabled = false;
    return;
  }

  boton.disabled = false;

  // 3. Limpiar el formulario y actualizar la lista
  formulario.reset();
  pintarCatalogo();

  // 4. Volver a la pestaña Catálogo para ver el producto agregado
  document.querySelector('.pestana[data-vista="catalogo"]').click();
});


// ----------------------------------------
// AL CARGAR LA PÁGINA
// ----------------------------------------

pedirApi("api/sesion_admin.php")
  .then(d => mostrarPanel(d.activa))
  .catch(() => mostrarPanel(false));