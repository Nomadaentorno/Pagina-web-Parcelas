const header = document.querySelector("[data-header]");
const zoneFilter = document.querySelector("#zoneFilter");
const budgetFilter = document.querySelector("#budgetFilter");
const listingGrid = document.querySelector("#listingGrid");
const filterButtons = document.querySelectorAll("[data-filter]");
const modal = document.querySelector("#parcelModal");
const modalTitle = document.querySelector("[data-modal-title]");
const modalDescription = document.querySelector("[data-modal-text]");
const formNote = document.querySelector("[data-form-note]");
const galleryModal = document.querySelector("#galleryModal");
const galleryImage = document.querySelector("[data-gallery-image]");
const galleryCaption = document.querySelector("[data-gallery-caption]");
const galleryThumbs = document.querySelector("[data-gallery-thumbs]");
const zoomStage = document.querySelector("[data-zoom-stage]");
const zoomControls = document.querySelectorAll("[data-zoom-action]");
const heroLayers = document.querySelectorAll(".hero-bg-layer");
const heroImages = [
  "imagenes/valle-san-andres-1.webp",
  "imagenes/verde-pradera-8.webp",
  "imagenes/el-dorado-7.webp",
  "imagenes/altos-de-nahuelcura-2.webp",
  "imagenes/riberas-de-antuco-10.webp",
];
let activeGallery = [];
let activeGalleryIndex = 0;
let zoomState = { scale: 1, x: 0, y: 0 };
let dragState = null;
let pinchState = null;
const activePointers = new Map();
const minZoom = 1;
const maxZoom = 4;

const loadProjectImages = () => {
  document.querySelectorAll("[data-image-src]").forEach((slot) => {
    const image = new Image();
    image.onload = () => {
      slot.style.backgroundImage = `linear-gradient(0deg, rgba(12, 43, 34, 0.12), rgba(12, 43, 34, 0.12)), url("${slot.dataset.imageSrc}")`;
      slot.classList.add("has-image");
    };
    image.src = slot.dataset.imageSrc;
  });
};

