// ========================================
// pedido.js · formulario de datos (pedido.html) y confirmación (confirmacion.html)
// El pedido ahora se guarda en la base de datos (api/pedido.php).
// ========================================

const form = document.getElementById("form-datos");

if (form) {

  // ----------------------------------------
  // LEER EL CARRITO (si está vacío, volvemos a la carta)
  // ----------------------------------------

  const carrito = Almacen.leer("carrito", []);
  if (!carrito.length) location.href = "menu.html";

  const suma = carrito.reduce((t, i) => t + i.precio * i.cantidad, 0);

  document.getElementById("ticket-items").innerHTML = carrito.map(i =>
    `<li><span>${i.cantidad} × ${esc(i.nombre)}</span><span>${dinero(i.precio * i.cantidad)}</span></li>`).join("");
  document.getElementById("ticket-total").textContent = dinero(suma);


  // ----------------------------------------
  // OPCIONES DE PISO Y MÉTODO DE PAGO
  // ----------------------------------------

  const opciones = (lista, texto) =>
    `<option value="">${texto}</option>` + lista.map(x => `<option>${x}</option>`).join("");

  document.getElementById("piso").innerHTML = opciones(PISOS, "Elige un piso");
  document.getElementById("metodo").innerHTML = opciones(METODOS, "Elige un método");


  // ----------------------------------------
  // ¿ESTAMOS EDITANDO UN PEDIDO QUE YA SE ENVIÓ?
  // Pasa cuando la dirección es pedido.html?editar=8
  // ----------------------------------------

  const idEditar = new URLSearchParams(location.search).get("editar");
  const ultimoPedido = Almacen.leer("ultimoPedido", null);
  const editando = Boolean(idEditar) && ultimoPedido && String(ultimoPedido.id) === idEditar;

  const enlaceCambiar = document.querySelector(".ticket a");   // el enlace "Cambiar productos"

  if (editando) {
    form.querySelector("button").textContent = "Guardar cambios";
    enlaceCambiar.href = `menu.html?editar=${idEditar}`;   // al volver a la carta sigue editando
  }


  // ----------------------------------------
  // BORRADOR DEL FORMULARIO
  // Guarda lo que la persona escribe, para que no se pierda
  // si va a "Cambiar productos" y vuelve.
  // ----------------------------------------

  const CAMPOS = ["nombre", "correo", "piso", "oficina", "metodo"];

  function guardarBorrador() {
    sessionStorage.setItem("borradorFormulario", JSON.stringify(Object.fromEntries(new FormData(form))));
  }

  // Si hay borrador se usa; si no, y está editando, se usan los datos del pedido enviado
  const borrador = JSON.parse(sessionStorage.getItem("borradorFormulario") || "null");
  const datosIniciales = borrador || (editando ? ultimoPedido.datos : null);

  if (datosIniciales) {
    CAMPOS.forEach(campo => { form.elements[campo].value = datosIniciales[campo] ?? ""; });
  }

  form.addEventListener("input", guardarBorrador);
  form.addEventListener("change", guardarBorrador);
  enlaceCambiar.addEventListener("click", guardarBorrador);


  // ----------------------------------------
  // MOSTRAR UN ERROR
  // ----------------------------------------

  const aviso = document.getElementById("error");

  function mostrarError(mensaje) {
    aviso.textContent = mensaje;
    aviso.hidden = false;
  }


  // ----------------------------------------
  // ENVIAR EL PEDIDO
  // ----------------------------------------

  form.addEventListener("submit", async e => {

    e.preventDefault();

    // Revisar que todos los campos tengan algo
    let hayError = false;

    form.querySelectorAll("input, select").forEach(campo => {
      const vacio = !campo.value.trim();
      campo.classList.toggle("invalido", vacio);
      if (vacio) hayError = true;
    });

    if (hayError) {
      mostrarError("Por favor completa todos los campos.");
      return;
    }

    aviso.hidden = true;

    const d = Object.fromEntries(new FormData(form));
    const boton = form.querySelector("button");

    // Evitar que se envíe dos veces si la persona hace clic de nuevo
    boton.disabled = true;

    try {

      const datos = {
        nombre: d.nombre.trim(),
        correo: d.correo.trim(),
        piso: d.piso,
        oficina: d.oficina.trim(),
        metodo: d.metodo
      };

      const pedido = {
        ...datos,
        productos: carrito.map(i => ({ id: i.id, cantidad: i.cantidad }))
      };

      // Si está editando, se manda el número del pedido (y el correo con el
      // que se hizo, para comprobar que es suyo) y el servidor lo actualiza
      if (editando) {
        pedido.id = Number(idEditar);
        pedido.correo_original = ultimoPedido.datos.correo;
      }

      const respuesta = await enviarPedidoApi(pedido);

      // Se guarda el pedido enviado para poder editarlo después
      Almacen.guardar("ultimoPedido", { id: respuesta.id, productos: carrito, datos });

      localStorage.removeItem("carrito");
      sessionStorage.removeItem("borradorFormulario");
      location.href = `confirmacion.html?id=${respuesta.id}`;

    } catch (error) {

      mostrarError(error.message);
      boton.disabled = false;
    }
  });
}


// ----------------------------------------
// TÍTULO DE LA PÁGINA DE CONFIRMACIÓN
// ----------------------------------------

const titulo = document.getElementById("titulo-confirmacion");

if (titulo) {
  const id = new URLSearchParams(location.search).get("id");
  if (id) titulo.textContent = `Pedido #${id} enviado`;
}