// =============================================================
// Laminas Piniata — catálogo (usado por fototortas.html y
// chocotransfer.html). El tipo de producto viene del atributo
// data-tipo del <body>.
// =============================================================

document.addEventListener("DOMContentLoaded", async () => {
  const tipo = document.body.dataset.tipo; // "fototorta" | "chocotransfer"
  const grid = document.getElementById("grid-productos");
  const buscador = document.getElementById("buscador");
  const selectCategoria = document.getElementById("select-categoria");
  const resultCount = document.getElementById("result-count");
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const modalNombre = document.getElementById("modal-nombre");
  const modalCategoria = document.getElementById("modal-categoria");
  const modalPrecio = document.getElementById("modal-precio");
  const modalAgregar = document.getElementById("modal-agregar");

  const todos = await cargarProductos();
  const delTipo = todos.filter((p) => p.tipo === tipo);

  // poblar select de categorías con las que realmente existen
  const categoriasPresentes = [...new Set(delTipo.map((p) => p.categoria))];
  categoriasPresentes.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    selectCategoria.appendChild(opt);
  });

  // si vino ?categoria=Futbol en la URL (desde la home), preseleccionar
  const params = new URLSearchParams(location.search);
  const catInicial = params.get("categoria");
  if (catInicial && categoriasPresentes.includes(catInicial)) {
    selectCategoria.value = catInicial;
  }

  function render() {
    const filtrados = filtrarProductos(delTipo, {
      tipo,
      categoria: selectCategoria.value,
      texto: buscador.value,
    });

    resultCount.textContent = `${filtrados.length} diseño${filtrados.length === 1 ? "" : "s"} encontrados`;

    if (!filtrados.length) {
      grid.innerHTML = `<div class="empty-state">No encontramos diseños con esa búsqueda. Probá con otra categoría o palabra clave.</div>`;
      return;
    }

    grid.innerHTML = filtrados
      .map(
        (p) => `
      <article class="product-card">
        <div class="product-thumb" data-abrir-modal="${p.id}">
          ${p.destacado ? '<span class="badge-destacado">Destacado</span>' : ""}
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" />
        </div>
        <div class="product-body">
          <span class="product-cat">${p.categoria}</span>
          <span class="product-name">${p.nombre}</span>
          <span class="product-price">${formatoPrecio(p.precio)}</span>
          <div class="product-actions">
            <button class="btn btn-rosa btn-sm btn-block" data-agregar="${p.id}">Agregar al pedido</button>
          </div>
        </div>
      </article>`
      )
      .join("");

    grid.querySelectorAll("[data-agregar]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = delTipo.find((x) => x.id == btn.dataset.agregar);
        agregarAlCarrito(p);
        btn.textContent = "¡Agregado! ✓";
        setTimeout(() => (btn.textContent = "Agregar al pedido"), 1100);
      });
    });

    grid.querySelectorAll("[data-abrir-modal]").forEach((el) => {
      el.addEventListener("click", () => {
        const p = delTipo.find((x) => x.id == el.dataset.abrirModal);
        abrirModal(p);
      });
    });
  }

  function abrirModal(p) {
    modalImg.src = p.imagen;
    modalImg.alt = p.nombre;
    modalNombre.textContent = p.nombre;
    modalCategoria.textContent = p.categoria;
    modalPrecio.textContent = formatoPrecio(p.precio);
    modalAgregar.onclick = () => {
      agregarAlCarrito(p);
      modalAgregar.textContent = "¡Agregado! ✓";
      setTimeout(() => (modalAgregar.textContent = "Agregar al pedido"), 1100);
    };
    modal.classList.add("open");
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-cerrar-modal]")) {
      modal.classList.remove("open");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.classList.remove("open");
  });

  buscador.addEventListener("input", render);
  selectCategoria.addEventListener("change", render);

  render();
});
