import express from 'express';
import { 
  getPersonalityContext, 
  updatePersonality, 
  getPersonalitySummary,
  assignABTest,
  getPersonalityTraits,
  trackABTestMetric,
  generateDynamicQuirk,
  addQuirk,
  removeQuirk
} from '../services/personality.js';
import personalityService from '../services/personality.js';
import { 
  getAnalytics, 
  getActiveSessions, 
  getConversationHistory 
} from '../services/analytics.js';
import { 
  validatePersonalityUpdate, 
  validateAnalyticsQuery, 
  validateQuirk,
  sanitizeInput 
} from '../middleware/validation.js';
import { 
  authenticateAdmin, 
  adminRateLimit, 
  limitRequestSize,
  logAuthAttempt 
} from '../middleware/auth.js';

const router = express.Router();

// Get personality configuration
router.get('/personality', 
  logAuthAttempt,
  authenticateAdmin,
  async (req, res) => {
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

// Get personality summary for dashboard
router.get('/personality/summary',
  logAuthAttempt,
  authenticateAdmin,
  async (req, res) => {
  try {
    const summary = getPersonalitySummary();
    res.json(summary);
  } catch (error) {
    console.error('Get personality summary error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Update personality configuration
router.put('/personality', 
  logAuthAttempt,
  authenticateAdmin,
  limitRequestSize,
  sanitizeInput,
  validatePersonalityUpdate,
  async (req, res) => {
  try {
    const updatedPersonality = await updatePersonality(req.body);
    res.json(updatedPersonality);
  } catch (error) {
    console.error('Update personality error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Add new quirk
router.post('/personality/quirks', 
  logAuthAttempt,
  authenticateAdmin,
  limitRequestSize,
  sanitizeInput,
  validateQuirk,
  async (req, res) => {
  try {
    const { trigger, response, mood_trigger, priority, frequency } = req.body;
    const personality = await addQuirk(trigger, response);
    
    // Update quirk with additional properties if provided
    if (mood_trigger || priority || frequency) {
      const quirk = personality.quirks.find(q => q.trigger === trigger);
      if (quirk) {
        if (mood_trigger) quirk.mood_trigger = mood_trigger;
        if (priority) quirk.priority = priority;
        if (frequency) quirk.frequency = frequency;
        await personality.save();
      }
    }
    
    res.json(personality);
  } catch (error) {
    console.error('Add quirk error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Remove quirk
router.delete('/personality/quirks', 
  logAuthAttempt,
  authenticateAdmin,
  sanitizeInput,
  async (req, res) => {
  try {
    const { trigger, response } = req.body;
    const personality = await removeQuirk(trigger, response);
    res.json(personality);
  } catch (error) {
    console.error('Remove quirk error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// A/B Testing Routes

// Get A/B test configuration
router.get('/ab-tests',
  logAuthAttempt,
  authenticateAdmin,
  async (req, res) => {
  try {
    const personality = await getPersonalityContext();
    const abTests = personality.ab_tests || [];
    res.json(abTests);
  } catch (error) {
    console.error('Get A/B tests error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Create new A/B test
router.post('/ab-tests',
  logAuthAttempt,
  authenticateAdmin,
  limitRequestSize,
  sanitizeInput,
  async (req, res) => {
  try {
    const { name, description, variants } = req.body;
    
    if (!name || !variants || variants.length < 2) {
      return res.status(400).json({
        error: 'A/B test requires name and at least 2 variants'
      });
    }
    
    const personality = await getPersonalityContext();
    
    // Check if test already exists
    const existingTest = personality.ab_tests.find(t => t.name === name);
    if (existingTest) {
      return res.status(400).json({
        error: 'A/B test with this name already exists'
      });
    }
    
    // Add new test
    personality.ab_tests.push({
      name,
      description,
      variants,
      active: true,
      start_date: new Date(),
      metrics: {
        total_users: 0,
        engagement_rate: 0,
        satisfaction_score: 0
      }
    });
    
    await personality.save();
    res.json(personality.ab_tests);
  } catch (error) {
    console.error('Create A/B test error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Update A/B test
router.put('/ab-tests/:testName',
  logAuthAttempt,
  authenticateAdmin,
  limitRequestSize,
  sanitizeInput,
  async (req, res) => {
  try {
    const { testName } = req.params;
    const updates = req.body;
    
    const personality = await getPersonalityContext();
    const testIndex = personality.ab_tests.findIndex(t => t.name === testName);
    
    if (testIndex === -1) {
      return res.status(404).json({
        error: 'A/B test not found'
      });
    }
    
    // Update test
    personality.ab_tests[testIndex] = {
      ...personality.ab_tests[testIndex],
      ...updates,
      name: testName // Ensure name doesn't change
    };
    
    await personality.save();
    res.json(personality.ab_tests[testIndex]);
  } catch (error) {
    console.error('Update A/B test error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get A/B test metrics
router.get('/ab-tests/:testName/metrics',
  logAuthAttempt,
  authenticateAdmin,
  async (req, res) => {
  try {
    const { testName } = req.params;
    const personality = await getPersonalityContext();
    const test = personality.ab_tests.find(t => t.name === testName);
    
    if (!test) {
      return res.status(404).json({
        error: 'A/B test not found'
      });
    }
    
    res.json(test.metrics);
  } catch (error) {
    console.error('Get A/B test metrics error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Track A/B test metric manually
router.post('/ab-tests/:testName/metrics',
  logAuthAttempt,
  authenticateAdmin,
  sanitizeInput,
  async (req, res) => {
  try {
    const { testName } = req.params;
    const { userId, metric, value } = req.body;
    
    if (!userId || !metric || value === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: userId, metric, value'
      });
    }
    
    trackABTestMetric(userId, testName, metric, value);
    res.json({ success: true });
  } catch (error) {
    console.error('Track A/B test metric error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Mood Management Routes

// Get current mood state
router.get('/mood',
  logAuthAttempt,
  authenticateAdmin,
  async (req, res) => {
  try {
    const personality = await getPersonalityContext();
    res.json(personality.mood_states);
  } catch (error) {
    console.error('Get mood error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Update mood settings
router.put('/mood',
  logAuthAttempt,
  authenticateAdmin,
  sanitizeInput,
  async (req, res) => {
  try {
    const { mood_sensitivity, mood_persistence } = req.body;
    const updates = {};
    
    if (mood_sensitivity !== undefined) updates['settings.mood_sensitivity'] = mood_sensitivity;
    if (mood_persistence !== undefined) updates['settings.mood_persistence'] = mood_persistence;
    
    const personality = await updatePersonality(updates);
    res.json(personality.mood_states);
  } catch (error) {
    console.error('Update mood error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Dynamic Quirks Routes

// Generate dynamic quirk based on context
router.post('/personality/dynamic-quirks',
  logAuthAttempt,
  authenticateAdmin,
  limitRequestSize,
  sanitizeInput,
  async (req, res) => {
  try {
    const { conversationTheme, userInterests, recentTopics } = req.body;
    const dynamicQuirks = await generateDynamicQuirk({
      conversationTheme,
      userInterests,
      recentTopics
    });
    
    res.json(dynamicQuirks);
  } catch (error) {
    console.error('Generate dynamic quirk error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Personality Analytics Routes

// Get personality performance metrics
router.get('/personality/analytics',
  logAuthAttempt,
  authenticateAdmin,
  async (req, res) => {
  try {
    const personality = await getPersonalityContext();
    
    // Calculate quirk usage statistics
    const quirkStats = personality.quirks.map(quirk => ({
      trigger: quirk.trigger,
      usage_count: quirk.usage_count || 0,
      enabled: quirk.enabled,
      priority: quirk.priority,
      frequency: quirk.frequency
    }));
    
    // Calculate mood distribution
    const moodTriggers = personality.mood_states.triggers || [];
    const moodDistribution = moodTriggers.reduce((acc, trigger) => {
      acc[trigger.type] = (acc[trigger.type] || 0) + 1;
      return acc;
    }, {});
    
    const analytics = {
      total_quirks: personality.quirks.length,
      enabled_quirks: personality.quirks.filter(q => q.enabled).length,
      quirk_usage: quirkStats,
      mood_distribution: moodDistribution,
      current_mood: personality.mood_states.current,
      mood_intensity: personality.mood_states.intensity,
      active_ab_tests: personality.ab_tests.filter(t => t.active).length,
      personality_version: personality.settings.personality_version
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Get personality analytics error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get quirk performance by trigger
router.get('/personality/quirks/:trigger/performance',
  logAuthAttempt,
  authenticateAdmin,
  async (req, res) => {
  try {
    const { trigger } = req.params;
    const personality = await getPersonalityContext();
    
    const quirks = personality.quirks.filter(q => q.trigger === trigger);
    if (quirks.length === 0) {
      return res.status(404).json({
        error: 'Quirk trigger not found'
      });
    }
    
    const performance = quirks.map(quirk => ({
      trigger: quirk.trigger,
      responses: quirk.responses,
      usage_count: quirk.usage_count || 0,
      last_used: quirk.last_used,
      priority: quirk.priority,
      frequency: quirk.frequency,
      mood_trigger: quirk.mood_trigger,
      enabled: quirk.enabled
    }));
    
    res.json(performance);
  } catch (error) {
    console.error('Get quirk performance error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get analytics data
router.get('/analytics', 
  logAuthAttempt,
  authenticateAdmin,
  validateAnalyticsQuery,
  async (req, res) => {
  try {
    const analytics = await getAnalytics(req.query);
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get active sessions
router.get('/sessions', 
  logAuthAttempt,
  authenticateAdmin,
  async (req, res) => {
  try {
    const sessions = await getActiveSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get conversation history
router.get('/conversations/:sessionId', 
  logAuthAttempt,
  authenticateAdmin,
  async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await getConversationHistory(sessionId);
    res.json(history);
  } catch (error) {
    console.error('Get conversation history error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Health check
router.get('/health', 
  logAuthAttempt,
  authenticateAdmin,
  async (req, res) => {
  try {
    const personality = await getPersonalityContext();
    const isHealthy = personality && personality.settings;
    
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      personality_loaded: !!personality,
      settings_configured: !!personality?.settings
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 