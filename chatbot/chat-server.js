import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AIService from './ai-service.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true
}));
app.use(express.json());

// Initialize AI Service
const aiService = new AIService();

// Store conversation history (in production, use a database)
const conversations = new Map();

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default', userContext = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation history
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }
    
    const conversation = conversations.get(sessionId);
    
    // Add user message to conversation
    conversation.push({ role: 'user', content: message });
    
    // Keep only last 10 messages to manage context length
    if (conversation.length > 10) {
      conversation.splice(0, conversation.length - 10);
    }

    // Generate AI response
    const aiResponse = await aiService.generateResponse(conversation, userContext);
    
    // Add AI response to conversation
    conversation.push({ role: 'assistant', content: aiResponse });
    
    // Update conversation history
    conversations.set(sessionId, conversation);

    res.json({
      response: aiResponse,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Product search endpoint
app.get('/api/products/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = aiService.searchProducts(q);
    res.json({ products: results, count: results.length });
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Product recommendations endpoint
app.get('/api/products/recommendations', (req, res) => {
  try {
    const { category, limit = 3 } = req.query;
    const recommendations = aiService.getProductRecommendations(category, parseInt(limit));
    res.json({ products: recommendations, count: recommendations.length });
  } catch (error) {
    console.error('Recommendations API Error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ShopMart AI Chatbot'
  });
});

app.listen(port, () => {
  console.log(`🤖 ShopMart AI Chatbot Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
});

export default app;