const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');

function readProducts() {
  return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
}

function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 4), 'utf8');
}

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : 'ayuda';

if (command === 'listar' || command === 'ls') {
  const products = readProducts();
  console.log(`\n📋 Catálogo actual (${products.length} productos):\n`);
  console.log('ID\tTIPO\t\tCATEGORÍA\tPRECIO\tNOMBRE');
  console.log('---------------------------------------------------------------------------------');
  products.forEach(p => {
    const tipo = p.tipo === 'fototorta' ? 'Fototorta   ' : 'Chocotransfer';
    const cat = (p.categoria || 'Varios').padEnd(14, ' ');
    console.log(`${p.id}\t${tipo}\t${cat}\t$${p.precio}\t${p.nombre}`);
  });
  console.log(`\nTotal: ${products.length} productos.\n`);
} else if (command === 'eliminar' || command === 'rm') {
  const target = args[1];
  if (!target) {
    console.error('❌ Debes indicar el ID del producto a eliminar. Ej: node tools/gestor-cli.js eliminar 37');
    process.exit(1);
  }

  const products = readProducts();
  const idNum = parseInt(target, 10);
  const index = products.findIndex(p => p.id === idNum || p.nombre.toLowerCase() === target.toLowerCase());

  if (index === -1) {
    console.error(`❌ No se encontró ningún producto con ID o nombre "${target}".`);
    process.exit(1);
  }

  const [deleted] = products.splice(index, 1);
  saveProducts(products);
  console.log(`\n✅ Producto eliminado con éxito:`);
  console.log(`   ID: ${deleted.id} | ${deleted.nombre} (${deleted.categoria})`);
  console.log(`   Quedan ${products.length} productos en el catálogo.\n`);
} else if (command === 'buscar') {
  const query = args.slice(1).join(' ').toLowerCase();
  if (!query) {
    console.error('❌ Ingresa el término de búsqueda. Ej: node tools/gestor-cli.js buscar messi');
    process.exit(1);
  }

  const products = readProducts();
  const matches = products.filter(p => 
    p.nombre.toLowerCase().includes(query) || 
    p.categoria.toLowerCase().includes(query)
  );

  console.log(`\n🔍 Resultados para "${query}" (${matches.length}):\n`);
  matches.forEach(p => console.log(` [ID ${p.id}] ${p.nombre} (${p.categoria} · $${p.precio}) -> ${p.imagen}`));
  console.log();
} else {
  console.log(`
===========================================================
  HERRAMIENTA DE GESTIÓN RÁPIDA DE CATÁLOGO (Laminas Piniata)
===========================================================
Comandos disponibles:
  node tools/gestor-cli.js listar          Ver todos los productos con ID
  node tools/gestor-cli.js buscar <texto>  Buscar un producto por nombre
  node tools/gestor-cli.js eliminar <id>   Eliminar un producto por su ID

O iniciá el panel web visual completo corriendo:
  node tools/admin-server.js
===========================================================
`);
}
