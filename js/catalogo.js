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
  const selectSubcategoria = document.getElementById("select-subcategoria");
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

  function actualizarSubcategorias() {
    const subs = subcategoriasDe(delTipo, selectCategoria.value);
    if (!subs.length) {
      selectSubcategoria.innerHTML = `<option value="todas">Todas las subcategorías</option>`;
      selectSubcategoria.style.display = "none";
      return;
    }
    selectSubcategoria.style.display = "";
    selectSubcategoria.innerHTML =
      `<option value="todas">Todas las subcategorías</option>` +
      subs.map((s) => `<option value="${s}">${s}</option>`).join("");
  }
  actualizarSubcategorias();

  function render() {
    const filtrados = filtrarProductos(delTipo, {
      tipo,
      categoria: selectCategoria.value,
      subcategoria: selectSubcategoria.value,
      texto: buscador.value,
    });

    resultCount.textContent = `${filtrados.length} diseño${filtrados.length === 1 ? "" : "s"} encontrados`;

    if (!filtrados.length) {
      const termino = (buscador.value || "").trim();
      const msgWsp = termino
        ? encodeURIComponent(`Hola! Estaba buscando "${termino}" en su web y no lo encontré. ¿Hacen láminas personalizadas con ese diseño?`)
        : encodeURIComponent("Hola! Quisiera consultar por un diseño personalizado que no encontré en el catálogo.");
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 36px 20px;">
          <p style="font-size: 1.05rem; font-weight:600; margin-bottom: 8px;">No encontramos diseños listos para esa búsqueda.</p>
          <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 20px; max-width: 480px; margin-left: auto; margin-right: auto;">
            ¡No te preocupes! Hacemos <strong>láminas personalizadas</strong> con cualquier foto, personaje o temática.
          </p>
          <a href="https://wa.me/${WHATSAPP_NUMERO}?text=${msgWsp}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm">
            📲 Pedir "${termino || "diseño personalizado"}" por WhatsApp
          </a>
        </div>`;
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
          <span class="product-cat">${p.categoria}${p.subcategoria ? " · " + p.subcategoria : ""}</span>
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
  selectCategoria.addEventListener("change", () => {
    actualizarSubcategorias();
    render();
  });
  selectSubcategoria.addEventListener("change", render);

  render();
});
