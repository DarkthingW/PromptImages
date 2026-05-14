
let ITEMS = [];
let activeCategory = "Tous";

async function init(){
  const response = await fetch("prompts.json");
  ITEMS = await response.json();

  renderCategories();
  renderGallery();
}

function renderCategories(){
  const categories = [
    "Tous",
    ...new Set(ITEMS.map(i => i.category))
  ].sort((a,b)=>a.localeCompare(b,"fr"));

  const container = document.getElementById("categories");
  container.innerHTML = "";

  categories.forEach(category => {
    const btn = document.createElement("button");

    btn.className =
      "chip" + (category === activeCategory ? " active" : "");

    btn.textContent = category;

    btn.onclick = () => {
      activeCategory = category;
      renderCategories();
      renderGallery();
    };

    container.appendChild(btn);
  });
}

function renderGallery(){
  const gallery = document.getElementById("gallery");

  const search =
    document.getElementById("search").value.toLowerCase();

  const filtered = ITEMS.filter(item => {

    const categoryOk =
      activeCategory === "Tous" ||
      item.category === activeCategory;

    const searchOk =
      item.title.toLowerCase().includes(search) ||
      item.prompt.toLowerCase().includes(search);

    return categoryOk && searchOk;
  });

  gallery.innerHTML = filtered.map(item => `
    <article class="card">

      <div class="image-wrapper">
        ${
          item.images?.[0]
            ? `<img src="${item.images[0].src}" alt="${item.title}">`
            : ""
        }
      </div>

      <div class="card-content">

        <div class="badge">${item.category}</div>

        <h2>${item.title}</h2>

        <div class="prompt">${item.prompt}</div>

      </div>

    </article>
  `).join("");
}

document.addEventListener("input", e => {
  if(e.target.id === "search"){
    renderGallery();
  }
});

init();
