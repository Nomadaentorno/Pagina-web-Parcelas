const header = document.querySelector("[data-header]");
const zoneFilter = document.querySelector("#zoneFilter");
const budgetFilter = document.querySelector("#budgetFilter");
const useFilter = document.querySelector("#useFilter");
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
let activeGallery = [];
let activeGalleryIndex = 0;

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

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const syncIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const showGalleryImage = (index) => {
  if (!activeGallery.length) return;
  activeGalleryIndex = (index + activeGallery.length) % activeGallery.length;
  const item = activeGallery[activeGalleryIndex];
  galleryImage.src = item.src;
  galleryImage.alt = item.alt;
  galleryCaption.textContent = `${item.title} · Imagen ${activeGalleryIndex + 1} de ${activeGallery.length}`;

  galleryThumbs.querySelectorAll("button").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === activeGalleryIndex);
  });
};

const openGallery = (button) => {
  const gallery = button.closest(".rich-gallery");
  const title = button.dataset.openGallery || "Galería";
  activeGallery = [...gallery.querySelectorAll("[data-image-src]")].map((slot) => ({
    src: slot.dataset.imageSrc,
    alt: title,
    title,
  }));

  galleryThumbs.innerHTML = "";
  activeGallery.forEach((item, index) => {
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.style.backgroundImage = `url("${item.src}")`;
    thumb.setAttribute("aria-label", `Ver imagen ${index + 1}`);
    thumb.addEventListener("click", () => showGalleryImage(index));
    galleryThumbs.appendChild(thumb);
  });

  galleryModal.showModal();
  showGalleryImage(0);
  syncIcons();
};

const filterListings = () => {
  const zone = zoneFilter.value;
  const budget = budgetFilter.value;
  const use = useFilter.value;
  const cards = listingGrid.querySelectorAll(".parcel-card");

  cards.forEach((card) => {
    const zoneMatches = zone === "todas" || card.dataset.zone === zone;
    const budgetMatches = budget === "todos" || card.dataset.budget.includes(budget);
    const useMatches = use === "todos" || card.dataset.use.includes(use);
    card.classList.toggle("is-hidden", !(zoneMatches && budgetMatches && useMatches));
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

[zoneFilter, budgetFilter, useFilter].forEach((control) => {
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

document.querySelector("[data-close-gallery]").addEventListener("click", () => {
  galleryModal.close();
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
  }
});

window.addEventListener("keydown", (event) => {
  if (!galleryModal.open) return;
  if (event.key === "ArrowLeft") showGalleryImage(activeGalleryIndex - 1);
  if (event.key === "ArrowRight") showGalleryImage(activeGalleryIndex + 1);
});

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  formNote.textContent = "Solicitud recibida. Te contactaremos para coordinar alternativas y visita.";
  event.currentTarget.reset();
});

window.addEventListener("load", syncIcons);
window.addEventListener("load", loadProjectImages);
