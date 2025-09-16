document.addEventListener('DOMContentLoaded', ()=>{

  function makeProductCard(p){
    const li = document.createElement('li');
    li.innerHTML = `<img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'"><div style="margin-top:8px;font-weight:700">${p.name}</div><div class="small">$${p.price.toFixed(2)}</div>`;
    return li;
  }

  fetch('data/products.json').then(r=>r.json()).then(data=>{
    const popular = document.getElementById('popular-list');
    const pc = document.getElementById('pc-list');
    const books = document.getElementById('books-list');
    const gamingList = document.getElementById('gaming-list');
    const categoryList = document.getElementById('category-list');
    const basicsImage = document.getElementById('basics-image');

    // populate slides
    data.slice(0,8).forEach(p=> popular.appendChild(makeProductCard(p)));
    data.filter(p=>p.category==='gaming').forEach(p=> pc.appendChild(makeProductCard(p)));
    data.filter(p=>p.category==='books').forEach(p=> books.appendChild(makeProductCard(p)));

    // populate gaming small tiles with images from product items (no local images)
    data.filter(p=>p.category==='gaming').forEach(p=>{
      const d = document.createElement('div');
      d.innerHTML = `<img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/80x60?text=No+Image'"><div style="font-weight:700;font-size:12px">${p.name.split(' ')[0]}</div>`;
      gamingList.appendChild(d);
    });

    // categories list
    const cats = Array.from(new Set(data.map(p=>p.category)));
    cats.forEach(c=>{
      const d = document.createElement('div');
      d.innerHTML = `<span style="font-weight:700;text-transform:capitalize">${c}</span>`;
      categoryList.appendChild(d);
    });

    // basics image: use the first product image as a placeholder
    if(data.length>0){
      basicsImage.innerHTML = `<img src="${data[0].image}" alt="basics" style="width:100%;border-radius:6px">`;
    }
  }).catch(err=>{
    console.error('Failed to load products.json', err);
    const popular = document.getElementById('popular-list');
    if(popular) popular.innerHTML = '<li>Products failed to load. Check data/products.json</li>';
  });

  // back to top
  const backtop = document.querySelector('.backtop');
  if(backtop) backtop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));

  // scroll buttons
  function wireScroll(leftSelector, rightSelector, targetSelector){
    const left = document.querySelector(leftSelector);
    const right = document.querySelector(rightSelector);
    const target = document.querySelector(targetSelector);
    if(!left || !right || !target) return;
    right.addEventListener('click', ()=> target.scrollBy({left:900,behavior:'smooth'}));
    left.addEventListener('click', ()=> target.scrollBy({left:-900,behavior:'smooth'}));
  }
  wireScroll('.l-btn','.r-btn','#popular-list');
  wireScroll('.btn-1b','.btn-1a','#pc-list');
  wireScroll('.btn-1c','.btn-1d','#books-list');

  // search
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  function performSearch(q){
    q = (q||'').toLowerCase().trim();
    fetch('data/products.json').then(r=>r.json()).then(data=>{
      const results = data.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      const popular = document.getElementById('popular-list');
      popular.innerHTML = '';
      if(results.length===0){
        popular.innerHTML = '<li>No products match your search.</li>';
      } else {
        results.forEach(p=> popular.appendChild(makeProductCard(p)));
      }
      window.scrollTo({top:400,behavior:'smooth'});
    });
  }
  if(searchBtn) searchBtn.addEventListener('click', ()=> performSearch(searchInput.value));
  if(searchInput) searchInput.addEventListener('keydown', e=>{ if(e.key==='Enter') performSearch(searchInput.value); });

  // Chat assistant (proxy then fallback)
  (function(){
    // Enhanced chatbot is now handled by enhanced-chat.js
    console.log('🤖 Enhanced AI Chatbot initialized');
  })();

});




const leftBtn= document.querySelector(".l-btn");
const rightBtn = document.querySelector(".r-btn");


rightBtn.addEventListener("click",
    function(event){
        const conent=document.querySelector(".product-slide");
        conent.scrollLeft +=1100;
        event.preventDefault();

})
leftBtn.addEventListener("click",
    function(event){
        const conent=document.querySelector(".product-slide");
        conent.scrollLeft -=1100;
        event.preventDefault();

})
const leftBtn1= document.querySelector(".btn-1b");
const rightBtn1 = document.querySelector(".btn-1a");


rightBtn1.addEventListener("click",
    function(event){
        const conent=document.querySelector(".product-slide-1");
        conent.scrollLeft +=1100;
        event.preventDefault();

})
leftBtn1.addEventListener("click",
    function(event){
        const conent=document.querySelector(".product-slide-1");
        conent.scrollLeft -=1100;
        event.preventDefault();

})
const leftBtn2= document.querySelector(".btn-1c");
const rightBtn2 = document.querySelector(".btn-1d");


rightBtn2.addEventListener("click",
    function(event){
        const conent=document.querySelector(".product-slide-2");
        conent.scrollLeft +=1100;
        event.preventDefault();

})
leftBtn2.addEventListener("click",
    function(event){
        const conent=document.querySelector(".product-slide-2");
        conent.scrollLeft -=1100;
        event.preventDefault();

})

const backtop = document.querySelector(".backtop");

backtop.addEventListener("click",()=>{
    window.scrollTo({
        top:0,
        behavior:"smooth"
    })
})

const sidebar=document.querySelector(".sidebar");
const cross=document.querySelector(".fa-xmark");
const black=document.querySelector(".black");
const sidebtn=document.querySelector(".second-1");

sidebtn.addEventListener("click",()=>{
    sidebar.classList.add("active");
    cross.classList.add("active");
    black.classList.add("active");
    document.body.classList.add("stop-scroll");
})
cross.addEventListener("click",()=>{
    sidebar.classList.remove("active");
    cross.classList.remove("active");
    black.classList.remove("active");
    document.body.classList.remove("stop-scroll");
})

const sign=document.querySelector(".ac");
const tri=document.querySelector(".triangle");
const signin=document.querySelector(".hdn-sign");

sign.addEventListener("click",()=>{
    black.classList.toggle("active-1");
    signin.classList.toggle("active");
    tri.classList.toggle("active");
    document.body.classList.toggle("stop-scroll");
})

