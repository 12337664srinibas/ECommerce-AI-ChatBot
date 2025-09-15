ShopMart 

What's fixed:
- Removed broken references to local images in page body; all product images are remote URLs or placeholders.
- Products load dynamically from data/products.json and populate the UI sections.
- Added a small 1x1 PNG as logo placeholder to avoid broken image icons if original logo is missing.

How to run:
1) Serve front-end (recommended):
   cd ShopMart-Full-Fix
   python3 -m http.server 8000
   Open http://localhost:8000 in your browser

2) (Optional) Start proxy server for real AI replies:
   npm install
   # create .env with OPENAI_API_KEY=sk-...
   npm start

If you still see missing thumbnails, open DevTools and check Network to see if requests to the image URLs are blocked or failing. Many free image hosts enforce HTTPS and hotlinking rules; the project uses Unsplash URLs which should work. If your network blocks external images, use local images in /images and update products.json to point to those files.

Full Working Video - https://drive.google.com/file/d/1VkK5HagFTWK9PP7kM206yWbkr-xTP0Q_/view?usp=sharing 
