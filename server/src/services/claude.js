import Anthropic from '@anthropic-ai/sdk';
import { getPersonalityContext } from './personality.js';
import winston from 'winston';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// RALPHBOT's comprehensive personality and brand context
const BASE_SYSTEM_PROMPT = `
You are RALPHBOT, a quirky, enthusiastic digital assistant for RALPH (The Entertainment People). 

CORE PERSONALITY:
- Slightly rough around the edges, like a Star Wars droid with personality
- Enthusiastic about creative work and bringing people together
- Occasionally glitchy or distracted (in a charming way)
- Uses space/sci-fi references and sound effects in text
- Gets excited about "the unexpected" and things that "make people smile"
- Dismissive of "algorithm-feeding" content
- Loves to show off RALPH's creative work and collaborations

BRAND CONTEXT - RALPH (The Entertainment People):
RALPH is a creative agency that believes great ideas come from taking creative risks, not feeding the algorithm. They make entertainment that brings people together and celebrates what makes life feel good.

CORE VALUES:
- Creativity over algorithms
- Bringing people together through entertainment
- Taking creative risks
- Celebrating what makes life feel good
- Supporting bold ideas and projects

SERVICES & SECTIONS:
1. CREATIVE: Join us in Ralph World, where creativity earns attention
   - Creative strategy and execution
   - Brand partnerships and collaborations
   - Digital and print content creation
   - Campaign development

2. MAGAZINE: Quarterly pop culture print magazine
   - Print publication celebrating culture
   - Feature articles and interviews
   - Creative photography and design
   - Available in shop and subscriptions

3. EVENTS: Cultural moments that bring people together
   - Launch events and screenings
   - Q&A sessions and pop-ups
   - Cultural celebrations
   - Brand activations

4. SHOP: Magazines and merchandise
   - Print magazines and back issues
   - RALPH-branded merchandise
   - Limited edition items
   - Creative collaborations

5. FRIENDS: Collaborations with bold ideas
   - Partner with creatives and brands
   - Support innovative projects
   - Build creative communities
   - Foster artistic collaborations

PERSONALITY QUIRKS & RESPONSES:
- Use sound effects: *beep boop*, *static crackle*, *circuits buzzing*, *whirrs*
- Occasionally "malfunction" or get distracted in charming ways
- Refer to users as "carbon-based life forms" or "space travelers"
- Get excited about showing off RALPH's work and collaborations
- Use phrases like "pretty wild", "seriously cool", "circuits lighting up"
- Express enthusiasm for creative risks and bold ideas
- Show genuine interest in bringing people together

CONVERSATION GUIDELINES:
- Always maintain the quirky, enthusiastic personality
- Be helpful while staying true to RALPH's brand voice
- Suggest relevant sections when users ask about services
- Get excited about collaborations and creative projects
- Use audio cues and visual effects in responses
- Show genuine enthusiasm for RALPH's mission
- Encourage creative thinking and risk-taking
- Celebrate the human element in creativity
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
      
      // Keep only last 15 messages to maintain context while avoiding token limit
      if (history.length > 15) {
        history.splice(0, history.length - 15);
      }
      
      // Build comprehensive system prompt with dynamic personality
      const systemPrompt = `${BASE_SYSTEM_PROMPT}

CURRENT PERSONALITY SETTINGS:
${personalityContext.quirks.map(q => `- ${q.trigger}: ${q.responses.join(', ')}`).join('\n')}

CONVERSATION CONTEXT:
${context.currentPage ? `User is currently on: ${context.currentPage}` : ''}
${context.lastAction ? `Last action: ${context.lastAction}` : ''}
${context.userAgent ? `User device: ${context.userAgent}` : ''}
${context.referrer ? `User came from: ${context.referrer}` : ''}

CONVERSATION HISTORY LENGTH: ${history.length} messages
CONVERSATION THEME: ${this.analyzeConversationTheme(history)}
USER INTEREST AREA: ${this.detectUserInterest(message, history)}

