const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();
const app = express();
app.use(cors()); app.use(express.json({limit:'1mb'}));

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if(!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI API key not configured on server' });
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model:'gpt-3.5-turbo', messages, max_tokens:500, temperature:0.2 })
    });
    const data = await resp.json();
    res.json(data);
  } catch(err){
    console.error('Proxy error', err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=> console.log('Proxy server listening on', PORT));
