# Laminas Piniata 🎂🍫

Catálogo online de láminas comestibles (Fototortas y Chocotransfer) con pedido armado en carrito y confirmación por WhatsApp. Sin backend, sin pagos online: 100% archivos estáticos, listo para Vercel.

## Estructura del proyecto

```
laminas-piniata/
├── index.html          → Inicio
├── fototortas.html      → Catálogo de fototortas
├── chocotransfer.html   → Catálogo de chocotransfer
├── pedido.html           → "Mi pedido" + confirmación por WhatsApp
├── css/styles.css
├── js/
│   ├── data.js            → carga productos, filtros, WhatsApp número
│   ├── cart.js             → carrito (localStorage) y armado del mensaje de WhatsApp
│   ├── catalogo.js          → lógica de grilla/filtros/modal de las páginas de catálogo
│   └── main.js               → menú mobile, nav activo
├── data/products.json          → EL CATÁLOGO. Acá se agregan/editan/borran diseños.
└── images/
    ├── fototorta/                → imágenes de fototortas
    └── chocotransfer/             → imágenes de chocotransfer
```

## Cómo agregar diseños nuevos (forma fácil, recomendada)

Hay una carpeta `nuevos-disenos/` con una subcarpeta lista para cada categoría, separada por tipo:

```
nuevos-disenos/
├── fototorta/
│   ├── Futbol/
│   ├── Dibujos animados/
│   ├── Disney/
│   ├── Basquet/
│   ├── Peliculas/
│   ├── Series/
│   ├── Animales/
│   ├── Cumpleanos/
│   └── Juegos/
└── chocotransfer/
    └── (las mismas 9 categorías)
```

**Pasos:**

1. Arrastrá cada imagen nueva (jpg, jpeg, png o webp) a la carpeta que le corresponda. El nombre del archivo se usa para sugerir el nombre del diseño — por ejemplo `messi-barcelona.jpg` va a aparecer como "Messi Barcelona". No hace falta que el nombre sea perfecto, después se puede ajustar.
2. Abrí una terminal en la carpeta del proyecto y corré:

   ```bash
   node scripts/agregar-disenos.js
   ```

3. El script va a:
   - copiar cada imagen a `images/fototorta/` o `images/chocotransfer/` con un nombre único,
   - agregar el diseño a `data/products.json` con el precio por defecto ($2.500 fototorta / $4.500 chocotransfer), `destacado: false` y `activo: true`,
   - sacar la imagen de `nuevos-disenos/` (para no volver a procesarla si corrés el script de nuevo).
4. Revisá `data/products.json` por si algún nombre o precio necesita un ajuste manual (por ejemplo, marcar `"destacado": true` en algún diseño para que aparezca en el Inicio).
5. Subilo como siempre:

   ```bash
   git add .
   git commit -m "Nuevos diseños"
   git push
   ```

   Vercel publica el cambio solo.

## Cómo agregar un diseño a mano (alternativa)

1. Poné la imagen (jpg/png, cuadrada de preferencia) en `images/fototorta/` o `images/chocotransfer/`.
2. Sumá un objeto en `data/products.json`:

```json
{
  "id": 37,
  "nombre": "Messi Barcelona",
  "imagen": "/images/fototorta/messi-barcelona.jpg",
  "tipo": "fototorta",
  "categoria": "Futbol",
  "subcategoria": null,
  "precio": 2500,
  "destacado": false,
  "activo": true
}
```

- `tipo`: `"fototorta"` o `"chocotransfer"` (nunca se mezclan en el catálogo).
- `categoria`: usá una de las existentes (Futbol, Dibujos animados, Disney, Basquet, Peliculas, Series, Animales, Cumpleanos, Juegos) o agregá una nueva editando también el array `CATEGORIAS` en `js/data.js`.
- `destacado: true` → aparece en "Diseños destacados" en el Inicio.
- `activo: false` → el diseño queda oculto sin borrarlo.

No hace falta tocar ningún HTML ni JS para sumar diseños nuevos: todo sale de este único archivo.

## Imágenes de ejemplo (placeholder)

Ahora mismo el catálogo tiene 36 diseños de ejemplo generados automáticamente (SVG de color con el nombre de la categoría) solo para que puedas ver el sitio funcionando. **Hay que reemplazarlos por las imágenes reales** de tus más de 50 diseños (los que hoy tenés en carpetas y PowerPoint — lo más simple es exportar cada diapositiva/imagen como PNG o JPG).

## Precios y WhatsApp

- Precio fototorta: `$2.500` — se define en `js/catalogo.js`/`data/products.json` (por producto, así que si a futuro algunos diseños valen distinto, se cambia por diseño).
- Precio chocotransfer: `$4.500`.
- Número de WhatsApp: se configura en una sola línea, al principio de `js/data.js`:

```js
const WHATSAPP_NUMERO = "5491133750433"; // 11 3375-0433
```

## Cómo probarlo en tu computadora

Como el sitio usa `fetch()` para leer `data/products.json`, no alcanza con abrir el `index.html` haciendo doble clic (el navegador bloquea esas lecturas en `file://`). Hay que levantar un servidor local simple. Con Node instalado:

```bash
npx serve .
```

o con Python:

```bash
python3 -m http.server 5500
```

y entrar a `http://localhost:5500`.

## Cómo publicarlo (GitHub + Vercel)

1. Creá un repositorio en GitHub y subí esta carpeta.
2. Entrá a [vercel.com](https://vercel.com), "Add New Project", importá el repositorio.
3. Framework: **Other / Static** (no hace falta build command ni output directory, Vercel sirve los archivos tal cual).
4. Deploy. Cada vez que subas cambios a GitHub, Vercel los publica solo.

## Qué queda pendiente para más adelante (a propósito, no implementado todavía)

- Diseños personalizados ("mandá tu propia imagen") — lo dejamos para una segunda etapa.
- Mini panel para cargar diseños sin tocar el JSON a mano.
- Cálculo automático de envío según zona (por ahora se informa como texto y se coordina por WhatsApp).
