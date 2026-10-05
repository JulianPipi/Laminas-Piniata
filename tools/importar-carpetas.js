const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT_DIR, 'data', 'products.json');
const BACKUP_FILE = path.join(ROOT_DIR, 'data', 'products.backup.json');

function limpiarNombre(filename) {
  let base = path.basename(filename, path.extname(filename));
  base = base.replace(/^[\d\s._-]+/, '');
  base = base.replace(/[-_]+/g, ' ').trim();
  return base
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Lámina Personalizada';
}

function leerProductos() {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function guardarProductos(products) {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      fs.copyFileSync(PRODUCTS_FILE, BACKUP_FILE);
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 4), 'utf8');
    return true;
  } catch (err) {
    console.error('Error al guardar products.json:', err);
    return false;
  }
}

function esImagen(file) {
  return /\.(jpe?g|png|webp)$/i.test(file);
}

function escanearDirectorio(dir) {
  let resultados = [];
  if (!fs.existsSync(dir)) return resultados;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      resultados = resultados.concat(escanearDirectorio(fullPath));
    } else if (entry.isFile() && esImagen(entry.name)) {
      resultados.push(fullPath);
    }
  }
  return resultados;
}

async function main() {
  console.log('\n======================================================');
  console.log(' 📁 IMPORTADOR MASIVO DE CARPETAS — LAMINAS PINIATA');
  console.log('======================================================\n');

  let carpetaOrigen = process.argv[2];

  if (!carpetaOrigen) {
    const defaultDesktop = path.join(process.env.USERPROFILE || 'C:\\Users\\Fede', 'Desktop', 'categorias de laminas');
    const defaultLocal = path.join(ROOT_DIR, 'nuevos-disenos');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    carpetaOrigen = await new Promise((resolve) => {
      let promptDefault = fs.existsSync(defaultDesktop) ? defaultDesktop : defaultLocal;
      rl.question(`Ingresá la ruta de la carpeta a importar:\n[Predeterminada: ${promptDefault}]: `, (ans) => {
        rl.close();
        resolve(ans.trim() ? ans.trim().replace(/^["']|["']$/g, '') : promptDefault);
      });
    });
  } else {
    carpetaOrigen = carpetaOrigen.replace(/^["']|["']$/g, '');
  }

  if (!fs.existsSync(carpetaOrigen)) {
    console.error(`\n❌ Error: La carpeta "${carpetaOrigen}" no existe.`);
    process.exit(1);
  }

  console.log(`\n🔍 Escaneando carpeta: ${carpetaOrigen}...`);
  const fotos = escanearDirectorio(carpetaOrigen);

  if (fotos.length === 0) {
    console.log('⚠️ No se encontraron fotos (JPG, PNG o WEBP) en esa carpeta.');
    process.exit(0);
  }

  console.log(`📸 Se encontraron ${fotos.length} imágenes.\n`);

  const products = leerProductos();
  let maxId = products.reduce((max, p) => Math.max(max, p.id || 0), 0);
  const imagenesYaRegistradas = new Set(products.map(p => (p.imagen || '').toLowerCase().replace(/\\/g, '/')));

  let importados = 0;
  let omitidos = 0;

  for (const fotoPath of fotos) {
    const parentFolder = path.basename(path.dirname(fotoPath));
    const categoria = (parentFolder && parentFolder.toLowerCase() !== path.basename(carpetaOrigen).toLowerCase())
      ? parentFolder.charAt(0).toUpperCase() + parentFolder.slice(1)
      : 'Varios';

    const ext = path.extname(fotoPath).toLowerCase();
    const safeName = path.basename(fotoPath, ext)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const destFolder = path.join(ROOT_DIR, 'images', 'fototorta');
    if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });

    const destFilename = `${safeName}-${Date.now().toString().slice(-4)}-${Math.floor(Math.random()*900+100)}${ext}`;
    const destPath = path.join(destFolder, destFilename);
    const relImagePath = `images/fototorta/${destFilename}`;

    // Copiar imagen
    fs.copyFileSync(fotoPath, destPath);

    maxId++;
    products.push({
      id: maxId,
      nombre: limpiarNombre(fotoPath),
      imagen: relImagePath,
      tipo: 'fototorta',
      categoria: categoria,
      subcategoria: null,
      precio: 2500,
      destacado: false,
      activo: true
    });
    importados++;
    console.log(` ✅ [${importados}/${fotos.length}] ${limpiarNombre(fotoPath)} -> Categoría: ${categoria}`);
  }

  guardarProductos(products);

  console.log('\n======================================================');
  console.log(` 🎉 ¡LISTO! Se importaron ${importados} productos con éxito.`);
  console.log(` 📊 Total en el catálogo ahora: ${products.length} productos.`);
  console.log(` 💾 Se guardó copia de seguridad en: data/products.backup.json`);
  console.log('======================================================\n');
}

main().catch(err => console.error(err));
