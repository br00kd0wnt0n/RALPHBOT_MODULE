import express from 'express';
import { 
  getPersonalityContext, 
  updatePersonality, 
  addQuirk, 
  removeQuirk 
} from '../services/personality.js';
import { 
  getAnalytics, 
  getActiveSessions, 
  getConversationHistory 
} from '../services/analytics.js';

const router = express.Router();

// Get personality configuration
router.get('/personality', async (req, res) => {
  try {
    const personality = await getPersonalityContext();
    res.json(personality);
  } catch (error) {
    console.error('Get personality error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Update personality configuration
router.put('/personality', async (req, res) => {
  try {
    const updates = req.body;
    const personality = await updatePersonality(updates);
    res.json(personality);
  } catch (error) {
    console.error('Update personality error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Add new quirk
router.post('/personality/quirks', async (req, res) => {
  try {
    const { trigger, response } = req.body;
    
    if (!trigger || !response) {
      return res.status(400).json({
        error: 'Trigger and response are required'
      });
    }
    
    const personality = await addQuirk(trigger, response);
    res.json(personality);
  } catch (error) {
    console.error('Add quirk error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Remove quirk
router.delete('/personality/quirks', async (req, res) => {
  try {
    const { trigger, response } = req.body;
    
    if (!trigger || !response) {
      return res.status(400).json({
        error: 'Trigger and response are required'
      });
    }
    
    const personality = await removeQuirk(trigger, response);
    res.json(personality);
  } catch (error) {
    console.error('Remove quirk error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const analytics = await getAnalytics(timeRange);
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get active sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = getActiveSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get conversation by session ID
router.get('/conversations/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await getConversationHistory(sessionId);
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get system health
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        personality: 'online',
        analytics: 'online',
        claude: 'online'
      },
      metrics: {
        activeSessions: getActiveSessions().length,
        uptime: process.uptime()
      }
    };
    
    res.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Internal server error'
    });
  }
});

export default router; 