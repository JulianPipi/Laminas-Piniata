// =============================================================
// Laminas Piniata — Personalizador interactivo y simulador
// Permite cargar foto, elegir formato, ver la lámina en vivo,
// descargar boceto y generar el pedido por WhatsApp.
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del simulador
  const mockup = document.getElementById('sheet-mockup');
  const mockupStage = document.getElementById('mockup-stage');
  const fileInput = document.getElementById('input-foto');
  const fileChooseBtn = document.getElementById('btn-choose-file');
  const fileNameDisplay = document.getElementById('file-name-display');
  const btnRemoveImg = document.getElementById('btn-remove-img');
  const btnDownloadPreview = document.getElementById('btn-download-preview');
  const stageInfoPill = document.getElementById('stage-info-pill');

  // Control manual de tamaño para Rectangular A4
  const panelTamanoA4 = document.getElementById('panel-tamano-a4');
  const sliderTamanoA4 = document.getElementById('slider-tamano-a4');
  const valTamanoA4 = document.getElementById('val-tamano-a4');
  const hintTamanoA4 = document.getElementById('hint-tamano-a4');
  const presetBtns = document.querySelectorAll('.preset-btn');

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
  let tamanoRectA4 = 85; // Porcentaje de escala dentro de la hoja A4 (40 a 100)

  const PRECIOS = {
    fototorta: 2500,
    chocotransfer: 4500
  };

  const NOMBRES_FORMATO = {
    round: 'Redonda (hasta 20 cm para torta)',
    rect: 'Rectangular A4 (20x29 cm)',
    toppers: 'Mini Toppers (24 círculos de 4.5 cm para cupcakes / alfajores)'
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
      formatBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
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

  // --- Control manual de tamaño para Rectangular A4 ---
  function actualizarTamanoA4(val) {
    tamanoRectA4 = Math.min(100, Math.max(40, parseInt(val, 10) || 85));
    if (valTamanoA4) valTamanoA4.textContent = `${tamanoRectA4}%`;
    if (sliderTamanoA4) sliderTamanoA4.value = tamanoRectA4;

    presetBtns.forEach((btn) => {
      const pVal = parseInt(btn.dataset.preset, 10);
      btn.classList.toggle('active', pVal === tamanoRectA4);
    });

    if (hintTamanoA4) {
      const anchoCm = (20.0 * (tamanoRectA4 / 100)).toFixed(1);
      const altoCm = (28.7 * (tamanoRectA4 / 100)).toFixed(1);
      const margenCm = ((21.0 - parseFloat(anchoCm)) / 2).toFixed(1);
      if (tamanoRectA4 === 100) {
        hintTamanoA4.innerHTML = `📏 Tamaño impreso: aprox. <strong>${anchoCm} x ${altoCm} cm</strong> (hoja completa A4 sin bordes)`;
      } else {
        hintTamanoA4.innerHTML = `📏 Tamaño impreso: aprox. <strong>${anchoCm} x ${altoCm} cm</strong> (margen blanco de ${margenCm} cm para manipular y cortar)`;
      }
    }

    const scaleBox = document.getElementById('rect-scale-box');
    if (scaleBox) {
      scaleBox.style.width = `${tamanoRectA4}%`;
      scaleBox.style.height = `${tamanoRectA4}%`;
    }
  }

  if (sliderTamanoA4) {
    sliderTamanoA4.addEventListener('input', (e) => {
      actualizarTamanoA4(e.target.value);
    });
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const pVal = parseInt(btn.dataset.preset, 10);
      actualizarTamanoA4(pVal);
    });
  });

  // --- Actualizar Mockup Visual ---
  function actualizarMockupVisual() {
    if (!mockup) return;
    mockup.className = 'sheet-mockup ' + currentFormat;
    const dedicatoria = customTextInput ? customTextInput.value : '';

    // Manejar visibilidad del panel de tamaño A4
    if (panelTamanoA4) {
      panelTamanoA4.style.display = currentFormat === 'rect' ? 'block' : 'none';
    }

    // Actualizar leyenda informativa del stage
    if (stageInfoPill) {
      if (currentFormat === 'round') {
        stageInfoPill.innerHTML = '🎂 Formato Redondo: Diámetro 20 cm con base y guía de corte para torta';
      } else if (currentFormat === 'rect') {
        stageInfoPill.innerHTML = '📄 Formato Rectangular A4: Hoja de 21 x 29.7 cm con tamaño regulable';
      } else if (currentFormat === 'toppers') {
        stageInfoPill.innerHTML = '🧁 Formato Mini Toppers: Hoja A4 con 24 círculos de 4.5 cm listos para cortar';
      }
    }

    if (currentFormat === 'round') {
      if (currentImageSrc) {
        mockup.innerHTML = `
          <div class="round-cake-inner">
            <img class="user-img" src="${currentImageSrc}" alt="Diseño personalizado para torta">
            <div class="round-cut-guide"></div>
            <span class="round-cut-tag">Guía de corte Ø 20 cm</span>
            <div class="sheet-text-overlay" id="text-overlay">${escaparHTML(dedicatoria)}</div>
          </div>
        `;
      } else {
        mockup.innerHTML = `
          <div class="round-cake-inner">
            <div class="dropzone-overlay" id="dropzone-prompt">
              <span class="drop-icon">🎂</span>
              <p><strong>Arrastrá tu foto acá</strong> o hacé clic para subir</p>
              <small>Lámina redonda hasta 20 cm para torta</small>
            </div>
            <div class="round-cut-guide"></div>
            <span class="round-cut-tag">Guía de corte Ø 20 cm</span>
            <div class="sheet-text-overlay" id="text-overlay">${escaparHTML(dedicatoria)}</div>
          </div>
        `;
      }
      aplicarEstiloTexto();
    } else if (currentFormat === 'rect') {
      const scaleHtml = `
        <div class="rect-crop-corner tl"></div>
        <div class="rect-crop-corner tr"></div>
        <div class="rect-crop-corner bl"></div>
        <div class="rect-crop-corner br"></div>
        <div class="rect-scalable-box" id="rect-scale-box" style="width:${tamanoRectA4}%; height:${tamanoRectA4}%;">
          ${currentImageSrc ? `
            <img class="user-img" src="${currentImageSrc}" alt="Diseño rectangular A4">
          ` : `
            <div class="dropzone-overlay" id="dropzone-prompt">
              <span class="drop-icon">📄</span>
              <p><strong>Arrastrá tu foto acá</strong> o hacé clic para subir</p>
              <small>Hoja completa A4 (21 x 29.7 cm)</small>
            </div>
          `}
          <div class="sheet-text-overlay" id="text-overlay">${escaparHTML(dedicatoria)}</div>
        </div>
      `;
      mockup.innerHTML = scaleHtml;
      aplicarEstiloTexto();
      actualizarTamanoA4(tamanoRectA4);
    } else if (currentFormat === 'toppers') {
      let circlesHtml = '';
      for (let i = 1; i <= 24; i++) {
        if (currentImageSrc) {
          circlesHtml += `<div class="topper-circle-item" title="Mini topper #${i} (4.5 cm)"><img src="${currentImageSrc}" alt="Topper ${i}"></div>`;
        } else {
          circlesHtml += `<div class="topper-circle-item empty" title="Espacio topper #${i}"><span>#${i}</span></div>`;
        }
      }

      mockup.innerHTML = `
        <div class="toppers-grid-24">${circlesHtml}</div>
        ${!currentImageSrc ? `
          <div class="toppers-prompt-overlay" id="dropzone-prompt">
            <span class="drop-icon">🧁</span>
            <p><strong>Subí tu foto o logo</strong></p>
            <small>Se multiplicará en los 24 mini toppers (4.5 cm)</small>
          </div>
        ` : ''}
      `;
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
    mockup.addEventListener('click', (e) => {
      if (!currentImageSrc || e.target.closest('#dropzone-prompt')) {
        fileInput.click();
      }
    });

    mockup.addEventListener('dragover', (e) => {
      e.preventDefault();
      mockup.style.transform = 'scale(1.02)';
    });

    mockup.addEventListener('dragleave', () => {
      mockup.style.transform = 'none';
    });

    mockup.addEventListener('drop', (e) => {
      e.preventDefault();
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
        let w = 1000;
        let h = currentFormat === 'round' ? 1000 : 1414; // Proporción A4 (1 : 1.414)
        canvas.width = w;
        canvas.height = h;

        // Fondo blanco de hoja comestible
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);

        if (currentFormat === 'round') {
          // Base de plato/platina de pastelería
          ctx.save();
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 30, 0, Math.PI * 2);
          ctx.fillStyle = '#FFF8F0';
          ctx.fill();
          ctx.strokeStyle = '#D9B77A';
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.restore();

          // Imagen circular recortada
          const r = w / 2 - 50;
          ctx.save();
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          dibujarImagenAjustada(ctx, img, w / 2 - r, h / 2 - r, r * 2, r * 2);
          ctx.restore();

          // Guía de corte perimetral Ø 20 cm
          ctx.save();
          ctx.strokeStyle = '#D96C8A';
          ctx.lineWidth = 3;
          ctx.setLineDash([10, 8]);
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, r - 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Etiqueta guía de corte
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.strokeStyle = '#D96C8A';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(w / 2 - 90, 40, 180, 28, 14);
          ctx.fill();
          ctx.stroke();
          ctx.font = 'bold 14px sans-serif';
          ctx.fillStyle = '#D96C8A';
          ctx.textAlign = 'center';
          ctx.fillText('Guía de corte Ø 20 cm', w / 2, 59);
          ctx.restore();
        } else if (currentFormat === 'toppers') {
          // Plancha A4 de 24 círculos (4 columnas x 6 filas)
          const cols = 4;
          const rows = 6;
          const marginX = 60;
          const marginY = 80;
          const availableW = w - marginX * 2;
          const availableH = h - marginY * 2;
          const cellW = availableW / cols;
          const cellH = availableH / rows;
          const r = Math.min(cellW, cellH) * 0.44; // radio de 4.5 cm a escala

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const cx = marginX + col * cellW + cellW / 2;
              const cy = marginY + row * cellH + cellH / 2;
              const num = row * cols + col + 1;

              // Recorte circular
              ctx.save();
              ctx.beginPath();
              ctx.arc(cx, cy, r, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              dibujarImagenAjustada(ctx, img, cx - r, cy - r, r * 2, r * 2);
              ctx.restore();

              // Borde de corte punteado fino
              ctx.save();
              ctx.strokeStyle = '#D96C8A';
              ctx.lineWidth = 2;
              ctx.setLineDash([6, 5]);
              ctx.beginPath();
              ctx.arc(cx, cy, r, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();

              // Indicador discreto de número
              ctx.font = '10px sans-serif';
              ctx.fillStyle = 'rgba(90, 56, 37, 0.4)';
              ctx.textAlign = 'center';
              ctx.fillText(`${num}`, cx, cy + r + 12);
            }
          }

          // Cabecera de la hoja
          ctx.font = 'bold 18px sans-serif';
          ctx.fillStyle = '#5A3825';
          ctx.textAlign = 'center';
          ctx.fillText('Plancha de 24 Mini Toppers (4.5 cm) — Laminas Piniata', w / 2, 45);
        } else {
          // Formato Rectangular A4 con tamaño escalable
          const maxPrintW = w - 80;
          const maxPrintH = h - 80;
          const scale = (tamanoRectA4 || 85) / 100;
          const targetW = maxPrintW * scale;
          const targetH = maxPrintH * scale;
          const targetX = (w - targetW) / 2;
          const targetY = (h - targetH) / 2;

          // Dibujar marcas de corte en las esquinas de la hoja
          ctx.strokeStyle = 'rgba(90, 56, 37, 0.4)';
          ctx.lineWidth = 1.5;
          const cLen = 25;
          // TL
          ctx.beginPath(); ctx.moveTo(25, 25 + cLen); ctx.lineTo(25, 25); ctx.lineTo(25 + cLen, 25); ctx.stroke();
          // TR
          ctx.beginPath(); ctx.moveTo(w - 25 - cLen, 25); ctx.lineTo(w - 25, 25); ctx.lineTo(w - 25, 25 + cLen); ctx.stroke();
          // BL
          ctx.beginPath(); ctx.moveTo(25, h - 25 - cLen); ctx.lineTo(25, h - 25); ctx.lineTo(25 + cLen, h - 25); ctx.stroke();
          // BR
          ctx.beginPath(); ctx.moveTo(w - 25 - cLen, h - 25); ctx.lineTo(w - 25, h - 25); ctx.lineTo(w - 25, h - 25 - cLen); ctx.stroke();

          // Dibujar imagen escalada
          dibujarImagenAjustada(ctx, img, targetX, targetY, targetW, targetH);

          // Borde de corte punteado alrededor de la imagen
          ctx.strokeStyle = '#D96C8A';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 6]);
          ctx.strokeRect(targetX, targetY, targetW, targetH);
          ctx.setLineDash([]);
        }

        // Texto o dedicatoria
        const texto = customTextInput ? customTextInput.value.trim() : '';
        if (texto && currentFormat !== 'toppers') {
          ctx.font = "bold 42px 'Playfair Display', Georgia, serif";
          ctx.textAlign = 'center';
          ctx.fillStyle = textColorSelect ? textColorSelect.value : '#FFFFFF';
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#000000';
          const yPos = currentFormat === 'round' ? h - 100 : h - 70;
          ctx.strokeText(texto, w / 2, yPos);
          ctx.fillText(texto, w / 2, yPos);
        }

        // Firma al pie
        ctx.font = '15px sans-serif';
        ctx.fillStyle = 'rgba(90, 56, 37, 0.6)';
        ctx.textAlign = 'right';
        ctx.fillText('Laminas Piniata — Boceto de impresión', w - 30, h - 15);

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
      
      let formatoNombre = NOMBRES_FORMATO[currentFormat];
      if (currentFormat === 'rect') {
        formatoNombre += ` (Tamaño de imagen: ${tamanoRectA4}%${tamanoRectA4 === 100 ? ' - Hoja completa' : ' con margen blanco de corte'})`;
      }

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

  function crearMiniatura(imgSrc, callback) {
    if (!imgSrc || !imgSrc.startsWith('data:')) {
      callback(imgSrc || 'images/fototorta/Stitch Redondo.jpg');
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 160, 160);
        callback(canvas.toDataURL('image/jpeg', 0.75));
      } catch {
        callback('images/fototorta/Stitch Redondo.jpg');
      }
    };
    img.onerror = () => callback('images/fototorta/Stitch Redondo.jpg');
    img.src = imgSrc;
  }

  // --- Sumar al Carrito ---
  if (btnSumarCarrito) {
    btnSumarCarrito.addEventListener('click', () => {
      const dedicatoria = customTextInput ? customTextInput.value.trim() : '';
      const tipoNombre = currentTipo === 'fototorta' ? 'Fototorta Personalizada' : 'Chocotransfer Personalizado';
      let formatoNombre = NOMBRES_FORMATO[currentFormat];
      if (currentFormat === 'rect') {
        formatoNombre += ` [Escala: ${tamanoRectA4}%]`;
      }
      const precio = PRECIOS[currentTipo];

      crearMiniatura(currentImageSrc, (thumbSrc) => {
        const item = {
          id: 'custom-' + Date.now(),
          nombre: `${tipoNombre} (${formatoNombre}${dedicatoria ? ' - ' + dedicatoria : ''})`,
          tipo: currentTipo,
          categoria: 'Personalizado',
          precio: precio,
          imagen: thumbSrc || 'images/fototorta/Stitch Redondo.jpg'
        };

        if (typeof agregarAlCarrito === 'function') {
          agregarAlCarrito(item, 1);
          alert(`✅ ¡Agregado a tu pedido!\n\n${item.nombre}\nPrecio: ${typeof formatoPrecio === 'function' ? formatoPrecio(precio) : '$' + precio}\n\nPodés verlo en el botón "Mi pedido" del menú superior.`);
          limpiarFormulario();
        }
      });
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
  actualizarTamanoA4(tamanoRectA4);
  actualizarMockupVisual();
});
