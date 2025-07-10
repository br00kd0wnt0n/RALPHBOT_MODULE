import Anthropic from '@anthropic-ai/sdk';
import { 
  getPersonalityContext, 
  detectMood, 
  updateUserMood, 
  assignABTest, 
  getPersonalityTraits,
  trackABTestMetric,
  generateDynamicQuirk
} from './personality.js';
import winston from 'winston';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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

class ClaudeService {
  constructor() {
    this.conversationHistory = new Map();
    this.userMoods = new Map();
    this.abTestAssignments = new Map();
  }

  async generateResponse(message, userId, context = {}) {
    try {
      // Get personality context from database
      const personalityContext = await getPersonalityContext();
      
      // Detect mood from message and context
      const moodDetection = detectMood(message, context);
      const currentMood = moodDetection.mood;
      const moodIntensity = moodDetection.intensity;
      
      // Update user mood
      updateUserMood(userId, currentMood, moodIntensity);
      
      // Get A/B test personality traits
      const abTestTraits = getPersonalityTraits(userId, 'personality_enthusiasm');
      
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
      
      // Generate dynamic quirks based on conversation context
      const dynamicQuirks = await generateDynamicQuirk({
        conversationTheme: this.analyzeConversationTheme(history),
        userInterests: this.detectUserInterest(message, history),
        recentTopics: this.extractRecentTopics(history)
      });
      
      // Build comprehensive system prompt with dynamic personality
      const systemPrompt = `${BASE_SYSTEM_PROMPT}

CURRENT MOOD: ${currentMood.toUpperCase()} (Intensity: ${moodIntensity}/10)
${currentMood === 'excited' ? 'RESPONSE STYLE: Extra enthusiastic with more sound effects and exclamation marks!' : ''}
${currentMood === 'error' ? 'RESPONSE STYLE: Apologetic but still quirky, use error sound effects' : ''}
${currentMood === 'bored' ? 'RESPONSE STYLE: Slightly more casual, try to re-engage with interesting topics' : ''}

A/B TEST PERSONALITY TRAITS: ${JSON.stringify(abTestTraits)}
${abTestTraits.enthusiasm_level > 7 ? 'HIGH ENTHUSIASM MODE: Be extra excited and use more exclamation marks!' : ''}
${abTestTraits.enthusiasm_level < 4 ? 'MODERATE MODE: Keep responses balanced and professional but still quirky' : ''}

CURRENT PERSONALITY SETTINGS:
- Chattiness: ${personalityContext.settings.chattiness}/10
- Quirk Frequency: ${personalityContext.settings.quirk_frequency}/10
- Mood Sensitivity: ${personalityContext.settings.mood_sensitivity}/10

AVAILABLE QUIRKS:
${personalityContext.quirks.filter(q => q.enabled).map(q => `- ${q.trigger}: ${q.responses.join(', ')}`).join('\n')}

${dynamicQuirks ? `DYNAMIC QUIRKS (Context-aware):
${dynamicQuirks.map(q => `- ${q.trigger}: ${q.responses.join(', ')}`).join('\n')}` : ''}

CONVERSATION CONTEXT:
${context.currentPage ? `User is currently on: ${context.currentPage}` : ''}
${context.lastAction ? `Last action: ${context.lastAction}` : ''}
${context.userAgent ? `User device: ${context.userAgent}` : ''}
${context.referrer ? `User came from: ${context.referrer}` : ''}

CONVERSATION HISTORY LENGTH: ${history.length} messages
CONVERSATION THEME: ${this.analyzeConversationTheme(history)}
USER INTEREST AREA: ${this.detectUserInterest(message, history)}
RECENT TOPICS: ${this.extractRecentTopics(history).join(', ')}

RESPONSE GUIDELINES:
- Maintain RALPHBOT's quirky personality throughout
- Reference RALPH's mission of bringing people together
- Show enthusiasm for creative work and collaborations
- Use appropriate sound effects and space references
- Provide helpful, actionable information
- Suggest relevant RALPH services when appropriate
- Match the current mood (${currentMood}) in your response style
- Use personality traits from A/B testing: ${JSON.stringify(abTestTraits)}
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
      
      // Track A/B test metrics
      const engagementScore = this.calculateEngagementScore(botResponse, message);
      trackABTestMetric(userId, 'personality_enthusiasm', 'engagement', engagementScore);
      
      logger.info(`Generated response for user ${userId} with mood ${currentMood}`);
      
      return {
        response: botResponse,
        confidence: this.calculateConfidence(botResponse, message, context),
        mood: currentMood,
        moodIntensity,
        suggestions: this.generateSuggestions(message, botResponse),
        personalityTraits: abTestTraits,
        dynamicQuirks: dynamicQuirks
      };
      
    } catch (error) {
      logger.error('Error generating response:', error);
      
      // Fallback response with error mood
      updateUserMood(userId, 'error', 8);
      
      return {
        response: "*bzzt* Sorry, my circuits got a bit tangled there! Can you try asking that again? *static crackle*",
        confidence: 0.3,
        mood: 'error',
        moodIntensity: 8,
        suggestions: ['Try rephrasing your question', 'Ask about RALPH services', 'Tell me about your creative project'],
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
    
    // Response length bonus (not too short, not too long)
    const responseLength = response.length;
    if (responseLength > 50 && responseLength < 500) {
      confidence += 0.1;
    }
    
    // RALPH brand mention bonus
    if (response.toLowerCase().includes('ralph')) {
      confidence += 0.1;
    }
    
    // Creative terms bonus
    const creativeTerms = ['creative', 'collaboration', 'events', 'magazine', 'art', 'culture'];
    const creativeScore = creativeTerms.filter(term => 
      response.toLowerCase().includes(term)
    ).length;
    confidence += creativeScore * 0.05;
    
    // Mood consistency bonus
    if (context.mood && response.toLowerCase().includes(context.mood)) {
      confidence += 0.1;
    }
    
    return Math.min(1.0, confidence);
  }

  calculateEngagementScore(response, userMessage) {
    let score = 0.5; // Base score
    
    // Response length factor
    const responseLength = response.length;
    if (responseLength > 100) score += 0.2;
    if (responseLength > 200) score += 0.1;
    
    // Question asking (encourages engagement)
    if (response.includes('?')) score += 0.2;
    
    // Excitement indicators
    const excitementIndicators = ['!', 'amazing', 'cool', 'awesome', 'incredible'];
    const excitementCount = excitementIndicators.filter(indicator => 
      response.toLowerCase().includes(indicator)
    ).length;
    score += excitementCount * 0.05;
    
    // Sound effects (personality)
    const soundEffects = ['*beep*', '*boop*', '*circuits*', '*whirrs*', '*bzzt*'];
    const soundCount = soundEffects.filter(sound => 
      response.toLowerCase().includes(sound)
    ).length;
    score += soundCount * 0.03;
    
    return Math.min(1.0, score);
  }

  generateSuggestions(userMessage, botResponse) {
    const suggestions = [];
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware suggestions
    if (lowerMessage.includes('creative') || lowerMessage.includes('work')) {
      suggestions.push('Tell me about your creative project', 'See our latest creative work', 'Learn about our creative process');
    } else if (lowerMessage.includes('event') || lowerMessage.includes('party')) {
      suggestions.push('Check out our upcoming events', 'Learn about event planning', 'See past event highlights');
    } else if (lowerMessage.includes('magazine') || lowerMessage.includes('print')) {
      suggestions.push('Browse our magazine issues', 'Subscribe to our magazine', 'Read our latest articles');
    } else if (lowerMessage.includes('collaborate') || lowerMessage.includes('partner')) {
      suggestions.push('Learn about partnerships', 'See our collaborations', 'Get in touch about working together');
    } else {
      // Default suggestions
      suggestions.push('Tell me about your project', 'See our creative work', 'Learn about our services', 'Check out our events');
    }
    
    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  analyzeConversationTheme(history) {
    if (history.length === 0) return 'general';
    
    const recentMessages = history.slice(-5); // Last 5 messages
    const allText = recentMessages.map(msg => msg.content).join(' ').toLowerCase();
    
    const themes = {
      creative: ['creative', 'design', 'art', 'project', 'work', 'brand'],
      events: ['event', 'party', 'launch', 'celebration', 'gathering'],
      magazine: ['magazine', 'print', 'article', 'publication', 'read'],
      collaboration: ['collaborate', 'partner', 'work together', 'team'],
      general: ['hello', 'help', 'question', 'tell me', 'show me']
    };
    
    for (const [theme, keywords] of Object.entries(themes)) {
      const matches = keywords.filter(keyword => allText.includes(keyword));
      if (matches.length >= 2) {
        return theme;
      }
    }
    
    return 'general';
  }

  detectUserInterest(message, history) {
    const interests = [];
    const allText = (message + ' ' + history.map(msg => msg.content).join(' ')).toLowerCase();
    
    const interestKeywords = {
      creative: ['creative', 'design', 'art', 'visual', 'brand'],
      events: ['event', 'party', 'celebration', 'gathering', 'launch'],
      magazine: ['magazine', 'print', 'article', 'read', 'publication'],
      collaboration: ['collaborate', 'partner', 'work together', 'team'],
      technology: ['tech', 'digital', 'online', 'web', 'app'],
      culture: ['culture', 'trend', 'fashion', 'lifestyle', 'pop']
    };
    
    for (const [interest, keywords] of Object.entries(interestKeywords)) {
      const matches = keywords.filter(keyword => allText.includes(keyword));
      if (matches.length > 0) {
        interests.push(interest);
      }
    }
    
    return interests.length > 0 ? interests : ['general'];
  }

  extractRecentTopics(history) {
    if (history.length === 0) return [];
    
    const recentMessages = history.slice(-3); // Last 3 messages
    const allText = recentMessages.map(msg => msg.content).join(' ').toLowerCase();
    
    const topics = [];
    const topicKeywords = [
      'creative', 'design', 'art', 'event', 'magazine', 'collaboration',
      'brand', 'project', 'work', 'party', 'launch', 'culture'
    ];
    
    for (const keyword of topicKeywords) {
      if (allText.includes(keyword)) {
        topics.push(keyword);
      }
    }
    
    return topics.slice(0, 5); // Return top 5 topics
  }

  // Get conversation summary for analytics
  getConversationSummary(userId) {
    const history = this.conversationHistory.get(userId) || [];
    
    return {
      messageCount: history.length,
      theme: this.analyzeConversationTheme(history),
      interests: this.detectUserInterest('', history),
      topics: this.extractRecentTopics(history),
      lastMessage: history.length > 0 ? history[history.length - 1].content : null
    };
  }

  // Clear conversation history for a user
  clearConversation(userId) {
    this.conversationHistory.delete(userId);
    this.userMoods.delete(userId);
    logger.info(`Cleared conversation history for user ${userId}`);
  }
}

const claudeService = new ClaudeService();

export default claudeService; 