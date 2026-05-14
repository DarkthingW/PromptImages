let ITEMS=[];
let activeCategory="Tous";

async function init(){
 const response=await fetch("prompts.json");
 ITEMS=await response.json();
 renderCategories();
 render();
}

function renderCategories(){
 const categories=[
   "Tous",
   ...new Set(ITEMS.map(i=>i.category))
 ].sort((a,b)=>a.localeCompare(b,"fr"));

 const el=document.getElementById("categories");
 el.innerHTML="";

 categories.forEach(category=>{
   const btn=document.createElement("button");
   btn.className="chip";
   btn.textContent=category;

   btn.onclick=()=>{
     activeCategory=category;
     render();
   };

   el.appendChild(btn);
 });
}

function render(){
 const gallery=document.getElementById("gallery");
 const q=document.getElementById("search").value.toLowerCase();

 const filtered=ITEMS.filter(item=>{
   const okCategory=activeCategory==="Tous" || item.category===activeCategory;
   const okSearch=item.title.toLowerCase().includes(q) || item.prompt.toLowerCase().includes(q);
   return okCategory && okSearch;
 });

 gallery.innerHTML=filtered.map(item=>`
   <div class="card">
     ${item.images?.[0] ? `<img src="${item.images[0].src}" alt="">` : ""}
     <h2>${item.title}</h2>
     <strong>${item.category}</strong>
     <div class="prompt">${item.prompt}</div>
   </div>
 `).join("");
}

document.addEventListener("input",e=>{
 if(e.target.id==="search") render();
});

init();
