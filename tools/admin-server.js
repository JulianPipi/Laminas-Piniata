const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT_DIR = path.resolve(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT_DIR, 'data', 'products.json');
const BACKUP_FILE = path.join(ROOT_DIR, 'data', 'products.backup.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function readProducts() {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 4), 'utf8');
}

function getAvailableUnusedImages() {
  const products = readProducts();
  const usedImages = new Set(products.map(p => (p.imagen || '').replace(/^\//, '').replace(/\\/g, '/')));

  function scan(dir) {
    let list = [];
    if (!fs.existsSync(dir)) return list;
    fs.readdirSync(dir).forEach(file => {
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) {
        list = list.concat(scan(full));
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
          const rel = path.relative(ROOT_DIR, full).replace(/\\/g, '/');
          list.push(rel);
        }
      }
    });
    return list;
  }

  const all = scan(path.join(ROOT_DIR, 'images'));
  return all.filter(f => !usedImages.has(f));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API: Listar productos ---
  if (pathname === '/api/productos' && req.method === 'GET') {
    const products = readProducts();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(products));
    return;
  }

  // --- API: Eliminar producto por ID ---
  if (pathname.startsWith('/api/productos/') && req.method === 'DELETE') {
    const id = parseInt(pathname.split('/').pop(), 10);
    let products = readProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Producto no encontrado' }));
      return;
    }

    const [deleted] = products.splice(index, 1);
    saveProducts(products);

    console.log(`[ADMIN] Producto eliminado: ID ${deleted.id} - ${deleted.nombre}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deleted, total: products.length }));
    return;
  }

  // --- API: Cargar / Agregar producto nuevo ---
  if (pathname === '/api/productos' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      if (!data.nombre || !data.tipo) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Faltan campos obligatorios' }));
        return;
      }

      let imagePath = data.imagen || '';

      // Si viene imagen en base64, guardarla en disco
      if (imagePath.startsWith('data:image/')) {
        const matches = imagePath.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          const rawExt = matches[1].toLowerCase();
          const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');

          const safeName = (data.nombre || 'producto')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

          const folder = data.tipo === 'chocotransfer' ? 'chocotransfer' : 'fototorta';
          const filename = `${safeName}-${Date.now().toString().slice(-4)}.${ext}`;
          const destDir = path.join(ROOT_DIR, 'images', folder);
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

          const destPath = path.join(destDir, filename);
          fs.writeFileSync(destPath, buffer);
          imagePath = `images/${folder}/${filename}`;
          console.log(`[ADMIN] Nueva imagen guardada en disco: ${imagePath}`);
        }
      }

      const products = readProducts();
      const maxId = products.reduce((max, p) => Math.max(max, p.id || 0), 0);
      const newProduct = {
        id: maxId + 1,
        nombre: String(data.nombre).trim(),
        imagen: imagePath,
        tipo: data.tipo,
        categoria: String(data.categoria || 'Varios').trim(),
        subcategoria: data.subcategoria ? String(data.subcategoria).trim() : null,
        precio: Number(data.precio) || (data.tipo === 'chocotransfer' ? 4500 : 2500),
        destacado: Boolean(data.destacado),
        activo: true
      };

      products.push(newProduct);
      saveProducts(products);

      console.log(`[ADMIN] Producto creado con éxito: ID ${newProduct.id} - ${newProduct.nombre}`);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, producto: newProduct, total: products.length }));
      return;
    } catch (err) {
      console.error('[ADMIN] Error al guardar producto:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
      return;
    }
  }

  // --- API: Imágenes disponibles en images/ no registradas ---
  if (pathname === '/api/imagenes-disponibles' && req.method === 'GET') {
    const list = getAvailableUnusedImages();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ disponibles: list }));
    return;
  }

  // --- Archivos estáticos ---
  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname.replace(/^\//, ''));
  filePath = decodeURIComponent(filePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Archivo no encontrado');
  }
});

const DEFAULT_PORT = 3000;

function startServer(port) {
  server.listen(port, () => {
    console.log('\n======================================================');
    console.log(' ✨ LAMINAS PINIATA — GESTOR DE CATÁLOGO ACTIVO ✨');
    console.log(` ⚙️  Panel de Administración:  http://localhost:${port}/admin.html`);
    console.log(` 🛍️  Tienda Pública:          http://localhost:${port}/index.html`);
    console.log('======================================================\n');
  }).on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[ADMIN] Puerto ${port} ocupado, probando puerto ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[ADMIN] Error al iniciar servidor:', err);
    }
  });
}

startServer(DEFAULT_PORT);