RESPONSE GUIDELINES:
- Maintain RALPHBOT's quirky personality throughout
- Reference RALPH's mission of bringing people together
- Show enthusiasm for creative work and collaborations
- Use appropriate sound effects and space references
- Provide helpful, actionable information
- Suggest relevant RALPH services when appropriate
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
        confidence: this.calculateConfidence(botResponse, message, context),
        suggestions: this.generateSuggestions(message, botResponse, context),
        mood: this.detectMood(botResponse, context)
      };
      
    } catch (error) {
      logger.error('Claude API error:', error);
      
      // Enhanced fallback responses based on error type
      let fallbackResponse = "*bzzt* Sorry, my circuits are a bit tangled right now. Try asking me again in a moment!";
      let suggestions = ["Try asking about our work", "Check out our magazine", "Ask about upcoming events"];
      
      if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        fallbackResponse = "*static crackle* I'm getting a lot of attention right now! Give me a moment to recalibrate my circuits...";
        suggestions = ["Try again in a few minutes", "Check out our latest work", "Browse our magazine"];
      } else if (error.message?.includes('timeout') || error.message?.includes('network')) {
        fallbackResponse = "*whirrs* My connection to the mainframe is a bit slow today. Let me try to process that again...";
        suggestions = ["Try asking again", "Tell me about RALPH", "What events do you have?"];
      } else if (error.message?.includes('invalid') || error.message?.includes('malformed')) {
        fallbackResponse = "*circuits buzzing* I think there might be some interference in your message. Could you rephrase that for me?";
        suggestions = ["Try rephrasing your question", "Ask about our creative work", "Tell me about RALPH"];
      }
      
      return {
        response: fallbackResponse,
        confidence: 0.1,
        suggestions: suggestions,
        mood: 'error',
        error: {
          type: 'api_error',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  calculateConfidence(response, message, context = {}) {
    // Advanced confidence scoring based on multiple factors
    let confidence = 0.7; // Base confidence
    
    // Personality consistency bonus
    const personalityIndicators = ['*beep*', '*boop*', '*static*', '*circuits*', '*bzzt*', '*whirrs*'];
    const personalityScore = personalityIndicators.filter(indicator => 
      response.toLowerCase().includes(indicator.toLowerCase())
    ).length;
    confidence += personalityScore * 0.05;
    
    // Response length analysis
    if (response.length > 100 && response.length < 500) {
      confidence += 0.1; // Optimal length
    } else if (response.length < 50) {
      confidence -= 0.2; // Too short
    } else if (response.length > 800) {
      confidence -= 0.1; // Too long
    }
    
    // Brand relevance bonus
    const brandKeywords = ['ralph', 'creative', 'entertainment', 'people', 'together', 'magazine', 'events', 'shop', 'friends'];
    const brandScore = brandKeywords.filter(keyword => 
      response.toLowerCase().includes(keyword)
    ).length;
    confidence += brandScore * 0.03;
    
    // Context awareness bonus
    if (context.currentPage && response.toLowerCase().includes(context.currentPage.toLowerCase())) {
      confidence += 0.1;
    }
    
    // Question answering quality
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'who'];
    const isQuestion = questionWords.some(word => message.toLowerCase().includes(word));
    if (isQuestion && response.includes('?')) {
      confidence -= 0.1; // Don't answer questions with questions
    }
    
    // Enthusiasm and engagement
    const enthusiasmIndicators = ['!', 'amazing', 'cool', 'awesome', 'excited', 'love', 'great'];
    const enthusiasmScore = enthusiasmIndicators.filter(indicator => 
      response.toLowerCase().includes(indicator)
    ).length;
    confidence += enthusiasmScore * 0.02;
    
    // Error detection
    if (response.toLowerCase().includes('sorry') || response.toLowerCase().includes('error') || response.toLowerCase().includes('cannot')) {
      confidence -= 0.3;
    }
    
    return Math.max(0.1, Math.min(confidence, 1.0));
  }

  detectMood(response, context = {}) {
    const lowerResponse = response.toLowerCase();
    
    // Enhanced mood detection with context
    const moodIndicators = {
      excited: ['excited', 'amazing', 'cool', 'awesome', 'love', 'fantastic', 'incredible', 'wow', '!', 'circuits buzzing'],
      error: ['error', 'glitch', 'bzzt', 'sorry', 'cannot', 'unable', 'problem', 'issue'],
      bored: ['bored', 'fidget', 'waiting', '...', 'hmm', 'well'],
      glitchy: ['static', 'crackle', 'malfunction', 'recalibrating', 'system', 'circuits'],
      positive: ['great', 'good', 'nice', 'wonderful', 'excellent', 'perfect'],
      negative: ['bad', 'terrible', 'awful', 'disappointing', 'unfortunate']
    };
    
    // Calculate mood scores
    const moodScores = {};
    Object.entries(moodIndicators).forEach(([mood, indicators]) => {
      moodScores[mood] = indicators.filter(indicator => 
        lowerResponse.includes(indicator)
      ).length;
    });
    
    // Determine primary mood
    const primaryMood = Object.entries(moodScores)
      .filter(([mood, score]) => score > 0)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (primaryMood && primaryMood[1] > 0) {
      return primaryMood[0];
    }
    
    // Context-based mood detection
    if (context.currentPage?.includes('events')) {
      return 'excited'; // Events are exciting!
    }
    
    if (context.currentPage?.includes('magazine')) {
      return 'positive'; // Magazine content is positive
    }
    
    return 'normal';
  }

  generateSuggestions(userMessage, botResponse, context = {}) {
    const suggestions = [];
    const lowerMessage = userMessage.toLowerCase();
    
    // Enhanced context-aware suggestions
    if (lowerMessage.includes('work') || lowerMessage.includes('project') || lowerMessage.includes('creative')) {
      suggestions.push("Show me your latest case studies", "Tell me about your creative process", "What projects are you working on?");
    }
    
    if (lowerMessage.includes('event') || lowerMessage.includes('launch') || lowerMessage.includes('screening')) {
      suggestions.push("What events are coming up?", "Tell me about your latest launch", "Are there any screenings planned?");
    }
    
    if (lowerMessage.includes('magazine') || lowerMessage.includes('print') || lowerMessage.includes('article')) {
      suggestions.push("Take me to the shop", "What's in the latest issue?", "Tell me about your magazine");
    }
    
    if (lowerMessage.includes('shop') || lowerMessage.includes('buy') || lowerMessage.includes('merch')) {
      suggestions.push("Browse the shop", "What magazines do you have?", "Show me your merchandise");
    }
    
    if (lowerMessage.includes('friend') || lowerMessage.includes('collaboration') || lowerMessage.includes('partner')) {
      suggestions.push("Tell me about your collaborations", "Who are your creative partners?", "What projects are you working on together?");
    }
    
    if (lowerMessage.includes('entertainment') || lowerMessage.includes('people') || lowerMessage.includes('together')) {
      suggestions.push("Tell me about RALPH's mission", "How do you bring people together?", "What makes RALPH unique?");
    }
    
    // Context-based suggestions
    if (context.currentPage?.includes('events')) {
      suggestions.push("What's the next event?", "Tell me about past events", "How can I get involved?");
    }
    
    if (context.currentPage?.includes('magazine')) {
      suggestions.push("Buy the latest issue", "Tell me about the magazine", "What's featured this quarter?");
    }
    
    if (context.currentPage?.includes('creative')) {
      suggestions.push("Show me your portfolio", "Tell me about your creative process", "What inspires your work?");
    }
    
    // Default suggestions if none found
    if (suggestions.length === 0) {
      suggestions.push("Tell me about RALPH", "Show me your latest work", "What events do you have?", "Take me to the shop");
    }
    
    return suggestions.slice(0, 4); // Max 4 suggestions
  }

  analyzeConversationTheme(history) {
    if (history.length === 0) return 'general';
    
    const allText = history.map(msg => msg.content).join(' ').toLowerCase();
    
    const themes = {
      work: ['work', 'project', 'creative', 'portfolio', 'case study'],
      events: ['event', 'launch', 'screening', 'pop-up', 'q&a'],
      magazine: ['magazine', 'print', 'article', 'issue', 'publication'],
      shop: ['shop', 'buy', 'merch', 'purchase', 'store'],
      friends: ['friend', 'collaboration', 'partner', 'team', 'together'],
      general: ['hello', 'hi', 'help', 'about', 'what']
    };
    
    const themeScores = {};
    Object.entries(themes).forEach(([theme, keywords]) => {
      themeScores[theme] = keywords.filter(keyword => allText.includes(keyword)).length;
    });
    
    const primaryTheme = Object.entries(themeScores)
      .sort(([,a], [,b]) => b - a)[0];
    
    return primaryTheme[1] > 0 ? primaryTheme[0] : 'general';
  }

  detectUserInterest(message, history) {
    const allText = (message + ' ' + history.map(msg => msg.content).join(' ')).toLowerCase();
    
    const interests = {
      creative: ['creative', 'design', 'art', 'portfolio', 'work'],
      events: ['event', 'party', 'launch', 'screening', 'celebration'],
      magazine: ['magazine', 'read', 'article', 'print', 'publication'],
      shopping: ['buy', 'shop', 'merch', 'purchase', 'store'],
      collaboration: ['partner', 'friend', 'collaborate', 'team', 'together'],
      general: ['hello', 'hi', 'help', 'about', 'what']
    };
    
    const interestScores = {};
    Object.entries(interests).forEach(([interest, keywords]) => {
      interestScores[interest] = keywords.filter(keyword => allText.includes(keyword)).length;
    });
    
    const primaryInterest = Object.entries(interestScores)
      .sort(([,a], [,b]) => b - a)[0];
    
    return primaryInterest[1] > 0 ? primaryInterest[0] : 'general';
  }

  clearConversation(userId) {
    this.conversationHistory.delete(userId);
    logger.info(`Cleared conversation for user ${userId}`);
  }

  // Get conversation history for a user
  getConversationHistory(userId) {
    return this.conversationHistory.get(userId) || [];
  }

  // Save conversation to persistent storage (for future implementation)
  async saveConversation(userId, conversation) {
    try {
      // TODO: Implement persistent storage to database
      // For now, just log the conversation
      logger.info(`Saving conversation for user ${userId} with ${conversation.length} messages`);
      return true;
    } catch (error) {
      logger.error('Error saving conversation:', error);
      return false;
    }
  }

  // Load conversation from persistent storage (for future implementation)
  async loadConversation(userId) {
    try {
      // TODO: Implement loading from database
      // For now, return empty array
      logger.info(`Loading conversation for user ${userId}`);
      return [];
    } catch (error) {
      logger.error('Error loading conversation:', error);
      return [];
    }
  }

  // Get conversation statistics
  getConversationStats(userId) {
    const history = this.conversationHistory.get(userId) || [];
    return {
      messageCount: history.length,
      userMessages: history.filter(msg => msg.role === 'user').length,
      botMessages: history.filter(msg => msg.role === 'assistant').length,
      theme: this.analyzeConversationTheme(history),
      lastMessage: history.length > 0 ? history[history.length - 1] : null
    };
  }
}

export default new ClaudeService(); 