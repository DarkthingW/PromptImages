
let ITEMS = [];
let CATEGORIES = ["Tous"];

async function loadPrompts() {
  const response = await fetch("prompts.json");
  ITEMS = await response.json();
  CATEGORIES = [
    "Tous",
    ...Array.from(new Set(ITEMS.map(item => item.category))).sort((a, b) => a.localeCompare(b, "fr"))
  ];
  refreshFilters();
  render();
}

// =============================
// MODIFIE TES PROMPTS / IMAGES ICI
// =============================
// =============================
// MODIFIE TES PROMPTS / IMAGES ICI
// =============================
// Pour ajouter une entrée, copie un bloc complet { ... } dans ITEMS.
// Champs utiles : id, title, prompt, category, images.
// Images : src = chemin du fichier, alt = texte alternatif, label = texte affiché sur l'image.
let ITEMS = [];
let CATEGORIES = ["Tous"];
const PAGES = ["Toutes"];
let activeCategory = "Tous";
let activePage = "Toutes";

const gallery = document.getElementById("gallery");
const search = document.getElementById("search");
const sort = document.getElementById("sort");
const counter = document.getElementById("counter");
const empty = document.getElementById("empty");

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
}

function buildFilters() {
  const catBox = document.getElementById("categoryFilters");
  catBox.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "chip" + (cat === activeCategory ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeCategory = cat;
      buildFilters();
      render();
    });
    catBox.appendChild(btn);
  });
}

function refreshFilters() {
  buildFilters();
}

function itemMatches(item, q) {
  const haystack = [item.title, item.prompt, item.category, ...item.images.map(i => i.label)].join(" ").toLowerCase();
  return haystack.includes(q);
}

function render() {
  const q = search.value.trim().toLowerCase();
  let results = ITEMS.filter(item => {
    const catOk = activeCategory === "Tous" || item.category === activeCategory;
    const pageOk = true;
    const searchOk = !q || itemMatches(item, q);
    return catOk && pageOk && searchOk;
  });

  if (sort.value === "title") results.sort((a,b) => a.title.localeCompare(b.title, "fr"));
  if (sort.value === "category") results.sort((a,b) => (a.category + a.title).localeCompare(b.category + b.title, "fr"));

  gallery.innerHTML = results.map(item => `
    <article class="card" id="${escapeHtml(item.id)}">
      <div class="card-header">
        <h2>${escapeHtml(item.title)}</h2>
        <div class="meta">
          <span class="badge">${escapeHtml(item.category)}</span>
        </div>
      </div>
      ${item.prompt ? `
        <div class="prompt">${escapeHtml(item.prompt)}</div>
        <div class="prompt-actions">
          <button type="button" class="copy-btn" data-prompt="${escapeHtml(item.prompt)}">Copier le prompt</button>
        </div>
      ` : ""}
      <div class="thumb-grid">
        ${item.images.map(img => `
          <button class="thumb" type="button" data-src="${escapeHtml(img.src)}" data-alt="${escapeHtml(img.alt)}">
            <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" loading="lazy">
            <span>${escapeHtml(img.label)}</span>
          </button>
        `).join("")}
      </div>

    </article>
  `).join("");

  counter.textContent = `${results.length} résultat${results.length > 1 ? "s" : ""} affiché${results.length > 1 ? "s" : ""} sur ${ITEMS.length}`;
  empty.style.display = results.length ? "none" : "block";

  document.querySelectorAll(".thumb").forEach(btn => {
    btn.addEventListener("click", () => openLightbox(btn.dataset.src, btn.dataset.alt));
  });
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.prompt || "");
        showToast("Prompt copié");
      } catch(e) {
        showToast("Copie impossible");
      }
    });
  });
}

function openLightbox(src, alt) {
  const lb = document.getElementById("lightbox");
  lb.querySelector("img").src = src;
  lb.querySelector("img").alt = alt || "";
  lb.style.display = "flex";
}
function closeLightbox() {
  const lb = document.getElementById("lightbox");
  lb.style.display = "none";
  lb.querySelector("img").src = "";
}
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 1400);
}

document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target.id === "lightbox" || e.target.classList.contains("close")) closeLightbox();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLightbox();
});
search.addEventListener("input", render);
sort.addEventListener("change", render);
document.getElementById("reset").addEventListener("click", () => {
  search.value = "";
  sort.value = "original";
  activeCategory = "Tous";
  refreshFilters();
  render();
});


loadPrompts();
