const layoutStyles = document.createElement("link");
layoutStyles.rel = "stylesheet";
layoutStyles.href = "layout-fixes.css";
document.head.appendChild(layoutStyles);

document.documentElement.classList.add("motion-ready");
const revealTargets = document.querySelectorAll(
  ".site-header, .hero h1, .hero-side, .section-head, .project, .portrait-card, .about-card, .experience-hero h1, .experience-hero p, .career-summary, .role, .education-panel, .capabilities-panel, .site-footer"
);
revealTargets.forEach((element, index) => {
  element.classList.add("reveal-item");
  element.style.setProperty("--reveal-delay", `${(index % 6) * 85}ms`);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add("revealed"));
}

const galleryCounts = { "pikes-peak": 13, sema: 11, "the-hive": 6, "golf-car-x": 5, "live-training": 5, hlsr: 8, "alvin-express": 5 };
const gallerySeries = {
  sema: [
    { label: "2025", title: "SEMA 2025", slug: "sema", count: 11, summary: "Covered the trade-show floor as the sole media operator for the Stinger Chemical booth—filming demos and booth activity, editing each evening, scheduling next-day social posts and organizing every asset on-site." },
    { label: "2024", title: "SEMA 2024", slug: "sema", count: 0, summary: "Supported media coverage by filming booth activity and product demonstrations, contributing footage to the social pipeline and maintaining organized files throughout the event." }
  ]
};
const roleCards = document.querySelectorAll(".role");
roleCards.forEach((role, index) => {
  role.querySelectorAll(".role-highlights").forEach((highlights, listIndex) => {
    const detailLabel = highlights.dataset.label || "responsibilities";
    highlights.id = `role-details-${index + 1}-${listIndex + 1}`;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "role-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", highlights.id);
    toggle.innerHTML = `Show ${detailLabel} <span>+</span>`;
    highlights.before(toggle);
    toggle.addEventListener("click", () => {
      const expanded = highlights.classList.toggle("expanded");
      role.classList.toggle("expanded", role.querySelector(".role-highlights.expanded") !== null);
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.innerHTML = `${expanded ? "Hide" : "Show"} ${detailLabel} <span>${expanded ? "−" : "+"}</span>`;
    });
  });
});
const galleryModal = document.querySelector(".gallery-modal");
const galleryTitle = document.querySelector("#gallery-title");
const galleryClose = document.querySelector(".gallery-close");
const galleryMain = document.querySelector(".gallery-main");
const galleryCount = document.querySelector(".gallery-count");
const galleryThumbs = document.querySelector(".gallery-thumbs");
const galleryPrev = document.querySelector(".gallery-prev");
const galleryNext = document.querySelector(".gallery-next");
const gallerySeriesNav = document.querySelector(".gallery-series");
const gallerySummary = document.querySelector(".gallery-summary");
const galleryEmpty = document.querySelector(".gallery-empty");
const galleryExternal = document.querySelector(".gallery-external");
const galleryLinks = document.querySelectorAll("[data-gallery]");
let galleryLastFocus;
let activeGallery = { slug: "", title: "", count: 0, index: 0 };

function gallerySource(index) {
  return `assets/projects/${activeGallery.slug}/${String(index + 1).padStart(2, "0")}.webp`;
}

