let ITEMS = [];
let ORIGINAL_ITEMS = [];
let CATEGORIES = [{ id: "__all__", index: 0, name: "Tous" }];
let CATEGORY_BY_ID = new Map();
let activeCategoryId = "__all__";

const gallery = document.getElementById("gallery");
const search = document.getElementById("search");
const sort = document.getElementById("sort");
const counter = document.getElementById("counter");
const empty = document.getElementById("empty");
const categoryFilter = document.getElementById("categoryFilter");

function assertV2PromptsData(rawData) {
  if (!rawData || Array.isArray(rawData) || typeof rawData !== "object") {
    throw new Error("prompts.json doit être un objet v2: { version, categories, prompts }.");
  }

  if (rawData.version !== 2) {
    throw new Error("prompts.json doit utiliser version: 2.");
  }

  if (!Array.isArray(rawData.categories)) {
    throw new Error("prompts.json doit contenir un tableau categories.");
  }

  if (!Array.isArray(rawData.prompts)) {
    throw new Error("prompts.json doit contenir un tableau prompts.");
  }
}

function normalizePromptsData(rawData) {
  assertV2PromptsData(rawData);

  const categoryIds = new Set();
  const categoryList = rawData.categories.map((category, index) => {
    const id = String(category.id || "").trim();
    const name = String(category.name || "").trim();

    if (!id) {
      throw new Error(`Catégorie invalide à l'index ${index}: id manquant.`);
    }

    if (!name) {
      throw new Error(`Catégorie invalide (${id}): name manquant.`);
    }

    if (categoryIds.has(id)) {
      throw new Error(`Catégorie dupliquée: ${id}.`);
    }

    categoryIds.add(id);

    return {
      id,
      name,
      index: Number.isFinite(Number(category.index)) ? Number(category.index) : index + 1
    };
  });

  CATEGORY_BY_ID = new Map(categoryList.map(category => [category.id, category]));

  const orphanPrompts = rawData.prompts
    .filter(item => !CATEGORY_BY_ID.has(item.categoryId))
    .slice(0, 8)
    .map(item => `${item.id || "sans-id"} -> ${item.categoryId || "categoryId manquant"}`);

  if (orphanPrompts.length > 0) {
    throw new Error(`Certains prompts pointent vers une catégorie inexistante: ${orphanPrompts.join(", ")}.`);
  }

  ITEMS = rawData.prompts.map((item, originalIndex) => {
    const category = CATEGORY_BY_ID.get(item.categoryId);

    return {
      ...item,
      category: category.name,
      categoryIndex: category.index,
      originalIndex
    };
  });

  CATEGORIES = [
    { id: "__all__", index: 0, name: "Tous" },
    ...categoryList.sort((a, b) => {
      const indexCompare = a.index - b.index;
      if (indexCompare !== 0) return indexCompare;
      return a.name.localeCompare(b.name, "fr");
    })
  ];

  ORIGINAL_ITEMS = [...ITEMS];
}

async function loadPrompts() {
  try {
    const response = await fetch("./prompts.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Impossible de charger prompts.json (${response.status})`);
    }

    const rawData = await response.json();
    normalizePromptsData(rawData);

    buildFilters();
    updateStats();

    sort.value = "random";
    render();

  } catch (error) {
    console.error(error);
    gallery.innerHTML = `
      <div class="empty" style="display:block; grid-column: 1 / -1;">
        Impossible de charger <strong>prompts.json</strong>.<br>
        Format requis: <strong>{ version: 2, categories: [], prompts: [] }</strong> avec <strong>categoryId</strong> dans chaque prompt.<br>
        ${escapeHtml(error.message || "Erreur inconnue")}
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

function countItemsForCategory(categoryId) {
  if (categoryId === "__all__") {
    return ITEMS.length;
  }

  return ITEMS.filter(item => item.categoryId === categoryId).length;
}

function buildFilters() {
  categoryFilter.innerHTML = "";

  CATEGORIES.forEach(category => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = `${category.name} (${countItemsForCategory(category.id)})`;

    if (category.id === activeCategoryId) {
      option.selected = true;
    }

    categoryFilter.appendChild(option);
  });
}

function refreshFilters() {
  buildFilters();
}

function updateStats() {
  const stats = document.querySelector(".stats");
  if (!stats) return;

  const promptsWithImages = ITEMS.filter(item => (item.images || []).length > 0).length;
  const imageCount = ITEMS.reduce((total, item) => total + (item.images || []).length, 0);

  stats.innerHTML = `
    <div class="stat">
      <strong>${ITEMS.length}</strong>
      <span>prompts</span>
    </div>
    <div class="stat">
      <strong>${CATEGORIES.length - 1}</strong>
      <span>catégories</span>
    </div>
    <div class="stat">
      <strong>${promptsWithImages}</strong>
      <span>avec images</span>
    </div>
    <div class="stat">
      <strong>${imageCount}</strong>
      <span>images liées</span>
    </div>
  `;
}

function itemMatches(item, q) {
  const labels = (item.images || []).map(i => i.label || "").join(" ");
  const haystack = [
    item.title,
    item.subtitle,
    item.prompt,
    item.category,
    item.categoryId,
    labels
  ].join(" ").toLowerCase();

  return haystack.includes(q);
}

function render() {
  const q = search.value.trim().toLowerCase();

  let results = ITEMS.filter(item => {
    const catOk = activeCategoryId === "__all__" || item.categoryId === activeCategoryId;
    const searchOk = !q || itemMatches(item, q);
    return catOk && searchOk;
  });

  if (sort.value === "title") {
    results.sort((a, b) => a.title.localeCompare(b.title, "fr"));
  }

  if (sort.value === "title-desc") {
    results.sort((a, b) => b.title.localeCompare(a.title, "fr"));
  }

  if (sort.value === "category") {
    results.sort((a, b) => {
      const categoryCompare = a.category.localeCompare(b.category, "fr");
      if (categoryCompare !== 0) return categoryCompare;
      return a.title.localeCompare(b.title, "fr");
    });
  }

  if (sort.value === "category-desc") {
    results.sort((a, b) => {
      const categoryCompare = b.category.localeCompare(a.category, "fr");
      if (categoryCompare !== 0) return categoryCompare;
      return b.title.localeCompare(a.title, "fr");
    });
  }

  if (sort.value === "prompt-long") {
    results.sort((a, b) => (b.prompt?.length || 0) - (a.prompt?.length || 0));
  }

  if (sort.value === "prompt-short") {
    results.sort((a, b) => (a.prompt?.length || 0) - (b.prompt?.length || 0));
  }

  if (sort.value === "newest") {
    results.sort((a, b) => b.originalIndex - a.originalIndex);
  }

  if (sort.value === "original") {
    results.sort((a, b) => a.originalIndex - b.originalIndex);
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

categoryFilter.addEventListener("change", e => {
  activeCategoryId = e.target.value;
  render();
});

document.getElementById("reset").addEventListener("click", () => {
  search.value = "";
  sort.value = "random";
  activeCategoryId = "__all__";
  refreshFilters();
  render();
});

loadPrompts();
