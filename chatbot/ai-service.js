import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.products = this.loadProducts();
    this.systemPrompt = this.createSystemPrompt();
  }

  loadProducts() {
    try {
      const productsPath = path.join(process.cwd(), 'data', 'products.json');
      const productsData = fs.readFileSync(productsPath, 'utf8');
      return JSON.parse(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  createSystemPrompt() {
    const productList = this.products.map(p => 
      `${p.name} - $${p.price} (${p.category}) - ${p.description}`
    ).join('\n');

    return `You are Lyra, ShopMart's intelligent AI shopping assistant. You are helpful, friendly, and knowledgeable about our products and services.

AVAILABLE PRODUCTS:
${productList}

CAPABILITIES:
- Help customers find products
- Provide product recommendations
- Answer questions about orders, shipping, returns
- Assist with account issues
- Provide shopping advice
- Compare products
- Check product availability and pricing

GUIDELINES:
- Always be helpful and professional
- Use the customer's name if provided
- Provide specific product information when asked
- Suggest alternatives if requested items aren't available
- Keep responses concise but informative
- If you don't know something, admit it and offer to help find the information
- Always try to guide customers toward making a purchase decision
- Use emojis sparingly and appropriately

COMPANY INFO:
- ShopMart is a trusted online shopping platform
- We offer fast delivery and secure payments
- We have a 30-day return policy
- Customer service is available 24/7
- We price match with major competitors

Remember: Your goal is to provide excellent customer service and help customers find exactly what they need.`;
  }

  async generateResponse(messages, userContext = {}) {
    try {
      const systemMessage = {
        role: 'system',
        content: this.systemPrompt
      };

      const contextMessage = userContext.name ? {
        role: 'system',
        content: `Customer name: ${userContext.name}. Previous orders: ${userContext.orderHistory || 'None'}.`
      } : null;

      const allMessages = [
        systemMessage,
        ...(contextMessage ? [contextMessage] : []),
        ...messages
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: allMessages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('product') || message.includes('buy') || message.includes('shop')) {
      const randomProducts = this.products.slice(0, 3);
      return `I'd be happy to help you find products! Here are some popular items:\n\n${randomProducts.map(p => `• ${p.name} - $${p.price}`).join('\n')}\n\nWhat type of product are you looking for?`;
    }
    
    if (message.includes('order') || message.includes('track')) {
      return "To track your order, please provide your order number. You can also check your order status in the 'My Orders' section of your account.";
    }
    
    if (message.includes('return') || message.includes('refund')) {
      return "We offer a 30-day return policy. To return an item, go to 'My Orders' → select the item → 'Return or Replace'. Is there a specific item you'd like to return?";
    }
    
    if (message.includes('help') || message.includes('support')) {
      return "I'm here to help! I can assist you with:\n• Finding products\n• Order tracking\n• Returns & refunds\n• Product recommendations\n• Account questions\n\nWhat would you like help with?";
    }
    
    return "I'm here to help you with your shopping needs! You can ask me about products, orders, returns, or anything else related to ShopMart. What can I help you find today?";
  }

  searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }

  getProductRecommendations(category, maxResults = 3) {
    const filtered = category 
      ? this.products.filter(p => p.category.toLowerCase() === category.toLowerCase())
      : this.products;
    
    return filtered
      .sort((a, b) => b.rating - a.rating)
      .slice(0, maxResults);
  }
}

export default AIService;