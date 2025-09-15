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
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    let conversation = [{role:'system', content: "You are ShopMart assistant. Help customers with orders, returns, product info."}];

    function appendMessage(text, who){
      const div = document.createElement('div');
      div.className = 'msg ' + (who==='user' ? 'user' : 'bot');
      const span = document.createElement('div');
      span.className = 'bubble ' + (who==='user' ? 'user' : 'bot');
      span.textContent = text;
      div.appendChild(span);
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatToggle && chatToggle.addEventListener('click', ()=>{
      chatWindow.style.display = 'flex';
      chatToggle.style.display = 'none';
      if(chatMessages.children.length===0){
        appendMessage('Hi! I am ShopMart Assistant. How can I help you today?', 'bot');
      }
    });
    chatClose && chatClose.addEventListener('click', ()=>{
      chatWindow.style.display = 'none';
      chatToggle.style.display = 'flex';
    });

    async function tryProxy(messages){
      try {
        const res = await fetch('http://localhost:3001/api/chat', {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body: JSON.stringify({messages})
});

        if(!res.ok){
          const txt = await res.text();
          return { error: `Server ${res.status}: ${txt}` };
        }
        const data = await res.json();
        return { data };
      } catch(err){ return { error: err.message }; }
    }

    async function sendToServer(messageText){
      conversation.push({role:'user', content: messageText});
      appendMessage(messageText, 'user');
      appendMessage('Thinking...', 'bot');
      const attempt = await tryProxy(conversation);
      const lastBot = Array.from(chatMessages.querySelectorAll('.msg.bot')).pop();
      if(lastBot && lastBot.querySelector('.bubble').textContent==='Thinking...') lastBot.remove();

      if(attempt.error){
        console.warn('Proxy error:', attempt.error);
        const reply = localDemoReply(messageText);
        conversation.push({role:'assistant', content: reply});
        appendMessage(reply, 'bot');
      } else {
        const data = attempt.data;
        const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ? data.choices[0].message.content.trim() : 'Sorry, no response.';
        conversation.push({role:'assistant', content: reply});
        appendMessage(reply, 'bot');
      }
    }

    function localDemoReply(messageText){
      const q = (messageText||'').toLowerCase();
      const products = ['Wireless Bluetooth Headphones','Smart Fitness Band','Stainless Steel Water Bottle','Classic Leather Wallet','Paperback Novel - Mystery Thriller'];
      if(q.includes('product')||q.includes('products')||q.includes('name')||q.includes('list')){
        return 'Hi — I\'m the ShopMart Assistant. Here are some products: ' + products.join(', ');
      }
      if(q.includes('order')||q.includes('where is my order')){
        return 'To check your order, go to Your Orders in your account. For demo, provide an order # and I can simulate a status.';
      }
      if(q.includes('return')||q.includes('refund')){
        return 'To return an item go to Orders → select item → Return or Replace Items. Follow the steps.';
      }
      return 'Sorry, I don\'t have a live AI connection. Try: "list products" or "how to return an item".';
    }

    chatSend && chatSend.addEventListener('click', ()=>{ const text = chatInput.value.trim(); if(!text) return; chatInput.value=''; sendToServer(text); });
    chatInput && chatInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); chatSend.click(); } });

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

