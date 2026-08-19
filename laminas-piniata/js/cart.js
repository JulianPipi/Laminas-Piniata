// =============================================================
// Laminas Piniata — carrito / "Mi pedido"
// Se guarda en localStorage para que sobreviva la navegación
// entre páginas (todo del lado del cliente, sin cuentas).
// =============================================================

const CART_KEY = "laminaspiniata_pedido";
const COMBO_MINIMO = 10; // a partir de esta cantidad total se avisa el combo

function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function guardarCarrito(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  actualizarContadorCarrito();
}

function agregarAlCarrito(producto, cantidad = 1) {
  const items = leerCarrito();
  const existente = items.find((i) => i.id === producto.id);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    items.push({
      id: producto.id,
      nombre: producto.nombre,
      tipo: producto.tipo,
      categoria: producto.categoria,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad,
    });
  }
  guardarCarrito(items);
}

function cambiarCantidad(id, delta) {
  const items = leerCarrito();
  const item = items.find((i) => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  const filtrados = item.cantidad <= 0 ? items.filter((i) => i.id !== id) : items;
  guardarCarrito(filtrados);
}

function eliminarDelCarrito(id) {
  guardarCarrito(leerCarrito().filter((i) => i.id !== id));
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

  let msg = `Hola! Quiero hacer un pedido en Laminas Piniata 🎉%0A`;
  msg += `Nombre: ${datos.nombre}%0A`;
  msg += `Fecha de entrega deseada: ${datos.fecha}%0A`;
  msg += `Horario disponible: ${datos.horario}%0A%0A`;

  if (fototortas.length) {
    msg += `🍰 Fototortas%0A`;
    fototortas.forEach((i) => {
      msg += `- ${i.nombre} x${i.cantidad} (${formatoPrecio(i.precio * i.cantidad)})%0A`;
    });
    msg += `%0A`;
  }
  if (chocotransfers.length) {
    msg += `🍫 Chocotransfer%0A`;
    chocotransfers.forEach((i) => {
      msg += `- ${i.nombre} x${i.cantidad} (${formatoPrecio(i.precio * i.cantidad)})%0A`;
    });
    msg += `%0A`;
  }

  const total = totalPedido(items);
  msg += `Total estimado: ${formatoPrecio(total)}%0A`;
  if (totalUnidades(items) >= COMBO_MINIMO) {
    msg += `(Pedido de ${totalUnidades(items)} unidades, ¿aplica combo?)%0A`;
  }
  msg += `%0A¿Me confirman disponibilidad y forma de pago? Gracias!`;

  return `https://wa.me/${WHATSAPP_NUMERO}?text=${msg}`;
}

document.addEventListener("DOMContentLoaded", actualizarContadorCarrito);
