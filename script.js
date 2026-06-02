let ITEMS = [];
let ORIGINAL_ITEMS = [];
let CATEGORIES = ["Tous"];
let activeCategory = "Tous";

const gallery = document.getElementById("gallery");
const search = document.getElementById("search");
const sort = document.getElementById("sort");
const counter = document.getElementById("counter");
const empty = document.getElementById("empty");

async function loadPrompts() {
  try {
    const response = await fetch("./prompts.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Impossible de charger prompts.json (${response.status})`);
    }

    ITEMS = await response.json();
    ORIGINAL_ITEMS = [...ITEMS];

    CATEGORIES = [
      "Tous",
      ...Array.from(new Set(ITEMS.map(item => item.category))).sort((a, b) => a.localeCompare(b, "fr"))
    ];

    buildFilters();
    render();

  } catch (error) {
    console.error(error);
    gallery.innerHTML = `
      <div class="empty" style="display:block; grid-column: 1 / -1;">
        Impossible de charger <strong>prompts.json</strong>.<br>
        Vérifie que le fichier est bien à la racine du dépôt GitHub, à côté de index.html.
      </div>
    `;
    counter.textContent = "Erreur de chargement.";
  }
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[ch]));
}

function buildFilters() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = "";

  CATEGORIES.forEach(cat => {
    const count = cat === "Tous"
      ? ITEMS.length
      : ITEMS.filter(item => item.category === cat).length;

    const option = document.createElement("option");
    option.value = cat;
    option.textContent = `${cat} (${count})`;

    if (cat === activeCategory) {
      option.selected = true;
    }

    select.appendChild(option);
  });
}

function refreshFilters() {
  buildFilters();
}

function itemMatches(item, q) {
  const labels = (item.images || []).map(i => i.label || "").join(" ");
  const haystack = [item.title, item.prompt, item.category, labels].join(" ").toLowerCase();
  return haystack.includes(q);
}

function render() {
  const q = search.value.trim().toLowerCase();

  let results = ITEMS.filter(item => {
    const catOk = activeCategory === "Tous" || item.category === activeCategory;
    const searchOk = !q || itemMatches(item, q);
    return catOk && searchOk;
  });

  if (sort.value === "title") {
    results.sort((a,b) => a.title.localeCompare(b.title, "fr"));
  }

  if (sort.value === "category") {
    results.sort((a,b) => (a.category + a.title).localeCompare(b.category + b.title, "fr"));
  }

  if (sort.value === "title-desc") {
    results.sort((a,b) => b.title.localeCompare(a.title, "fr"));
  }

  if (sort.value === "category-desc") {
    results.sort((a,b) => (b.category + b.title).localeCompare(a.category + a.title, "fr"));
  }

  if (sort.value === "prompt-long") {
    results.sort((a,b) => (b.prompt?.length || 0) - (a.prompt?.length || 0));
  }

  if (sort.value === "prompt-short") {
    results.sort((a,b) => (a.prompt?.length || 0) - (b.prompt?.length || 0));
  }

  if (sort.value === "newest") {
    results.sort((a,b) => ORIGINAL_ITEMS.indexOf(b) - ORIGINAL_ITEMS.indexOf(a));
  }

  if (sort.value === "original") {
    results.sort((a,b) => ORIGINAL_ITEMS.indexOf(a) - ORIGINAL_ITEMS.indexOf(b));
  }

  if (sort.value === "random") {
    results.sort(() => Math.random() - 0.5);
  }

  gallery.innerHTML = results.map(item => `
    <article class="card" id="${escapeHtml(item.id)}">
      <div class="card-header">
        <h2>${escapeHtml(item.title)}</h2>
        <p class="subtitle">${escapeHtml(item.subtitle || "")}</p>
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
        ${(item.images || []).map(img => `
          <button class="thumb" type="button" data-src="${escapeHtml(img.src)}" data-alt="${escapeHtml(img.alt || item.title)}">
            <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || item.title)}" loading="lazy">
            <span>${escapeHtml(img.label || "")}</span>
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
        await navigator.clipboard.writeText(btn.dataset.prompt);
      } catch {
        fallbackCopy(btn.dataset.prompt);
      }
      showToast("Prompt copié");
    });
  });
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 1600);
}

function openLightbox(src, alt) {
  const lb = document.getElementById("lightbox");
  const img = lb.querySelector("img");

  img.src = src;
  img.alt = alt || "";
  lb.style.display = "flex";
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  lb.style.display = "none";
  lb.querySelector("img").src = "";
}

document.querySelector("#lightbox .close").addEventListener("click", closeLightbox);

document.getElementById("lightbox").addEventListener("click", e => {
  if (e.target.id === "lightbox") closeLightbox();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLightbox();
});

search.addEventListener("input", render);
sort.addEventListener("change", render);

document.getElementById("categoryFilter").addEventListener("change", e => {
  activeCategory = e.target.value;
  render();
});

document.getElementById("reset").addEventListener("click", () => {
  search.value = "";
  sort.value = "original";
  activeCategory = "Tous";
  refreshFilters();
  render();
});

loadPrompts();