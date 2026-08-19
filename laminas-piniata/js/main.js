// =============================================================
// Laminas Piniata — comportamiento compartido de header/footer
// =============================================================

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  // resaltar link activo según el archivo actual
  const actual = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === actual || (actual === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  const anio = document.querySelector("[data-anio]");
  if (anio) anio.textContent = new Date().getFullYear();
});
