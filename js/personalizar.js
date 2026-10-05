// ==========================================================================
// 🎨 LAMINAS PINIATA — CARRUSEL DE MUESTRAS Y PERSONALIZACIÓN DE PEDIDOS
// ==========================================================================
// ¡Hola! Acá podés configurar y elegir tus propias fotos de muestra.
// Podés cambiar, quitar o agregar las que quieras editando la lista MUESTRAS abajo.
//
// Cada muestra tiene:
// - id: número identificador único
// - formatoClave: 'round' (redonda) | 'rect' (rectangular) | 'toppers' (mini toppers) | 'chocotransfer'
// - filtro: 'redonda' | 'rectangular' | 'toppers' | 'chocotransfer' (coincide con los botones de filtro)
// - badge: texto visible en la esquina de la foto (ej: '🎂 Redonda (Ø 20 cm)')
// - titulo: nombre de la muestra (ej: 'Torta Stitch')
// - desc: descripción corta del trabajo
// - img: ruta de la imagen en tu proyecto (ej: 'images/fototorta/stitch-redondo.jpg')
// - tipo: 'fototorta' o 'chocotransfer'
// ==========================================================================

const MUESTRAS_DEFAULT = [
  {
    id: 1,
    formatoClave: 'round',
    filtro: 'redonda',
    badge: '🎂 Redonda (Ø 20 cm)',
    titulo: 'Torta Redonda Stitch',
    desc: 'Lámina circular comestible de 20 cm lista para colocar sobre cobertura, crema o fondant.',
    img: 'images/fototorta/stitch-redondo.jpg',
    tipo: 'fototorta'
  },
  {
    id: 2,
    formatoClave: 'round',
    filtro: 'redonda',
    badge: '🎂 Redonda (Ø 20 cm)',
    titulo: 'Torta Merlina Addams',
    desc: 'Ideal para tortas medianas y grandes de 20 a 24 cm con fondo decorado.',
    img: 'images/fototorta/Merlina Redondo.jpg',
    tipo: 'fototorta'
  },
  {
    id: 3,
    formatoClave: 'rect',
    filtro: 'rectangular',
    badge: '📄 Rectangular A4 (20x29 cm)',
    titulo: 'Lámina A4 Messi Campeón',
    desc: 'Hoja A4 completa para tortas rectangulares familiares, brownies o piononos.',
    img: 'images/fototorta/Messi rectangular.png',
    tipo: 'fototorta'
  },
  {
    id: 4,
    formatoClave: 'rect',
    filtro: 'rectangular',
    badge: '📄 Rectangular A4 (20x29 cm)',
    titulo: 'Lámina A4 Paw Patrol',
    desc: 'Diseño rectangular nítido con margen para manipular y cortar fácilmente.',
    img: 'images/fototorta/dibujos-animados-paw-patrol-chico-1-48.jpg',
    tipo: 'fototorta'
  },
  {
    id: 5,
    formatoClave: 'toppers',
    filtro: 'toppers',
    badge: '🧁 Mini Toppers (x24 círculos)',
    titulo: '24 Mini Toppers Masha y el Oso',
    desc: 'Plancha A4 con 24 círculos individuales de 4.5 cm para cupcakes, muffins y alfajores.',
    img: 'images/fototorta/dibujos-animados-masha-topper-46.jpg',
    tipo: 'fototorta'
  },
  {
    id: 6,
    formatoClave: 'toppers',
    filtro: 'toppers',
    badge: '🧁 Mini Toppers (x24 círculos)',
    titulo: '24 Mini Toppers Club Boca',
    desc: 'Círculos de 4.5 cm listos para cortar para mesas dulces y souvenirs comestibles.',
    img: 'images/fototorta/Boca topper.png',
    tipo: 'fototorta'
  },
  {
    id: 7,
    formatoClave: 'round',
    filtro: 'redonda',
    badge: '🎂 Redonda (Ø 20 cm)',
    titulo: 'Torta Corona Dorada',
    desc: 'Diseño circular elegante para cumpleaños de 15, bautismos o aniversarios.',
    img: 'images/fototorta/Corona redondo.png',
    tipo: 'fototorta'
  },
  {
    id: 8,
    formatoClave: 'chocotransfer',
    filtro: 'chocotransfer',
    badge: '🍫 Chocotransfer Especial',
    titulo: 'Chocotransfer Bombones y Paletas',
    desc: 'Hoja transfer para estampar chocolate blanco con acabados brillantes.',
    img: 'images/chocotransfer/cumpleanos-1.svg',
    tipo: 'chocotransfer'
  }
];