const initHeroSlideshow = () => {
  if (heroLayers.length < 2 || !heroImages.length) return;

  heroImages.forEach((src) => {
    const image = new Image();
    image.src = src;
  });

  let activeLayerIndex = 0;
  let activeImageIndex = 0;
  heroLayers[activeLayerIndex].style.backgroundImage = `url("${heroImages[activeImageIndex]}")`;

  setInterval(() => {
    const nextImageIndex = (activeImageIndex + 1) % heroImages.length;
    const nextLayerIndex = activeLayerIndex === 0 ? 1 : 0;
    const currentLayer = heroLayers[activeLayerIndex];
    const nextLayer = heroLayers[nextLayerIndex];

    nextLayer.style.backgroundImage = `url("${heroImages[nextImageIndex]}")`;
    nextLayer.classList.add("is-active");
    currentLayer.classList.remove("is-active");

    activeLayerIndex = nextLayerIndex;
    activeImageIndex = nextImageIndex;
  }, 3000);
};

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const syncIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const applyZoom = () => {
  galleryImage.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale})`;
  galleryImage.style.cursor = zoomState.scale > 1 ? "grab" : "zoom-in";
};

const resetZoom = () => {
  zoomState = { scale: 1, x: 0, y: 0 };
  applyZoom();
};

const setZoom = (scale) => {
  const nextScale = Math.min(maxZoom, Math.max(minZoom, scale));
  const ratio = nextScale / zoomState.scale;
  zoomState = {
    scale: nextScale,
    x: zoomState.x * ratio,
    y: zoomState.y * ratio,
  };
  if (nextScale === minZoom) {
    zoomState.x = 0;
    zoomState.y = 0;
  }
  applyZoom();
};

const panZoom = (deltaX, deltaY) => {
  if (zoomState.scale <= minZoom) return;
  zoomState.x += deltaX;
  zoomState.y += deltaY;
  applyZoom();
};

const distanceBetweenPointers = () => {
  const pointers = [...activePointers.values()];
  if (pointers.length < 2) return 0;
  return Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
};

const showGalleryImage = (index) => {
  if (!activeGallery.length) return;
  activeGalleryIndex = (index + activeGallery.length) % activeGallery.length;
  const item = activeGallery[activeGalleryIndex];
  galleryImage.src = item.src;
  galleryImage.alt = item.alt;
  resetZoom();
  galleryCaption.textContent =
    item.caption || `${item.title} · Imagen ${activeGalleryIndex + 1} de ${activeGallery.length}`;

  galleryThumbs.querySelectorAll("button").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === activeGalleryIndex);
  });
};

const openGalleryItems = (items, isMasterplan = false) => {
  activeGallery = items;
  galleryModal.classList.toggle("single-image", activeGallery.length === 1);
  galleryModal.classList.toggle("masterplan-view", isMasterplan);

  galleryThumbs.innerHTML = "";
  if (activeGallery.length > 1) {
    activeGallery.forEach((item, index) => {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.style.backgroundImage = `url("${item.src}")`;
      thumb.setAttribute("aria-label", `Ver imagen ${index + 1}`);
      thumb.addEventListener("click", () => showGalleryImage(index));
      galleryThumbs.appendChild(thumb);
    });
  }

  galleryModal.showModal();
  showGalleryImage(0);
  syncIcons();
};

const openGallery = (button) => {
  const gallery = button.closest(".rich-gallery");
  const title = button.dataset.openGallery || "Galería";
  const items = [...gallery.querySelectorAll("[data-image-src]")].map((slot) => ({
    src: slot.dataset.imageSrc,
    alt: title,
    title,
  }));

  openGalleryItems(items);
};

const openMasterplan = (button) => {
  const title = button.dataset.openMasterplan || "Masterplan";
  const sources = (button.dataset.masterplanSrcs || button.dataset.masterplanSrc || "")
    .split("|")
    .map((source) => source.trim())
    .filter(Boolean);
  const items = sources.map((src, index) => ({
    src,
    alt: sources.length > 1 ? `Masterplan ${title} ${index + 1}` : `Masterplan ${title}`,
    title,
    caption:
      sources.length > 1 ? `${title} · Masterplan ${index + 1} de ${sources.length}` : `${title} · Masterplan`,
  }));

  openGalleryItems(items, true);
};

const filterListings = () => {
  const zone = zoneFilter.value;
  const budget = budgetFilter.value;
  const cards = listingGrid.querySelectorAll(".parcel-card");

  cards.forEach((card) => {
    const zoneMatches = zone === "todas" || card.dataset.zone === zone;
    const budgetMatches = budget === "todos" || card.dataset.budget.includes(budget);
    card.classList.toggle("is-hidden", !(zoneMatches && budgetMatches));
  });

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === zone);
  });
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

document.querySelector(".search-panel").addEventListener("submit", (event) => {
  event.preventDefault();
  filterListings();
  document.querySelector("#parcelas").scrollIntoView({ behavior: "smooth" });
});

[zoneFilter, budgetFilter].forEach((control) => {
  control.addEventListener("change", filterListings);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    zoneFilter.value = button.dataset.filter;
    filterListings();
  });
});

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    modalTitle.textContent = button.dataset.openModal;
    modalDescription.textContent = button.dataset.modalDescription || "Selecciona un proyecto para revisar su resumen comercial.";
    modal.showModal();
    syncIcons();
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    modal.close();
  });
});

document.querySelectorAll("[data-open-gallery]").forEach((button) => {
  button.addEventListener("click", () => openGallery(button));
});

document.querySelectorAll("[data-open-masterplan]").forEach((button) => {
  button.addEventListener("click", () => openMasterplan(button));
});

document.querySelector("[data-close-gallery]").addEventListener("click", () => {
  galleryModal.close();
  resetZoom();
});

document.querySelector("[data-gallery-prev]").addEventListener("click", () => {
  showGalleryImage(activeGalleryIndex - 1);
});

document.querySelector("[data-gallery-next]").addEventListener("click", () => {
  showGalleryImage(activeGalleryIndex + 1);
});

galleryModal.addEventListener("click", (event) => {
  if (event.target === galleryModal) {
    galleryModal.close();
    resetZoom();
  }
});

zoomStage.addEventListener("wheel", (event) => {
  if (!galleryModal.classList.contains("masterplan-view")) return;
  event.preventDefault();
  setZoom(zoomState.scale + (event.deltaY < 0 ? 0.25 : -0.25));
});

zoomStage.addEventListener("pointerdown", (event) => {
  if (!galleryModal.classList.contains("masterplan-view")) return;
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  zoomStage.setPointerCapture(event.pointerId);

  if (activePointers.size === 2) {
    pinchState = { distance: distanceBetweenPointers(), scale: zoomState.scale };
    dragState = null;
    return;
  }

  if (zoomState.scale > minZoom) {
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      imageX: zoomState.x,
      imageY: zoomState.y,
    };
    galleryImage.style.cursor = "grabbing";
  }
});

zoomStage.addEventListener("pointermove", (event) => {
  if (!activePointers.has(event.pointerId)) return;
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (activePointers.size === 2 && pinchState) {
    const distance = distanceBetweenPointers();
    if (distance > 0) setZoom(pinchState.scale * (distance / pinchState.distance));
    return;
  }

  if (!dragState || dragState.pointerId !== event.pointerId) return;
  zoomState.x = dragState.imageX + event.clientX - dragState.startX;
  zoomState.y = dragState.imageY + event.clientY - dragState.startY;
  applyZoom();
});

const endZoomPointer = (event) => {
  activePointers.delete(event.pointerId);
  if (dragState?.pointerId === event.pointerId) dragState = null;
  if (activePointers.size < 2) pinchState = null;
  galleryImage.style.cursor = zoomState.scale > 1 ? "grab" : "zoom-in";
};

zoomStage.addEventListener("pointerup", endZoomPointer);
zoomStage.addEventListener("pointercancel", endZoomPointer);
zoomStage.addEventListener("pointerleave", endZoomPointer);

zoomControls.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.zoomAction;
    if (action === "in") setZoom(zoomState.scale + 0.25);
    if (action === "out") setZoom(zoomState.scale - 0.25);
    if (action === "reset") resetZoom();
    if (action === "up") panZoom(0, 80);
    if (action === "down") panZoom(0, -80);
    if (action === "left") panZoom(80, 0);
    if (action === "right") panZoom(-80, 0);
  });
});

window.addEventListener("keydown", (event) => {
  if (!galleryModal.open) return;

  if (galleryModal.classList.contains("masterplan-view")) {
    if (event.key === "+" || event.key === "=") setZoom(zoomState.scale + 0.25);
    if (event.key === "-" || event.key === "_") setZoom(zoomState.scale - 0.25);
    if (event.key === "0") resetZoom();
    if (event.key === "ArrowUp") panZoom(0, 80);
    if (event.key === "ArrowDown") panZoom(0, -80);
    if (event.key === "ArrowLeft") {
      if (zoomState.scale > minZoom) panZoom(80, 0);
      else showGalleryImage(activeGalleryIndex - 1);
    }
    if (event.key === "ArrowRight") {
      if (zoomState.scale > minZoom) panZoom(-80, 0);
      else showGalleryImage(activeGalleryIndex + 1);
    }
    return;
  }

  if (event.key === "ArrowLeft") showGalleryImage(activeGalleryIndex - 1);
  if (event.key === "ArrowRight") showGalleryImage(activeGalleryIndex + 1);
});

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const message = [
    "Hola Diego, quiero recibir información de parcelas.",
    `Nombre: ${formData.get("name")}`,
    `Teléfono: ${formData.get("phone")}`,
    `Región de interés: ${formData.get("zone")}`,
    `Mensaje: ${formData.get("message") || "Sin mensaje adicional"}`,
  ].join("\n");

  window.open(`https://wa.me/56962492363?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  formNote.textContent = "Se abrió WhatsApp para enviar tu solicitud.";
});

window.addEventListener("load", syncIcons);
window.addEventListener("load", loadProjectImages);
window.addEventListener("load", initHeroSlideshow);
