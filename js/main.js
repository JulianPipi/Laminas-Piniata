// =============================================================
// Laminas Piniata — comportamiento compartido de header/footer
// =============================================================

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");

  let backdrop = document.querySelector(".nav-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    document.body.appendChild(backdrop);
  }

  function cerrarMenu() {
    if (links) links.classList.remove("open");
    if (toggle) {
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    }
    if (backdrop) backdrop.classList.remove("open");
  }

  if (toggle && links) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.classList.toggle("active", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (backdrop) backdrop.classList.toggle("open", isOpen);
    });

    if (backdrop) {
      backdrop.addEventListener("click", cerrarMenu);
    }

    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", cerrarMenu)
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cerrarMenu();
    });
  }

  // Resaltar link activo según el archivo actual (tanto en barra superior como en barra inferior móvil)
  const actual = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .bottom-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === actual || (actual === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  const anio = document.querySelector("[data-anio]");
  if (anio) anio.textContent = new Date().getFullYear();

  // Contador regresivo a Halloween (31 de Octubre a las 23:59:59)
  function iniciarContadorHalloween() {
    const elDias = document.querySelector("[data-hw-dias]");
    const elHoras = document.querySelector("[data-hw-horas]");
    const elMin = document.querySelector("[data-hw-min]");
    const elSeg = document.querySelector("[data-hw-seg]");
    const countdownWrap = document.getElementById("hw-countdown-wrap");

    if (!elDias || !elHoras || !elMin || !elSeg) return;

    function pad(n) {
      return String(Math.floor(n)).padStart(2, "0");
    }

    function actualizar() {
      const ahora = new Date();
      const anioActual = ahora.getFullYear();
      // Mes 9 es Octubre en JavaScript (0-indexed). 31 de Octubre a las 23:59:59
      let fechaObjetivo = new Date(anioActual, 9, 31, 23, 59, 59);

      // Si ya pasó Halloween este año, apuntar al siguiente año
      if (ahora.getTime() > fechaObjetivo.getTime()) {
        fechaObjetivo = new Date(anioActual + 1, 9, 31, 23, 59, 59);
      }

      const diff = fechaObjetivo.getTime() - ahora.getTime();

      if (diff <= 0) {
        if (countdownWrap) {
          countdownWrap.innerHTML = `<span style="font-weight:800; color:#FFD54F; font-size:1rem;">🎃 ¡FELIZ HALLOWEEN! ¡DULCE O TRUCO! 👻</span>`;
        }
        return;
      }

      const totalSeg = Math.floor(diff / 1000);
      const dias = Math.floor(totalSeg / (3600 * 24));
      const horas = Math.floor((totalSeg % (3600 * 24)) / 3600);
      const minutos = Math.floor((totalSeg % 3600) / 60);
      const segundos = totalSeg % 60;

      elDias.textContent = pad(dias);
      elHoras.textContent = pad(horas);
      elMin.textContent = pad(minutos);
      elSeg.textContent = pad(segundos);
    }

    actualizar();
    setInterval(actualizar, 1000);
  }

  iniciarContadorHalloween();

  // Zoom automático sobre la imagen del modal al pasar el cursor
  function configurarZoomModal() {
    const modalImgBox = document.querySelector(".modal-img");
    const modalImg = document.getElementById("modal-img");
    if (!modalImgBox || !modalImg) return;

    function resetZoom() {
      modalImg.style.transformOrigin = "center center";
      modalImg.style.transform = "scale(1)";
      modalImgBox.classList.remove("is-zoomed");
    }

    modalImgBox.addEventListener("mousemove", (e) => {
      const rect = modalImgBox.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      modalImg.style.transformOrigin = `${x.toFixed(1)}% ${y.toFixed(1)}%`;
      modalImg.style.transform = "scale(2.2)";
      modalImgBox.classList.add("is-zoomed");
    });

    modalImgBox.addEventListener("mouseleave", resetZoom);

    // Toque en móviles para alternar zoom
    modalImgBox.addEventListener("click", () => {
      if (window.matchMedia("(hover: none)").matches) {
        if (modalImgBox.classList.contains("is-zoomed")) {
          resetZoom();
        } else {
          modalImg.style.transformOrigin = "center center";
          modalImg.style.transform = "scale(1.8)";
          modalImgBox.classList.add("is-zoomed");
        }
      }
    });

    // Resetear al cerrar modal
    const modalEl = document.getElementById("modal");
    if (modalEl) {
      modalEl.addEventListener("click", (e) => {
        if (e.target === modalEl || e.target.closest("[data-cerrar-modal]")) {
          resetZoom();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") resetZoom();
      });
    }
  }

  configurarZoomModal();
});
