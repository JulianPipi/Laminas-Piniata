// =============================================================
// Laminas Piniata — capa de datos
// Toda la info del catálogo vive en /data/products.json.
// Para agregar diseños nuevos: sumar objetos a ese archivo y
// poner la imagen en /images/fototorta/ o /images/chocotransfer/.
// =============================================================

const WHATSAPP_NUMERO = "5491133750433"; // 11 3375-0433 en formato internacional

const CATEGORIAS = [
  "Futbol",
  "Dibujos animados",
  "Disney",
  "Basquet",
  "Peliculas",
  "Series",
  "Animales",
  "Cumpleanos",
  "Juegos",
  "Personalizado",
  "Halloween",
];

let PRODUCTOS_CACHE = null;

async function cargarProductos() {
  if (PRODUCTOS_CACHE) return PRODUCTOS_CACHE;
  let data = [];
  try {
    const res = await fetch("data/products.json?v=" + Date.now());
    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    console.warn("No se pudo cargar data/products.json remoto:", err);
  }

  // Integrar cambios realizados en el panel Admin (Modo Estático / Local)
  try {
    const local = localStorage.getItem("laminas_productos_guardados");
    if (local) {
      const prodsLocal = JSON.parse(local);
      if (Array.isArray(prodsLocal) && prodsLocal.length > 0) {
        prodsLocal.forEach(pLocal => {
          const idx = data.findIndex(p => p.id === pLocal.id || (p.nombre && pLocal.nombre && p.nombre.toLowerCase() === pLocal.nombre.toLowerCase()));
          if (idx >= 0) {
            data[idx] = pLocal;
          } else {
            data.push(pLocal);
          }
        });
      }
    }
  } catch (e) {
    console.warn("Error leyendo productos de localStorage:", e);
  }

  PRODUCTOS_CACHE = data
    .filter((p) => p.activo !== false)
    .map((p) => ({
      ...p,
      imagen: p.imagen && p.imagen.startsWith("/") ? p.imagen.slice(1) : p.imagen,
    }));
  return PRODUCTOS_CACHE;
}

function formatoPrecio(n) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

function normalizarTexto(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function filtrarProductos(productos, { tipo, categoria, subcategoria, texto } = {}) {
  const t = normalizarTexto(texto);
  return productos.filter((p) => {
    if (tipo && p.tipo !== tipo) return false;
    if (categoria && categoria !== "todas" && p.categoria !== categoria) return false;
    if (subcategoria && subcategoria !== "todas" && p.subcategoria !== subcategoria) return false;
    if (t) {
      const nombreNorm = normalizarTexto(p.nombre);
      const catNorm = normalizarTexto(p.categoria);
      const subNorm = normalizarTexto(p.subcategoria);
      if (!nombreNorm.includes(t) && !catNorm.includes(t) && !subNorm.includes(t)) {
        return false;
      }
    }
    return true;
  });
}

function subcategoriasDe(productos, categoria) {
  if (!categoria || categoria === "todas") return [];
  const set = new Set(
    productos
      .filter((p) => p.categoria === categoria && p.subcategoria)
      .map((p) => p.subcategoria)
  );
  return [...set];
}
