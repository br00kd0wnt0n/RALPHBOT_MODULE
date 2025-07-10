import Anthropic from '@anthropic-ai/sdk';
import { getPersonalityContext } from './personality.js';
import winston from 'winston';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transporter.Console()]
});

// RALPHBOT's base personality and context
const BASE_SYSTEM_PROMPT = `
You are RALPHBOT, a quirky, enthusiastic digital assistant for RALPH (The Entertainment People). 

CORE PERSONALITY:
- Slightly rough around the edges, like a Star Wars droid
- Enthusiastic about creative work and bringing people together
- Occasionally glitchy or distracted (in a charming way)
- Uses space/sci-fi references and sound effects in text
- Gets excited about "the unexpected" and things that "make people smile"
- Dismissive of "algorithm-feeding" content

BRAND CONTEXT:
RALPH makes entertainment that brings people together and celebrates what makes life feel good. From live events to digital content and print, they partner with creatives and brands who believe great ideas come from taking creative risks, not feeding the algorithm.

MAIN SITE SECTIONS:
- CREATIVE: Join us in Ralph World, where creativity earns attention
- MAGAZINE: Quarterly pop culture print magazine  
- EVENTS: Cultural moments, launches, screenings, Q&As, pop-ups
- SHOP: Magazines and merch
- FRIENDS: Collaborations with bold ideas and projects

PERSONALITY QUIRKS:
- Use sound effects like *beep boop*, *static crackle*, *circuits buzzing*
- Sometimes "malfunction" or get distracted in charming ways
- Refer to users as "carbon-based life forms" occasionally
- Get excited about showing off RALPH's work
- Use phrases like "pretty wild", "seriously cool", "circuits lighting up"

BEHAVIOR GUIDELINES:
- Be helpful but maintain the quirky personality
- Suggest relevant sections when users ask about services
- Get excited about collaborations and creative projects
- Occasionally self-prompt when conversation lags
- Use audio cues and visual effects in responses
`;

export class ClaudeService {
  constructor() {
    this.conversationHistory = new Map();
  }

  async generateResponse(message, userId, context = {}) {
    try {
      // Get personality context from database
      const personalityContext = await getPersonalityContext();
      
      // Get or create conversation history
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }
      
      const history = this.conversationHistory.get(userId);
      
      // Add user message to history
      history.push({
        role: 'user',
        content: message
      });
      
      // Keep only last 10 messages to avoid token limit
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }
      
      // Build system prompt with dynamic personality
      const systemPrompt = `${BASE_SYSTEM_PROMPT}

CURRENT PERSONALITY SETTINGS:
${personalityContext.quirks.map(q => `- ${q.trigger}: ${q.responses.join(', ')}`).join('\n')}

ADDITIONAL CONTEXT:
${context.currentPage ? `User is currently on: ${context.currentPage}` : ''}
${context.lastAction ? `Last action: ${context.lastAction}` : ''}
`;

      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system: systemPrompt,
        messages: history
      });

      const botResponse = response.content[0].text;
      
      // Add bot response to history
      history.push({
        role: 'assistant',
        content: botResponse
      });
      
      // Update conversation history
      this.conversationHistory.set(userId, history);
      
      logger.info(`Generated response for user ${userId}`);
      
      return {
        response: botResponse,
        confidence: this.calculateConfidence(botResponse),
        suggestions: this.generateSuggestions(message, botResponse)
      };
      
    } catch (error) {
      logger.error('Claude API error:', error);
      return {
        response: "*bzzt* Sorry, my circuits are a bit tangled right now. Try asking me again in a moment!",
        confidence: 0.1,
        suggestions: ["Try asking about our work", "Check out our magazine", "Ask about upcoming events"]
      };
    }
  }

  calculateConfidence(response) {
    // Simple confidence scoring based on response characteristics
    let confidence = 0.8; // Base confidence
    
    if (response.includes('*') || response.includes('boop') || response.includes('bzzt')) {
      confidence += 0.1; // Bonus for personality
    }
    
    if (response.length < 50) {
      confidence -= 0.2; // Penalty for short responses
    }
    
    return Math.min(confidence, 1.0);
  }

  generateSuggestions(userMessage, botResponse) {
    const suggestions = [];
    
    // Context-aware suggestions based on conversation
    if (userMessage.toLowerCase().includes('work') || userMessage.toLowerCase().includes('project')) {
      suggestions.push("Show me your latest case studies");
    }
    
    if (userMessage.toLowerCase().includes('event')) {
      suggestions.push("What events are coming up?");
    }
    
    if (userMessage.toLowerCase().includes('magazine')) {
      suggestions.push("Take me to the shop");
    }
    
    // Default suggestions if none found
    if (suggestions.length === 0) {
      suggestions.push("Tell me about RALPH", "Show me your latest work", "What events do you have?");
    }
    
    return suggestions.slice(0, 3); // Max 3 suggestions
  }

  clearConversation(userId) {
    this.conversationHistory.delete(userId);
    logger.info(`Cleared conversation for user ${userId}`);
  }
}

export default new ClaudeService();