// Permite acceder a las muestras desde la consola o scripts externos
window.MUESTRAS_PERSONALIZADAS = MUESTRAS_DEFAULT;

document.addEventListener('DOMContentLoaded', () => {
  // Array de muestras activas
  const MUESTRAS = window.MUESTRAS_PERSONALIZADAS;

  // Elementos del Carrusel
  const track = document.getElementById('carousel-track');
  const thumbStrip = document.getElementById('carousel-thumb-strip');
  const dotsContainer = document.getElementById('carousel-dots');
  const counterDisplay = document.getElementById('carousel-counter');
  const btnPrev = document.getElementById('btn-carousel-prev');
  const btnNext = document.getElementById('btn-carousel-next');
  const filterBtns = document.querySelectorAll('.carousel-tab-btn');
  const carouselWrapper = document.getElementById('carousel-wrapper');

  // Modal de Zoom
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modal-img');
  const modalImgBox = document.querySelector('.modal-img');
  const modalCategoria = document.getElementById('modal-categoria');
  const modalNombre = document.getElementById('modal-nombre');
  const modalDesc = document.getElementById('modal-desc');
  const modalUsarFormato = document.getElementById('modal-usar-formato');
  let muestraActivaEnModal = null;

  // Formulario y opciones
  const tipoCards = document.querySelectorAll('[data-tipo-card]');
  const formatOptions = document.querySelectorAll('.form-format-option');
  const customTextInput = document.getElementById('custom-text');
  const textColorSelect = document.getElementById('custom-text-color');
  const customForm = document.getElementById('form-personalizar');
  const inputFecha = document.getElementById('fecha-entrega');
  const inputNombre = document.getElementById('nombre-cliente');
  const inputHorario = document.getElementById('horario-entrega');
  const inputNotas = document.getElementById('notas-entrega');
  const btnSumarCarrito = document.getElementById('btn-sumar-carrito');
  const precioDisplay = document.getElementById('precio-estimado-display');

  // Modal WhatsApp
  const modalWhatsapp = document.getElementById('modal-whatsapp-confirm');
  const btnCerrarModalWa = document.getElementById('btn-cerrar-modal-wa');

  // Estado
  let filtroActual = 'todos';
  let itemsVisibles = [...MUESTRAS];
  let indiceActual = 0;
  let autoplayTimer = null;
  let currentTipo = 'fototorta'; // 'fototorta' ($2500) | 'chocotransfer' ($4500)
  let currentFormat = 'round'; // 'round' | 'rect' | 'toppers'

  const PRECIOS = {
    fototorta: 2500,
    chocotransfer: 4500
  };

  const NOMBRES_FORMATO = {
    round: 'Redonda (hasta 20 cm para torta)',
    rect: 'Rectangular A4 (20x29 cm)',
    toppers: 'Mini Toppers (24 círculos de 4.5 cm para cupcakes / alfajores)'
  };

  // Configurar fecha mínima de entrega (mañana)
  if (inputFecha) {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    inputFecha.min = manana.toISOString().split('T')[0];
  }

  // --- Renderizar Carrusel ---
  function renderizarCarrusel() {
    if (!track) return;
    track.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';
    if (thumbStrip) thumbStrip.innerHTML = '';

    if (itemsVisibles.length === 0) {
      track.innerHTML = `
        <div class="carousel-slide">
          <div style="padding:48px 20px; text-align:center; color:var(--chocolate); opacity:0.8;">
            <span style="font-size:2rem; display:block; margin-bottom:8px;">🎨</span>
            <p style="margin:0; font-weight:600;">No hay muestras cargadas en esta categoría actualmente.</p>
          </div>
        </div>
      `;
      if (counterDisplay) counterDisplay.textContent = '0 / 0';
      return;
    }

    if (indiceActual >= itemsVisibles.length) {
      indiceActual = 0;
    }

    itemsVisibles.forEach((muestra, index) => {
      // 1. Slide Principal
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.innerHTML = `
        <div class="sample-card" data-sample-id="${muestra.id}" title="Hacé clic para ampliar con zoom">
          <div class="sample-img-wrap">
            <span class="sample-format-badge">${muestra.badge}</span>
            <img src="${muestra.img}" alt="${muestra.titulo}" loading="lazy" onerror="this.src='images/logo.png'">
            <span class="sample-zoom-badge">🔍 Clic para Zoom</span>
          </div>
          <div class="sample-meta">
            <h4>${muestra.titulo}</h4>
            <p>${muestra.desc}</p>
          </div>
        </div>
      `;

      // Clic para abrir modal con Zoom
      const card = slide.querySelector('.sample-card');
      if (card) {
        card.addEventListener('click', () => abrirZoomModal(muestra));
      }
      track.appendChild(slide);

      // 2. Miniatura en la Tira (Thumbnails)
      if (thumbStrip) {
        const thumbBtn = document.createElement('button');
        thumbBtn.type = 'button';
        thumbBtn.className = 'carousel-thumb-item' + (index === indiceActual ? ' active' : '');
        thumbBtn.setAttribute('aria-label', `Ver muestra ${index + 1}: ${muestra.titulo}`);
        thumbBtn.title = muestra.titulo;
        thumbBtn.innerHTML = `<img src="${muestra.img}" alt="${muestra.titulo}" loading="lazy" onerror="this.src='images/logo.png'">`;
        thumbBtn.addEventListener('click', () => {
          irADiapositiva(index);
          reiniciarAutoplay();
        });
        thumbStrip.appendChild(thumbBtn);
      }

      // 3. Dot indicador
      if (dotsContainer) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot' + (index === indiceActual ? ' active' : '');
        dot.setAttribute('aria-label', `Ir a diapositiva ${index + 1}`);
        dot.addEventListener('click', () => {
          irADiapositiva(index);
          reiniciarAutoplay();
        });
        dotsContainer.appendChild(dot);
      }
    });

    actualizarPosicionTrack();
  }

  function actualizarPosicionTrack() {
    if (!track) return;
    const offset = -(indiceActual * 100);
    track.style.transform = `translateX(${offset}%)`;

    if (counterDisplay && itemsVisibles.length > 0) {
      counterDisplay.textContent = `${indiceActual + 1} / ${itemsVisibles.length}`;
    }

    // Actualizar dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === indiceActual);
      });
    }

    // Actualizar thumbnails
    if (thumbStrip) {
      const thumbs = thumbStrip.querySelectorAll('.carousel-thumb-item');
      thumbs.forEach((th, idx) => {
        const isActive = idx === indiceActual;
        th.classList.toggle('active', isActive);
        if (isActive) {
          th.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    }
  }

  function irADiapositiva(index) {
    if (itemsVisibles.length === 0) return;
    if (index < 0) {
      indiceActual = itemsVisibles.length - 1;
    } else if (index >= itemsVisibles.length) {
      indiceActual = 0;
    } else {
      indiceActual = index;
    }
    actualizarPosicionTrack();
  }

  function diapositivaSiguiente() {
    irADiapositiva(indiceActual + 1);
  }

  function diapositivaAnterior() {
    irADiapositiva(indiceActual - 1);
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      diapositivaSiguiente();
      reiniciarAutoplay();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      diapositivaAnterior();
      reiniciarAutoplay();
    });
  }

  // Navegación con teclado (Flechas izquierda y derecha)
  document.addEventListener('keydown', (e) => {
    if (modal && modal.style.display === 'flex') return; // no mover carrusel si el modal está abierto
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowRight') {
      diapositivaSiguiente();
      reiniciarAutoplay();
    } else if (e.key === 'ArrowLeft') {
      diapositivaAnterior();
      reiniciarAutoplay();
    }
  });

  // --- Filtros de Muestras ---
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      filtroActual = btn.dataset.filter;

      if (filtroActual === 'todos') {
        itemsVisibles = [...MUESTRAS];
      } else {
        itemsVisibles = MUESTRAS.filter((m) => m.filtro === filtroActual);
      }

      indiceActual = 0;
      renderizarCarrusel();
      reiniciarAutoplay();
    });
  });

  // --- Autoplay suave con pausa al interactuar ---
  function iniciarAutoplay() {
    detenerAutoplay();
    autoplayTimer = setInterval(() => {
      diapositivaSiguiente();
    }, 4500);
  }

  function detenerAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  function reiniciarAutoplay() {
    iniciarAutoplay();
  }

  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', detenerAutoplay);
    carouselWrapper.addEventListener('mouseleave', iniciarAutoplay);
  }

  // Soporte táctil Swipe para móviles
  let touchStartX = 0;
  let touchEndX = 0;
  if (track) {
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      detenerAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (diff > 45) {
        diapositivaSiguiente();
      } else if (diff < -45) {
        diapositivaAnterior();
      }
      reiniciarAutoplay();
    }, { passive: true });
  }

  // --- Modal y Zoom Interactivo ---
  function abrirZoomModal(muestra) {
    if (!modal || !modalImg) return;
    muestraActivaEnModal = muestra;
    modalImg.src = muestra.img;
    modalImg.alt = muestra.titulo;

    if (modalCategoria) modalCategoria.textContent = muestra.badge;
    if (modalNombre) modalNombre.textContent = muestra.titulo;
    if (modalDesc) modalDesc.textContent = muestra.desc;

    // Resetear zoom inicial
    resetZoomModal();

    modal.style.display = 'flex';
  }

  function cerrarZoomModal() {
    if (modal) modal.style.display = 'none';
    resetZoomModal();
  }

  function resetZoomModal() {
    if (modalImg) {
      modalImg.style.transformOrigin = 'center center';
      modalImg.style.transform = 'scale(1)';
    }
    if (modalImgBox) {
      modalImgBox.classList.remove('is-zoomed');
    }
  }

  // Zoom interactivo al pasar el cursor (efecto lupa dinámico)
  if (modalImgBox && modalImg) {
    modalImgBox.addEventListener('mousemove', (e) => {
      const rect = modalImgBox.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      modalImg.style.transformOrigin = `${x.toFixed(1)}% ${y.toFixed(1)}%`;
      modalImg.style.transform = 'scale(2.2)';
      modalImgBox.classList.add('is-zoomed');
    });

    modalImgBox.addEventListener('mouseleave', resetZoomModal);

    // Toque en móviles para alternar zoom centrado
    modalImgBox.addEventListener('click', (e) => {
      if (window.matchMedia('(hover: none)').matches) {
        if (modalImgBox.classList.contains('is-zoomed')) {
          resetZoomModal();
        } else {
          const rect = modalImgBox.getBoundingClientRect();
          const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
          modalImg.style.transformOrigin = `${x.toFixed(1)}% ${y.toFixed(1)}%`;
          modalImg.style.transform = 'scale(2)';
          modalImgBox.classList.add('is-zoomed');
        }
      }
    });
  }

  // Cerrar modal al hacer clic en fondo o en cruz
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-cerrar-modal]')) {
        cerrarZoomModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarZoomModal();
    });
  }

  // Botón "Elegir este formato para mi pedido" en el modal
  if (modalUsarFormato) {
    modalUsarFormato.addEventListener('click', () => {
      if (muestraActivaEnModal) {
        seleccionarFormatoEnFormulario(muestraActivaEnModal.formatoClave);
        if (muestraActivaEnModal.tipo) {
          seleccionarTipoProducto(muestraActivaEnModal.tipo);
        }
      }
      cerrarZoomModal();
      if (customForm) {
        customForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // --- Formulario: Selección de Formato ---
  function seleccionarFormatoEnFormulario(formatoKey) {
    if (!formatoKey || formatoKey === 'chocotransfer') return;
    currentFormat = formatoKey;
    formatOptions.forEach((opt) => {
      const radio = opt.querySelector('input[type="radio"]');
      const isMatch = radio && radio.value === formatoKey;
      opt.classList.toggle('selected', isMatch);
      if (radio) radio.checked = isMatch;
    });
  }

  formatOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) {
        seleccionarFormatoEnFormulario(radio.value);
      }
    });
  });

  // --- Formulario: Selección de Tipo de Producto ---
  function seleccionarTipoProducto(tipoKey) {
    currentTipo = tipoKey;
    tipoCards.forEach((c) => {
      c.classList.toggle('selected', c.dataset.tipoCard === tipoKey);
    });
    actualizarPrecioVisual();
  }

  tipoCards.forEach((card) => {
    card.addEventListener('click', () => {
      seleccionarTipoProducto(card.dataset.tipoCard);
    });
  });

  function actualizarPrecioVisual() {
    if (precioDisplay && typeof formatoPrecio === 'function') {
      precioDisplay.textContent = formatoPrecio(PRECIOS[currentTipo]);
    } else if (precioDisplay) {
      precioDisplay.textContent = '$' + PRECIOS[currentTipo];
    }
  }

  // --- Envío del Formulario a WhatsApp ---
  if (customForm) {
    customForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = inputNombre ? inputNombre.value.trim() : '';
      const fecha = inputFecha ? inputFecha.value : '';
      const horario = inputHorario ? inputHorario.value.trim() : '';
      const dedicatoria = customTextInput ? customTextInput.value.trim() : '';
      const colorTexto = textColorSelect ? textColorSelect.options[textColorSelect.selectedIndex].text : '';
      const notas = inputNotas ? inputNotas.value.trim() : '';
      const precio = PRECIOS[currentTipo];
      const tipoNombre = currentTipo === 'fototorta' ? 'Lámina Fototorta' : 'Chocotransfer';
      const formatoNombre = NOMBRES_FORMATO[currentFormat] || 'Formato Estándar';

      let msg = `Hola Laminas Piniata! 🎂✨\n`;
      msg += `Quiero encargar una *LÁMINA PERSONALIZADA*:\n\n`;
      msg += `🍰 *Tipo de producto:* ${tipoNombre}\n`;
      msg += `📐 *Formato elegido:* ${formatoNombre}\n`;
      if (dedicatoria) {
        msg += `✍️ *Dedicatoria o Texto:* "${dedicatoria}" (Color: ${colorTexto})\n`;
      } else {
        msg += `✍️ *Dedicatoria:* Sin texto impreso (solo diseño/foto)\n`;
      }
      msg += `💵 *Precio estimado:* ${typeof formatoPrecio === 'function' ? formatoPrecio(precio) : '$' + precio}\n\n`;

      msg += `*Datos para la entrega:*\n`;
      msg += `👤 *Nombre y Apellido:* ${nombre}\n`;
      msg += `📅 *Fecha requerida:* ${fecha}\n`;
      msg += `⏰ *Horario estimado:* ${horario}\n`;
      if (notas) {
        msg += `📝 *Observaciones adicionales:* ${notas}\n`;
      }
      msg += `\n📎 *¡Te adjunto a continuación la foto o imagen en este chat de WhatsApp!*\n¿Me confirmás disponibilidad y datos para la seña? ¡Muchas gracias!`;

      const num = typeof WHATSAPP_NUMERO !== 'undefined' ? WHATSAPP_NUMERO : '5491133750433';
      const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;

      if (modalWhatsapp) {
        modalWhatsapp.style.display = 'flex';
      }

      window.open(url, '_blank');
    });
  }

  // Modal confirmación WhatsApp
  if (btnCerrarModalWa) {
    btnCerrarModalWa.addEventListener('click', () => {
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

  // --- Sumar al Carrito ---
  if (btnSumarCarrito) {
    btnSumarCarrito.addEventListener('click', () => {
      const dedicatoria = customTextInput ? customTextInput.value.trim() : '';
      const tipoNombre = currentTipo === 'fototorta' ? 'Fototorta Personalizada' : 'Chocotransfer Personalizado';
      const formatoNombre = NOMBRES_FORMATO[currentFormat];
      const precio = PRECIOS[currentTipo];

      const item = {
        id: 'custom-' + Date.now(),
        nombre: `${tipoNombre} (${formatoNombre}${dedicatoria ? ' - ' + dedicatoria : ''})`,
        tipo: currentTipo,
        categoria: 'Personalizado',
        precio: precio,
        imagen: currentFormat === 'toppers' 
          ? 'images/fototorta/dibujos-animados-masha-topper-46.jpg' 
          : 'images/fototorta/stitch-redondo.jpg'
      };

      if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(item, 1);
        alert(`✅ ¡Agregado a tu pedido!\n\n${item.nombre}\nPrecio: ${typeof formatoPrecio === 'function' ? formatoPrecio(precio) : '$' + precio}\n\nPodés revisarlo en el botón "Mi pedido" del menú.`);
      }
    });
  }

  // Inicializar todo
  renderizarCarrusel();
  iniciarAutoplay();
  actualizarPrecioVisual();
});