function showGalleryImage(index) {
  if (!activeGallery.count) return;
  activeGallery.index = (index + activeGallery.count) % activeGallery.count;
  galleryMain.classList.remove("image-switch");
  void galleryMain.offsetWidth;
  galleryMain.classList.add("image-switch");
  galleryMain.src = gallerySource(activeGallery.index);
  galleryMain.alt = `${activeGallery.title} project photo ${activeGallery.index + 1}`;
  galleryCount.textContent = `${activeGallery.index + 1} / ${activeGallery.count}`;
  galleryThumbs.querySelectorAll("button").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === activeGallery.index);
    button.setAttribute("aria-current", buttonIndex === activeGallery.index ? "true" : "false");
  });
  galleryThumbs.children[activeGallery.index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

function configureGallery(config) {
  activeGallery = { slug: config.slug, title: config.title, count: config.count, index: 0 };
  galleryTitle.textContent = config.title;
  gallerySummary.textContent = config.summary || "";
  gallerySummary.hidden = !config.summary;
  const thumbnails = [];
  for (let index = 0; index < config.count; index += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Show photo ${index + 1}`);
    const image = document.createElement("img");
    image.src = gallerySource(index);
    image.alt = "";
    image.loading = "lazy";
    button.appendChild(image);
    button.addEventListener("click", () => showGalleryImage(index));
    thumbnails.push(button);
  }
  galleryThumbs.replaceChildren(...thumbnails);
  const hasPhotos = config.count > 0;
  galleryMain.hidden = !hasPhotos;
  galleryPrev.hidden = !hasPhotos;
  galleryNext.hidden = !hasPhotos;
  galleryEmpty.hidden = hasPhotos;
  galleryCount.textContent = hasPhotos ? "" : "No gallery images for this year";
  if (!hasPhotos) {
    galleryMain.removeAttribute("src");
    galleryEmpty.textContent = "Coverage details are available; photographs have not been added for this year.";
  } else {
    showGalleryImage(0);
  }
}

function openGallery(link) {
  const slug = link.dataset.gallery;
  const count = galleryCounts[slug];
  if (!galleryModal || !count) return;
  galleryLastFocus = link;
  const externalLinks = {
    "live-training": { url: "https://www.youtube.com/@stingerchemical/streams", label: "Watch live streams ↗" },
    sema: { url: "https://www.youtube.com/live/Hy9Nc084BDc?si=Mvj7WKtp6MxL7tVA", label: "Watch SEMA video ↗" },
    "the-hive": { url: "https://youtube.com/playlist?list=PLmn5A3rLXNUBpi6mNTQ6FqtA9tXo6eHY5&si=DA62KOtz_3HTT7ke", label: "Watch The Hive playlist ↗" },
    "pikes-peak": { url: "https://youtu.be/uBp9tTCdJpw?si=ZR0ub0nMTmma9aj3", label: "Watch Pikes Peak documentary ↗" },
    "golf-car-x": { url: "https://www.golfcarx.com/", label: "Visit Golf Car X ↗" },
    "alvin-express": { url: "https://alvinexpresscw.com/", label: "Visit Alvin Express ↗" }
  };
  const external = externalLinks[slug];
  const externalUrl = external?.url || "";
  galleryExternal.hidden = !externalUrl;
  galleryExternal.href = externalUrl || "#";
  galleryExternal.textContent = external?.label || "";
  galleryModal.classList.add("open");
  galleryModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  const series = gallerySeries[slug];
  gallerySeriesNav.replaceChildren();
  gallerySeriesNav.hidden = !series;
  if (series) {
    series.forEach((entry, entryIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = entry.label;
      button.classList.toggle("active", entryIndex === 0);
      button.addEventListener("click", () => {
        gallerySeriesNav.querySelectorAll("button").forEach(tab => tab.classList.remove("active"));
        button.classList.add("active");
        configureGallery(entry);
      });
      gallerySeriesNav.appendChild(button);
    });
    configureGallery(series[0]);
  } else {
    configureGallery({ slug, title: link.dataset.title, count, summary: "" });
  }
  galleryClose.focus();
}

function closeGallery() {
  if (!galleryModal) return;
  galleryModal.classList.remove("open");
  galleryModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  galleryMain.removeAttribute("src");
  galleryThumbs.replaceChildren();
  gallerySeriesNav.replaceChildren();
  gallerySummary.textContent = "";
  activeGallery = { slug: "", title: "", count: 0, index: 0 };
  if (galleryLastFocus) galleryLastFocus.focus();
}

galleryLinks.forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); openGallery(link); }));
galleryClose?.addEventListener("click", closeGallery);
galleryPrev?.addEventListener("click", () => showGalleryImage(activeGallery.index - 1));
galleryNext?.addEventListener("click", () => showGalleryImage(activeGallery.index + 1));

const modal = document.querySelector(".contact-modal");
const openers = document.querySelectorAll(".contact-trigger");
const closeButton = document.querySelector(".modal-close");
let lastFocus;

function openModal() { lastFocus = document.activeElement; modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); closeButton.focus(); }
function closeModal() { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open"); if (lastFocus) lastFocus.focus(); }

openers.forEach((button) => button.addEventListener("click", openModal));
closeButton.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", (event) => {
  if (galleryModal?.classList.contains("open")) {
    if (event.key === "Escape") closeGallery();
    if (event.key === "ArrowLeft") showGalleryImage(activeGallery.index - 1);
    if (event.key === "ArrowRight") showGalleryImage(activeGallery.index + 1);
    return;
  }
  if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
});
