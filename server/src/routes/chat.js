import express from 'express';
import claudeService from '../services/claude.js';
import { logConversation, trackSession, endSession } from '../services/analytics.js';
import { getRandomQuirk } from '../services/personality.js';

const router = express.Router();

// Generate session ID
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Send message to bot
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, context = {} } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    // Generate session ID if not provided
    const currentSessionId = sessionId || generateSessionId();
    
    // Track session if new
    if (!sessionId) {
      trackSession(currentSessionId, {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        referrer: req.get('Referrer')
      });
    }

    // Log user message
    await logConversation(currentSessionId, message, 'user', 'normal', 1.0);

    // Get bot response from Claude
    const response = await claudeService.generateResponse(message, currentSessionId, context);

    // Log bot response
    await logConversation(currentSessionId, response.response, 'bot', response.mood, response.confidence);

    res.json({
      response: response.response,
      mood: response.mood,
      confidence: response.confidence,
      suggestions: response.suggestions,
      sessionId: currentSessionId
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: '*bzzt* Sorry, my circuits are a bit tangled right now!'
    });
  }
});

// Get conversation history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { getConversationHistory } = await import('../services/analytics.js');
    
    const conversation = await getConversationHistory(sessionId);
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }

    res.json({
      messages: conversation.messages,
      analytics: conversation.analytics
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Clear conversation
router.delete('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Clear from Claude service
    claudeService.clearConversation(sessionId);
    
    // End session tracking
    endSession(sessionId);
    
    res.json({
      message: 'Conversation cleared successfully'
    });

  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get bot status and personality info
router.get('/status', async (req, res) => {
  try {
    const startupQuirk = getRandomQuirk('startup');
    
    res.json({
      status: 'online',
      version: '1.0.0',
      personality: {
        name: 'RALPHBOT',
        description: 'Quirky space-themed digital assistant for RALPH creative agency',
        startupMessage: startupQuirk || "*beep boop* RALPHBOT online!"
      },
      capabilities: [
        'Creative work discussions',
        'Event information',
        'Magazine content',
        'General RALPH inquiries',
        'Space-themed conversations'
      ]
    });

  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get suggestions based on context
router.post('/suggestions', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    const suggestions = [
      "Tell me about RALPH",
      "Show me your latest work",
      "What events do you have?",
      "Tell me about your magazine"
    ];

    // Context-aware suggestions
    if (message) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('work') || lowerMessage.includes('project')) {
        suggestions.unshift("Show me your latest case studies");
      }
      
      if (lowerMessage.includes('event')) {
        suggestions.unshift("What events are coming up?");
      }
      
      if (lowerMessage.includes('magazine')) {
        suggestions.unshift("Take me to the shop");
      }
    }

    res.json({
      suggestions: suggestions.slice(0, 4)
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router; 