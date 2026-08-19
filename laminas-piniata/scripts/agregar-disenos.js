#!/usr/bin/env node
/**
 * Laminas Piniata — cargador de diseños nuevos
 * ---------------------------------------------
 * Cómo se usa:
 *   1. Arrastrá tus imágenes a la carpeta que corresponda dentro de
 *      /nuevos-disenos/<tipo>/<categoria>/
 *      Ej: nuevos-disenos/fototorta/Futbol/messi.jpg
 *   2. Corré:  node scripts/agregar-disenos.js
 *   3. El script copia cada imagen a /images/<tipo>/, la agrega a
 *      data/products.json con un nombre sugerido (a partir del
 *      nombre del archivo) y la saca de /nuevos-disenos/.
 *   4. Revisá el resultado, y si algún nombre/precio necesita un
 *      ajuste, lo editás a mano en data/products.json.
 *   5. git add . / git commit / git push como siempre — Vercel
 *      publica solo.
 *
 * No requiere instalar nada (usa solo módulos nativos de Node).
 */

const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const CARPETA_NUEVOS = path.join(RAIZ, "nuevos-disenos");
const CARPETA_IMAGENES = path.join(RAIZ, "images");
const ARCHIVO_PRODUCTOS = path.join(RAIZ, "data", "products.json");

const PRECIOS_POR_DEFECTO = {
  fototorta: 2500,
  chocotransfer: 4500,
};

const EXTENSIONES_VALIDAS = [".jpg", ".jpeg", ".png", ".webp"];

function slugificar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function nombreLegibleDesdeArchivo(nombreArchivo) {
  const sinExtension = nombreArchivo.replace(/\.[^.]+$/, "");
  const limpio = sinExtension.replace(/[-_]+/g, " ").trim();
  return limpio.replace(/\b\w/g, (c) => c.toUpperCase());
}

function main() {
  if (!fs.existsSync(ARCHIVO_PRODUCTOS)) {
    console.error("No encontré data/products.json. Corré este script desde la carpeta del proyecto.");
    process.exit(1);
  }

  const productos = JSON.parse(fs.readFileSync(ARCHIVO_PRODUCTOS, "utf-8"));
  let siguienteId = productos.reduce((max, p) => Math.max(max, p.id), 0) + 1;

  const tipos = ["fototorta", "chocotransfer"];
  let agregados = 0;
  let avisos = [];

  for (const tipo of tipos) {
    const carpetaTipo = path.join(CARPETA_NUEVOS, tipo);
    if (!fs.existsSync(carpetaTipo)) continue;

    const categorias = fs.readdirSync(carpetaTipo, { withFileTypes: true }).filter((d) => d.isDirectory());

    for (const catDir of categorias) {
      const categoria = catDir.name;
      const carpetaCategoria = path.join(carpetaTipo, categoria);
      const archivos = fs
        .readdirSync(carpetaCategoria)
        .filter((f) => EXTENSIONES_VALIDAS.includes(path.extname(f).toLowerCase()));

      for (const archivo of archivos) {
        const rutaOrigen = path.join(carpetaCategoria, archivo);
        const extension = path.extname(archivo).toLowerCase();
        const nombreSugerido = nombreLegibleDesdeArchivo(archivo);
        const slugArchivo = `${slugificar(categoria)}-${slugificar(nombreSugerido)}-${siguienteId}${extension}`;

        const carpetaDestino = path.join(CARPETA_IMAGENES, tipo);
        fs.mkdirSync(carpetaDestino, { recursive: true });
        const rutaDestino = path.join(carpetaDestino, slugArchivo);

        fs.copyFileSync(rutaOrigen, rutaDestino);
        fs.unlinkSync(rutaOrigen); // saca la imagen de "nuevos-disenos" para no volver a procesarla

        productos.push({
          id: siguienteId,
          nombre: nombreSugerido,
          imagen: `/images/${tipo}/${slugArchivo}`,
          tipo,
          categoria,
          subcategoria: null,
          precio: PRECIOS_POR_DEFECTO[tipo],
          destacado: false,
          activo: true,
        });

        console.log(`✔ Agregado: [${tipo}] ${categoria} → "${nombreSugerido}" (id ${siguienteId})`);
        siguienteId++;
        agregados++;
      }
    }
  }

  if (agregados === 0) {
    console.log("No encontré imágenes nuevas en /nuevos-disenos/. Arrastrá archivos ahí y volvé a correr el script.");
    return;
  }

  fs.writeFileSync(ARCHIVO_PRODUCTOS, JSON.stringify(productos, null, 2), "utf-8");

  console.log(`\n${agregados} diseño(s) agregado(s) a data/products.json.`);
  console.log("Revisá los nombres y precios en ese archivo si algo necesita un ajuste.");
  console.log("Después: git add . && git commit -m \"Nuevos diseños\" && git push");
}

main();
