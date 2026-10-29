// carrusel.js · carrusel de fotos que rueda sin parar
const VELOCIDAD = 0.18; // fotos por segundo (sube el número para que ruede más rápido)

const pista = document.getElementById("pista");
const carrusel = pista.parentElement;
const puntos = document.getElementById("puntos");
const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;

const originales = [...pista.children];
const total = originales.length;

// Si falta una foto en img/, se muestra un color con el nombre del producto
function prepararFoto(diapositiva) {
  const img = diapositiva.querySelector("img");
  const marcarSinFoto = () => diapositiva.classList.add("sin-foto");
  img.addEventListener("error", marcarSinFoto);
  if (img.complete && img.naturalWidth === 0) marcarSinFoto();
}
originales.forEach(prepararFoto);

// Copia de la primera foto al final para que el giro no tenga cortes
const copia = originales[0].cloneNode(true);
copia.setAttribute("aria-hidden", "true");
pista.appendChild(copia);
prepararFoto(copia);

let posicion = 0;      // posición en fotos: 0 = primera, 1 = segunda, ...
let indiceActivo = -1;

// Puntos: al tocar uno, el carrusel salta a esa foto y sigue rodando
originales.forEach((_, i) => {
  const punto = document.createElement("button");
  punto.setAttribute("aria-label", `Ir a la foto ${i + 1}`);
  punto.addEventListener("click", () => { posicion = i; dibujar(); });
  puntos.appendChild(punto);
});

function dibujar() {
  if (posicion >= total) posicion -= total;
  pista.style.transform = `translateX(${-posicion * 100}%)`;
  const indice = Math.round(posicion) % total;
  if (indice !== indiceActivo) {
    indiceActivo = indice;
    [...puntos.children].forEach((p, i) => p.setAttribute("aria-current", i === indice));
  }
}

let ultimo = null;
function avanzar(tiempo) {
  if (ultimo !== null) posicion += VELOCIDAD * Math.min(tiempo - ultimo, 50) / 1000;
  ultimo = tiempo;
  dibujar();
  requestAnimationFrame(avanzar);
}

dibujar();
if (!sinMovimiento) requestAnimationFrame(avanzar);
