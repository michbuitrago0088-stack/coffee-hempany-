// ========================================
// layout.js · cabecera y pie compartidos en todas las páginas
// ========================================


// ----------------------------------------
// LOGO DE LA CAFETERÍA
// Cambia la ruta si tu archivo se llama distinto
// ----------------------------------------

const LOGO = "img/logo.png";


// ----------------------------------------
// ENLACES DEL MENÚ
// Cada uno es [archivo, texto que se ve]
// ----------------------------------------

const ENLACES = [
  ["index.html", "Inicio"],
  ["menu.html", "Carta"],
  ["nosotros.html", "Nosotros"],
  ["contacto.html", "Contacto"],
  ["admin.html", "Admin"],
];

// Nombre de la página en la que estamos (para marcar el enlace activo)
const actual = location.pathname.split("/").pop() || "index.html";


// ----------------------------------------
// CABECERA
// ----------------------------------------

document.getElementById("cabecera").innerHTML = `
  <a class="logo" href="index.html">
    <img src="${LOGO}" alt="Hempany Coffee">
  </a>
  <button class="burger" id="burger" aria-label="Abrir menú" aria-expanded="false">Menú</button>
  <nav id="nav">${ENLACES.map(([url, texto]) =>
    `<a href="${url}"${url === actual ? ' aria-current="page"' : ""}>${texto}</a>`).join("")}</nav>`;


// ----------------------------------------
// PIE DE PÁGINA
// ----------------------------------------

document.getElementById("pie").textContent = "© Hempany Coffee · Pedidos a tu oficina";


// ----------------------------------------
// BOTÓN DE MENÚ EN CELULAR
// ----------------------------------------

document.getElementById("burger").addEventListener("click", e => {
  const abierto = document.getElementById("nav").classList.toggle("abierto");
  e.currentTarget.setAttribute("aria-expanded", abierto);
});