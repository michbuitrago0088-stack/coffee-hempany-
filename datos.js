// ========================================
// datos.js · datos base y funciones compartidas
// ========================================


// ----------------------------------------
// LISTAS FIJAS
// ----------------------------------------

const PISOS = ["Piso 1", "Piso 2", "Piso 3", "Piso 4", "Piso 5"];

const METODOS = ["Efectivo", "Transferencia", "Tarjeta"];


// ----------------------------------------
// PRODUCTOS INICIALES
// Cada producto tiene: id, nombre, precio, activo,
// imagen (ruta dentro de la carpeta img) y descripcion.
// ----------------------------------------

const PRODUCTOS_INICIALES = [
  {
    id: 1,
    nombre: "Capuccino",
    precio: 5500,
    activo: true,
    imagen: "img/capuccino.jpg",
    descripcion: "Espresso con leche vaporizada y una capa de espuma cremosa."
  },
  {
    id: 2,
    nombre: "Café americano",
    precio: 4000,
    activo: true,
    imagen: "img/americano.jpg",
    descripcion: "Espresso suave alargado con agua caliente, para tomar con calma."
  },
  {
    id: 3,
    nombre: "Frappe de café",
    precio: 10000,
    activo: true,
    imagen: "img/cafefrappe.jpg",
    descripcion: "Café frío licuado con hielo, crema batida y salsa de caramelo."
  },
  {
    id: 4,
    nombre: "Cheesecake",
    precio: 13500,
    activo: true,
    imagen: "img/Cheesecake.jpg",
    descripcion: "Porción cremosa de cheesecake de la casa, ideal para acompañar tu café."
  },
  {
    id: 5,
    nombre: "Brownie de chocolate",
    precio: 7000,
    activo: true,
    imagen: "img/browniedechocolate.jpg",
    descripcion: "Brownie de chocolate húmedo, con salsa de chocolate y trozos de avellana."
  },
];


// ----------------------------------------
// ALMACÉN (guarda y lee datos en el navegador)
// ----------------------------------------

const Almacen = {

  leer(clave, defecto) {
    try {
      return JSON.parse(localStorage.getItem(clave)) ?? defecto;
    } catch {
      return defecto;
    }
  },

  guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  },

};


// ----------------------------------------
// OBTENER PRODUCTOS
// ----------------------------------------

function obtenerProductos() {

  let lista = Almacen.leer("productos", null);

  // Si todavía no hay productos guardados, usamos los iniciales
  if (!lista) {
    lista = PRODUCTOS_INICIALES;
    Almacen.guardar("productos", lista);
  }

  // Si un producto guardado no tiene imagen o descripción,
  // se las ponemos desde la lista inicial (buscando por id)
  lista.forEach(p => {
    const base = PRODUCTOS_INICIALES.find(x => x.id === p.id);
    if (base) {
      if (!p.imagen) p.imagen = base.imagen;
      if (!p.descripcion) p.descripcion = base.descripcion;
    }
  });

  return lista;
}


// ----------------------------------------
// FUNCIONES DE AYUDA
// ----------------------------------------

// Convierte un número en dinero: 5500 -> $5.500
const dinero = n => "$" + Number(n).toLocaleString("es-CO");

// Protege el texto para que no se interprete como código HTML
const esc = t => String(t).replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));