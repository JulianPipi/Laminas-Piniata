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
});
