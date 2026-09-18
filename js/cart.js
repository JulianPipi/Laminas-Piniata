// =============================================================
// Laminas Piniata — carrito / "Mi pedido"
// Se guarda en localStorage para que sobreviva la navegación
// entre páginas (todo del lado del cliente, sin cuentas).
// =============================================================

const CART_KEY = "laminaspiniata_pedido";
const COMBO_MINIMO = 10; // a partir de esta cantidad total se avisa el combo

function leerCarrito() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    let modificado = false;
    const sanitizados = raw.map((item, idx) => {
      if (!item.id) {
        item.id = "custom-" + idx;
        modificado = true;
      }
      // Evitar que imágenes gigantes base64 congelen el navegador
      if (item.imagen && item.imagen.startsWith("data:") && item.imagen.length > 80000) {
        item.imagen = "images/fototorta/Stitch Redondo.jpg";
        modificado = true;
      }
      return item;
    });
    if (modificado) {
      localStorage.setItem(CART_KEY, JSON.stringify(sanitizados));
    }
    return sanitizados;
  } catch {
    return [];
  }
}

function guardarCarrito(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  actualizarContadorCarrito();
}

function vaciarCarrito() {
  localStorage.removeItem(CART_KEY);
  actualizarContadorCarrito();
}

function agregarAlCarrito(producto, cantidad = 1) {
  const items = leerCarrito();
  const existente = items.find((i) => String(i.id) === String(producto.id));
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    items.push({
      id: producto.id,
      nombre: producto.nombre,
      tipo: producto.tipo,
      categoria: producto.categoria,
      precio: producto.precio,
      imagen: producto.imagen || "images/fototorta/Stitch Redondo.jpg",
      cantidad,
    });
  }
  guardarCarrito(items);
}

function cambiarCantidad(id, delta, index = null) {
  const items = leerCarrito();
  let item = null;
  if (id !== undefined && id !== null && id !== "" && id !== "undefined" && id !== "null") {
    item = items.find((i) => String(i.id) === String(id));
  }
  if (!item && index !== null && items[index]) {
    item = items[index];
  }
  if (!item) return;
  item.cantidad += delta;
  const filtrados = item.cantidad <= 0 ? items.filter((i) => i !== item) : items;
  guardarCarrito(filtrados);
}

function eliminarDelCarrito(id, index = null) {
  let items = leerCarrito();
  const initLen = items.length;
  if (id !== undefined && id !== null && id !== "" && id !== "undefined" && id !== "null") {
    items = items.filter((i) => String(i.id) !== String(id));
  }
  if (items.length === initLen && index !== null && index >= 0 && index < initLen) {
    items.splice(index, 1);
  }
  guardarCarrito(items);
}

function totalUnidades(items) {
  return items.reduce((acc, i) => acc + i.cantidad, 0);
}

function totalPedido(items) {
  return items.reduce((acc, i) => acc + i.cantidad * i.precio, 0);
}

function actualizarContadorCarrito() {
  const count = totalUnidades(leerCarrito());
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "inline-flex" : "none";
  });
}

function construirMensajeWhatsApp(items, datos) {
  const fototortas = items.filter((i) => i.tipo === "fototorta");
  const chocotransfers = items.filter((i) => i.tipo === "chocotransfer");

  let msg = `Hola! Quiero hacer un pedido en Laminas Piniata 🎉\n\n`;
  msg += `👤 Nombre: ${datos.nombre}\n`;
  msg += `📅 Fecha de entrega deseada: ${datos.fecha}\n`;
  msg += `⏰ Horario disponible: ${datos.horario}\n\n`;

  if (fototortas.length) {
    msg += `🍰 Fototortas:\n`;
    fototortas.forEach((i) => {
      msg += `- ${i.nombre} x${i.cantidad} (${formatoPrecio(i.precio * i.cantidad)})\n`;
    });
    msg += `\n`;
  }
  if (chocotransfers.length) {
    msg += `🍫 Chocotransfer:\n`;
    chocotransfers.forEach((i) => {
      msg += `- ${i.nombre} x${i.cantidad} (${formatoPrecio(i.precio * i.cantidad)})\n`;
    });
    msg += `\n`;
  }

  const total = totalPedido(items);
  msg += `💵 Total estimado: ${formatoPrecio(total)}\n`;
  if (totalUnidades(items) >= COMBO_MINIMO) {
    msg += `🎁 (Pedido de ${totalUnidades(items)} unidades, ¿aplica combo?)\n`;
  }
  msg += `\n¿Me confirman disponibilidad y forma de pago? ¡Muchas gracias!`;

  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;
}

document.addEventListener("DOMContentLoaded", actualizarContadorCarrito);
