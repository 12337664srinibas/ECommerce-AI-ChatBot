class EnhancedChatbot {
  constructor() {
    this.apiUrl = 'http://localhost:3001/api';
    this.sessionId = this.generateSessionId();
    this.isTyping = false;
    this.messageQueue = [];
    this.userContext = this.loadUserContext();
    
    this.initializeElements();
    this.bindEvents();
    this.loadChatHistory();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  loadUserContext() {
    // In a real app, this would come from user authentication
    return {
      name: localStorage.getItem('userName') || null,
      orderHistory: localStorage.getItem('orderHistory') || null
    };
  }

  initializeElements() {
    this.chatToggle = document.getElementById('chatToggle');
    this.chatWindow = document.getElementById('chatWindow');
    this.chatClose = document.getElementById('chatClose');
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.chatSend = document.getElementById('chatSend');
    
    // Create enhanced UI elements
    this.createEnhancedUI();
  }

  createEnhancedUI() {
    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typingIndicator';
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = `
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span class="typing-text">Lyra is typing...</span>
    `;
    typingIndicator.style.display = 'none';
    this.chatMessages.appendChild(typingIndicator);

    // Add quick action buttons
    const quickActions = document.createElement('div');
    quickActions.className = 'quick-actions';
    quickActions.innerHTML = `
      <button class="quick-btn" data-action="products">Show Products</button>
      <button class="quick-btn" data-action="orders">Track Order</button>
      <button class="quick-btn" data-action="help">Get Help</button>
    `;
    
    const chatInputContainer = this.chatInput.parentElement;
    chatInputContainer.insertBefore(quickActions, this.chatInput);
  }

  bindEvents() {
    // Existing events
    this.chatToggle?.addEventListener('click', () => this.openChat());
    this.chatClose?.addEventListener('click', () => this.closeChat());
    this.chatSend?.addEventListener('click', () => this.sendMessage());
    this.chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Quick action buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-btn')) {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      }
    });

    // Auto-resize input
    this.chatInput?.addEventListener('input', () => {
      this.chatInput.style.height = 'auto';
      this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 100) + 'px';
    });
  }

  handleQuickAction(action) {
    const actions = {
      products: "Show me your popular products",
      orders: "How can I track my order?",
      help: "What can you help me with?"
    };
    
    if (actions[action]) {
      this.chatInput.value = actions[action];
      this.sendMessage();
    }
  }

  openChat() {
    this.chatWindow.style.display = 'flex';
    this.chatToggle.style.display = 'none';
    
    // Welcome message if first time
    if (this.chatMessages.children.length <= 1) { // Only typing indicator
      setTimeout(() => {
        this.addMessage(
          `Hi there! 👋 I'm Lyra, your ShopMart AI assistant. I'm here to help you find products, track orders, and answer any questions you have. How can I help you today?`,
          'bot'
        );
      }, 500);
    }
    
    this.chatInput.focus();
  }

  closeChat() {
    this.chatWindow.style.display = 'none';
    this.chatToggle.style.display = 'flex';
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message || this.isTyping) return;

    // Add user message
    this.addMessage(message, 'user');
    this.chatInput.value = '';
    this.chatInput.style.height = 'auto';

    // Show typing indicator
    this.showTyping();

    try {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: this.sessionId,
          userContext: this.userContext
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Hide typing indicator
      this.hideTyping();
      
      // Add bot response with delay for natural feel
      setTimeout(() => {
        this.addMessage(data.response, 'bot');
        this.saveChatHistory();
      }, 500);

    } catch (error) {
      console.error('Chat error:', error);
      this.hideTyping();
      
      // Fallback response
      setTimeout(() => {
        this.addMessage(
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or contact our customer service team for immediate assistance.",
          'bot'
        );
      }, 500);
    }
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    // Format message with basic markdown support
    const formattedText = this.formatMessage(text);
    bubble.innerHTML = formattedText;
    
    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.appendChild(bubble);
    messageDiv.appendChild(timestamp);
    
    // Insert before typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    this.chatMessages.insertBefore(messageDiv, typingIndicator);
    
    // Scroll to bottom
    this.scrollToBottom();
    
    // Add animation
    requestAnimationFrame(() => {
      messageDiv.classList.add('animate-in');
    });
  }

  formatMessage(text) {
    // Basic markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '• '); // Preserve bullet points
  }

  showTyping() {
    this.isTyping = true;
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'flex';
    this.scrollToBottom();
  }

  hideTyping() {
    this.isTyping = false;
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'none';
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  saveChatHistory() {
    // Save to localStorage (in production, save to server)
    const messages = Array.from(this.chatMessages.children)
      .filter(child => child.classList.contains('message'))
      .map(msg => ({
        text: msg.querySelector('.message-bubble').textContent,
        sender: msg.classList.contains('user') ? 'user' : 'bot',
        timestamp: msg.querySelector('.message-timestamp').textContent
      }));
    
    localStorage.setItem(`chat_history_${this.sessionId}`, JSON.stringify(messages));
  }

  loadChatHistory() {
    // Load from localStorage (in production, load from server)
    const history = localStorage.getItem(`chat_history_${this.sessionId}`);
    if (history) {
      const messages = JSON.parse(history);
      messages.forEach(msg => {
        this.addMessage(msg.text, msg.sender);
      });
    }
  }
}

// Initialize enhanced chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if chat elements exist
  if (document.getElementById('chatToggle')) {
    window.shopMartChatbot = new EnhancedChatbot();
  }
});