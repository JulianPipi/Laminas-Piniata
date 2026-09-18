// =============================================================
// Laminas Piniata — Personalizador interactivo y simulador
// Permite cargar foto, elegir formato, ver la lámina en vivo,
// descargar boceto y generar el pedido por WhatsApp.
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del simulador
  const mockup = document.getElementById('sheet-mockup');
  const fileInput = document.getElementById('input-foto');
  const fileChooseBtn = document.getElementById('btn-choose-file');
  const fileNameDisplay = document.getElementById('file-name-display');
  const btnRemoveImg = document.getElementById('btn-remove-img');
  const btnDownloadPreview = document.getElementById('btn-download-preview');

  // Controles del formulario
  const formatBtns = document.querySelectorAll('[data-format]');
  const tipoCards = document.querySelectorAll('[data-tipo-card]');
  const customTextInput = document.getElementById('custom-text');
  const textColorSelect = document.getElementById('custom-text-color');
  const customForm = document.getElementById('form-personalizar');
  const inputFecha = document.getElementById('fecha-entrega');
  const inputNombre = document.getElementById('nombre-cliente');
  const inputHorario = document.getElementById('horario-entrega');
  const inputNotas = document.getElementById('notas-entrega');
  const btnSumarCarrito = document.getElementById('btn-sumar-carrito');

  // Modal WhatsApp
  const modalWhatsapp = document.getElementById('modal-whatsapp-confirm');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal-wa');

  // Estado
  let currentFormat = 'round'; // 'round' | 'rect' | 'toppers'
  let currentTipo = 'fototorta'; // 'fototorta' ($2500) | 'chocotransfer' ($4500)
  let currentImageSrc = null;
  let currentFileName = '';

  const PRECIOS = {
    fototorta: 2500,
    chocotransfer: 4500
  };

  const NOMBRES_FORMATO = {
    round: 'Redonda (hasta 20 cm para torta)',
    rect: 'Rectangular A4 completa (20x29 cm)',
    toppers: 'Mini Toppers (24 círculos para cupcakes / alfajores de 4.5cm de diametro)'
  };

  // Configurar fecha mínima (mañana)
  if (inputFecha) {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    inputFecha.min = manana.toISOString().split('T')[0];
  }

  // --- Cambio de Formato ---
  formatBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      formatBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFormat = btn.dataset.format;
      actualizarMockupVisual();
    });
  });

  // --- Cambio de Tipo (Fototorta vs Chocotransfer) ---
  tipoCards.forEach((card) => {
    card.addEventListener('click', () => {
      tipoCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      currentTipo = card.dataset.tipoCard;
      actualizarPrecioVisual();
    });
  });

  function actualizarPrecioVisual() {
    const precioDisplay = document.getElementById('precio-estimado-display');
    if (precioDisplay && typeof formatoPrecio === 'function') {
      precioDisplay.textContent = formatoPrecio(PRECIOS[currentTipo]);
    }
  }

  // --- Actualizar Mockup Visual ---
  function actualizarMockupVisual() {
    mockup.className = 'sheet-mockup ' + currentFormat;

    if (currentFormat === 'toppers') {
      if (currentImageSrc) {
        mockup.innerHTML = `
          <div class="topper-circle"><img src="${currentImageSrc}" alt="Topper"></div>
          <div class="topper-circle"><img src="${currentImageSrc}" alt="Topper"></div>
          <div class="topper-circle"><img src="${currentImageSrc}" alt="Topper"></div>
          <div class="topper-circle"><img src="${currentImageSrc}" alt="Topper"></div>
          <div class="topper-circle"><img src="${currentImageSrc}" alt="Topper"></div>
          <div class="topper-circle"><img src="${currentImageSrc}" alt="Topper"></div>
        `;
      } else {
        mockup.innerHTML = `
          <div class="dropzone-overlay" id="dropzone-prompt">
            <span class="drop-icon">🧁</span>
            <p><strong>Subí tu foto o logo</strong></p>
            <small>Se repetirá en 24 mini toppers (4.5 cm)</small>
          </div>
        `;
      }
    } else {
      const dedicatoria = customTextInput ? customTextInput.value : '';
      if (currentImageSrc) {
        mockup.innerHTML = `
          <img class="user-img" src="${currentImageSrc}" alt="Diseño personalizado">
          <div class="sheet-text-overlay" id="text-overlay">${escaparHTML(dedicatoria)}</div>
        `;
        aplicarEstiloTexto();
      } else {
        mockup.innerHTML = `
          <div class="dropzone-overlay" id="dropzone-prompt">
            <span class="drop-icon">📸</span>
            <p><strong>Arrastrá tu foto acá</strong> o hacé clic para subir</p>
            <small>JPG, PNG o WEBP en buena calidad</small>
          </div>
          <div class="sheet-text-overlay" id="text-overlay">${escaparHTML(dedicatoria)}</div>
        `;
        aplicarEstiloTexto();
      }
    }

    if (btnRemoveImg) {
      btnRemoveImg.style.display = currentImageSrc ? 'inline-flex' : 'none';
    }
    if (btnDownloadPreview) {
      btnDownloadPreview.style.display = currentImageSrc ? 'inline-flex' : 'none';
    }
  }

  // --- Carga de Imagen ---
  function procesarArchivo(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Por favor seleccioná un archivo de imagen válido (JPG, PNG o WEBP).');
      return;
    }

    currentFileName = file.name;
    if (fileNameDisplay) {
      fileNameDisplay.textContent = 'Archivo: ' + file.name;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageSrc = e.target.result;
      actualizarMockupVisual();
    };
    reader.readAsDataURL(file);
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        procesarArchivo(e.target.files[0]);
      }
    });
  }

  if (fileChooseBtn) {
    fileChooseBtn.addEventListener('click', () => fileInput.click());
  }

  if (mockup) {
    mockup.addEventListener('click', () => {
      if (!currentImageSrc) {
        fileInput.click();
      }
    });

    mockup.addEventListener('dragover', (e) => {
      e.preventDefault();
      mockup.style.borderColor = 'var(--rosa-fuerte)';
      mockup.style.transform = 'scale(1.02)';
    });

    mockup.addEventListener('dragleave', () => {
      mockup.style.borderColor = 'var(--blanco)';
      mockup.style.transform = 'none';
    });

    mockup.addEventListener('drop', (e) => {
      e.preventDefault();
      mockup.style.borderColor = 'var(--blanco)';
      mockup.style.transform = 'none';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        procesarArchivo(e.dataTransfer.files[0]);
      }
    });
  }

  if (btnRemoveImg) {
    btnRemoveImg.addEventListener('click', () => {
      currentImageSrc = null;
      currentFileName = '';
      fileInput.value = '';
      if (fileNameDisplay) fileNameDisplay.textContent = 'Ningún archivo cargado aún';
      actualizarMockupVisual();
    });
  }

  // --- Texto Dedicatoria en Vivo ---
  if (customTextInput) {
    customTextInput.addEventListener('input', () => {
      const el = document.getElementById('text-overlay');
      if (el) {
        el.textContent = customTextInput.value;
      }
    });
  }

  if (textColorSelect) {
    textColorSelect.addEventListener('change', aplicarEstiloTexto);
  }

  function aplicarEstiloTexto() {
    const el = document.getElementById('text-overlay');
    if (!el) return;
    const color = textColorSelect ? textColorSelect.value : '#FFFFFF';
    el.style.color = color;
    if (color === '#FFFFFF' || color === '#FFF4E6' || color === '#FBD966') {
      el.style.textShadow = '0 2px 6px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.85)';
    } else {
      el.style.textShadow = '0 1px 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.8)';
    }
  }

  // --- Descargar Vista Previa Canvas ---
  if (btnDownloadPreview) {
    btnDownloadPreview.addEventListener('click', () => {
      if (!currentImageSrc) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        let w = 800;
        let h = currentFormat === 'rect' ? 1100 : 800;
        canvas.width = w;
        canvas.height = h;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);

        if (currentFormat === 'round') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 25, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          dibujarImagenAjustada(ctx, img, 0, 0, w, h);
          ctx.restore();

          ctx.strokeStyle = '#E04C7A';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 25, 0, Math.PI * 2);
          ctx.stroke();
        } else if (currentFormat === 'toppers') {
          const cols = 3;
          const rows = 4;
          const r = 90;
          const gapX = (w - cols * (r * 2)) / (cols + 1);
          const gapY = (h - rows * (r * 2)) / (rows + 1);

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const cx = gapX + col * (r * 2 + gapX) + r;
              const cy = gapY + row * (r * 2 + gapY) + r;
              ctx.save();
              ctx.beginPath();
              ctx.arc(cx, cy, r, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              dibujarImagenAjustada(ctx, img, cx - r, cy - r, r * 2, r * 2);
              ctx.restore();

              ctx.strokeStyle = '#E04C7A';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
        } else {
          dibujarImagenAjustada(ctx, img, 25, 25, w - 50, h - 50);
          ctx.strokeStyle = '#E04C7A';
          ctx.lineWidth = 4;
          ctx.strokeRect(25, 25, w - 50, h - 50);
        }

        const texto = customTextInput ? customTextInput.value.trim() : '';
        if (texto && currentFormat !== 'toppers') {
          ctx.font = "bold 40px 'Playfair Display', Georgia, serif";
          ctx.textAlign = 'center';
          ctx.fillStyle = textColorSelect ? textColorSelect.value : '#FFFFFF';
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#000000';
          const yPos = currentFormat === 'round' ? h - 90 : h - 60;
          ctx.strokeText(texto, w / 2, yPos);
          ctx.fillText(texto, w / 2, yPos);
        }

        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'rgba(90, 56, 37, 0.5)';
        ctx.textAlign = 'right';
        ctx.fillText('Laminas Piniata — Personalizados', w - 30, h - 15);

        const link = document.createElement('a');
        link.download = `boceto-lamina-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      img.src = currentImageSrc;
    });
  }

  function dibujarImagenAjustada(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const destRatio = w / h;
    let sx, sy, sw, sh;
    if (imgRatio > destRatio) {
      sh = img.height;
      sw = img.height * destRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = img.width / destRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  // --- Envío del formulario a WhatsApp ---
  if (customForm) {
    customForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = inputNombre.value.trim();
      const fecha = inputFecha.value;
      const horario = inputHorario.value.trim();
      const dedicatoria = customTextInput ? customTextInput.value.trim() : '';
      const notas = inputNotas ? inputNotas.value.trim() : '';
      const precio = PRECIOS[currentTipo];
      const tipoNombre = currentTipo === 'fototorta' ? 'Lámina Comestible para Torta' : 'Chocotransfer';
      const formatoNombre = NOMBRES_FORMATO[currentFormat];

      let msg = `Hola Laminas Piniata! 🎂✨\n`;
      msg += `Quiero encargar una *LÁMINA PERSONALIZADA*:\n\n`;
      msg += `📋 *Motivo:* LÁMINA PERSONALIZADA CON MI PROPIA FOTO\n`;
      msg += `🍰 *Tipo de producto:* ${tipoNombre}\n`;
      msg += `📐 *Formato / Tamaño:* ${formatoNombre}\n`;
      if (dedicatoria) {
        msg += `✍️ *Texto / Dedicatoria:* "${dedicatoria}"\n`;
      } else {
        msg += `✍️ *Texto / Dedicatoria:* Sin dedicatoria (solo la imagen)\n`;
      }
      if (currentFileName) {
        msg += `📁 *Archivo elegido en la web:* ${currentFileName}\n`;
      }
      msg += `💵 *Precio estimado:* ${typeof formatoPrecio === 'function' ? formatoPrecio(precio) : '$' + precio}\n\n`;

      msg += `*Datos de entrega:*\n`;
      msg += `👤 *Nombre y Apellido:* ${nombre}\n`;
      msg += `📅 *Fecha de entrega deseada:* ${fecha}\n`;
      msg += `⏰ *Disponibilidad horaria:* ${horario}\n`;
      if (notas) {
        msg += `📝 *Observaciones:* ${notas}\n`;
      }
      msg += `\n📎 *¡Te adjunto la imagen a continuación en este chat de WhatsApp!*\n¿Me confirman disponibilidad y datos para la seña? ¡Muchas gracias!`;

      const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;

      if (modalWhatsapp) {
        modalWhatsapp.style.display = 'flex';
      }

      window.open(url, '_blank');
    });
  }

  // Modal handlers
  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', () => {
      if (modalWhatsapp) modalWhatsapp.style.display = 'none';
    });
  }
  if (modalWhatsapp) {
    modalWhatsapp.addEventListener('click', (e) => {
      if (e.target === modalWhatsapp) {
        modalWhatsapp.style.display = 'none';
      }
    });
  }

  function limpiarFormulario() {
    currentImageSrc = null;
    currentFileName = '';
    if (fileInput) fileInput.value = '';
    if (fileNameDisplay) fileNameDisplay.textContent = 'Ningún archivo cargado aún';
    if (customTextInput) customTextInput.value = '';
    if (inputNotas) inputNotas.value = '';
    actualizarMockupVisual();
  }

  // --- Sumar al Carrito ---
  if (btnSumarCarrito) {
    btnSumarCarrito.addEventListener('click', () => {
      const dedicatoria = customTextInput ? customTextInput.value.trim() : '';
      const tipoNombre = currentTipo === 'fototorta' ? 'Fototorta Personalizada' : 'Chocotransfer Personalizado';
      const formatoNombre = NOMBRES_FORMATO[currentFormat];
      const precio = PRECIOS[currentTipo];

      const item = {
        id: 'custom-' + Date.now(),
        nombre: `${tipoNombre} (${formatoNombre}${dedicatoria ? ' - "' + dedicatoria + '"' : ''})`,
        tipo: currentTipo,
        categoria: 'Personalizado',
        precio: precio,
        imagen: currentImageSrc || 'images/fototorta/cumpleaños1.jpg'
      };

      if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(item, 1);
        alert(`✅ ¡Agregado a tu pedido!\n\n${item.nombre}\nPrecio: ${typeof formatoPrecio === 'function' ? formatoPrecio(precio) : '$' + precio}\n\nPodés verlo en el botón "Mi pedido" del menú superior.`);
        limpiarFormulario();
      }
    });
  }

  function escaparHTML(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Inicializar
  actualizarPrecioVisual();
  actualizarMockupVisual();
});
