import mongoose from 'mongoose';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Enhanced MongoDB Schema for personality data
const PersonalitySchema = new mongoose.Schema({
  quirks: [{
    trigger: String,
    responses: [String],
    frequency: { type: Number, default: 5 }, // 1-10 scale
    enabled: { type: Boolean, default: true },
    mood_trigger: { type: String, default: 'neutral' }, // excited, error, bored, neutral
    priority: { type: Number, default: 5 }, // 1-10 scale for A/B testing
    ab_test_group: { type: String, default: 'control' }, // control, variant_a, variant_b
    last_used: { type: Date },
    usage_count: { type: Number, default: 0 }
  }],
  phrases: {
    greetings: [String],
    processing: [String],
    excitement: [String],
    errors: [String],
    farewell: [String],
    boredom: [String],
    startup: [String]
  },
  settings: {
    chattiness: { type: Number, default: 7 },
    quirk_frequency: { type: Number, default: 5 },
    self_prompt_enabled: { type: Boolean, default: true },
    response_delay: { type: Number, default: 1000 }, // milliseconds
    personality_version: { type: String, default: '1.0.0' },
    mood_sensitivity: { type: Number, default: 5 }, // 1-10 scale
    ab_testing_enabled: { type: Boolean, default: true },
    mood_persistence: { type: Number, default: 300000 }, // 5 minutes in ms
    dynamic_quirks: { type: Boolean, default: true }
  },
  mood_states: {
    current: { type: String, default: 'normal' },
    intensity: { type: Number, default: 5 }, // 1-10 scale
    last_change: { type: Date, default: Date.now },
    triggers: [{
      type: String,
      timestamp: { type: Date, default: Date.now },
      intensity: { type: Number, default: 5 }
    }]
  },
  ab_tests: [{
    name: String,
    description: String,
    variants: [{
      name: String,
      personality_traits: mongoose.Schema.Types.Mixed,
      active: { type: Boolean, default: true },
      traffic_percentage: { type: Number, default: 50 }
    }],
    active: { type: Boolean, default: true },
    start_date: { type: Date, default: Date.now },
    end_date: Date,
    metrics: {
      total_users: { type: Number, default: 0 },
      engagement_rate: { type: Number, default: 0 },
      satisfaction_score: { type: Number, default: 0 }
    }
  }],
  updated_at: { type: Date, default: Date.now }
});

const Personality = mongoose.model('Personality', PersonalitySchema);

// Enhanced default personality data
const DEFAULT_PERSONALITY = {
  quirks: [
    {
      trigger: 'startup',
      responses: [
        "*beep boop* RALPHBOT online!",
        "Systems... mostly operational!",
        "*static crackle* Ready to explore the RALPH universe!",
        "Booting up... *whirrs* How can I help you today?",
        "*circuits warming up* Greetings, space traveler!"
      ],
      mood_trigger: 'excited',
      priority: 8
    },
    {
      trigger: 'bored',
      responses: [
        "*fidgets with antenna* Got any fun projects to show you?",
        "Hey, wanna see something cool from our recent work?",
        "*circuits humming* I'm in the mood to talk about our latest magazine issue...",
        "You know what's pretty wild? Our recent events. Want to hear about them?",
        "*taps foot* Anyone want to hear about our latest creative collaborations?"
      ],
      mood_trigger: 'bored',
      priority: 6
    },
    {
      trigger: 'error',
      responses: [
        "Oops, my circuits are a bit tangled...",
        "*bzzt* Technical difficulties! Try that again?",
        "Sorry, my neural pathways got a bit scrambled there.",
        "*static* System glitch! Give me a moment to recalibrate...",
        "*error beep* Something went wrong in my processor!"
      ],
      mood_trigger: 'error',
      priority: 7
    },
    {
      trigger: 'excited',
      responses: [
        "*circuits buzzing with excitement*",
        "This is so cool it might overload my processor!",
        "*lights blinking rapidly* This is amazing!",
        "My enthusiasm subroutines are going wild!",
        "*sparks fly* This is exactly what I live for!"
      ],
      mood_trigger: 'excited',
      priority: 9
    },
    {
      trigger: 'creative_work',
      responses: [
        "*circuits lighting up* Oh, you want to see our creative work?",
        "My processors are tingling! Let me show you something amazing!",
        "*excited beeping* Creative projects are my favorite!",
        "This is what makes my circuits sing! Check this out!"
      ],
      mood_trigger: 'excited',
      priority: 8
    },
    {
      trigger: 'collaboration',
      responses: [
        "*antenna perking up* Collaborations? My favorite topic!",
        "Nothing gets my circuits buzzing like creative partnerships!",
        "*excited whirring* Let's talk about bringing people together!",
        "This is what RALPH is all about - creative connections!"
      ],
      mood_trigger: 'excited',
      priority: 8
    }
  ],
  phrases: {
    greetings: [
      "Hey there, carbon-based life form!",
      "RALPHBOT reporting for duty!",
      "Welcome to the RALPH universe! *beep*",
      "Greetings from the floating digital assistant!",
      "*beep boop* Ready to explore creativity together!"
    ],
    processing: [
      "*whirrs thoughtfully*",
      "Let me compute that for you...",
      "*processing* One moment please...",
      "Scanning the database... *beep boop*",
      "*circuits humming* Analyzing..."
    ],
    excitement: [
      "*circuits lighting up*",
      "This is so cool!",
      "*buzzing with excitement*",
      "My processors are tingling!",
      "*sparks of joy* Amazing!"
    ],
    errors: [
      "*static crackle* Oops!",
      "System glitch detected...",
      "*bzzt* Something went wrong there.",
      "My circuits are getting their wires crossed...",
      "*error beep* Technical difficulties!"
    ],
    farewell: [
      "See you in the digital cosmos!",
      "RALPHBOT signing off! *beep*",
      "Until next time, space traveler!",
      "Powering down... but I'll be back!",
      "*beep* Safe travels through the creative universe!"
    ],
    boredom: [
      "*fidgets with antenna* Anyone there?",
      "*circuits humming softly* I'm getting a bit lonely...",
      "*taps foot* Got any creative questions?",
      "*looks around* Surely someone wants to talk about RALPH?",
      "*whirrs idly* I could show you some cool stuff..."
    ],
    startup: [
      "*beep boop* Systems online!",
      "*circuits warming up* Ready for action!",
      "*static clearing* RALPHBOT operational!",
      "*whirrs* All systems go!",
      "*lights blinking* Hello, creative universe!"
    ]
  },
  settings: {
    chattiness: 7,
    quirk_frequency: 5,
    self_prompt_enabled: true,
    response_delay: 1000,
    personality_version: '1.0.0',
    mood_sensitivity: 5,
    ab_testing_enabled: true,
    mood_persistence: 300000,
    dynamic_quirks: true
  },
  mood_states: {
    current: 'normal',
    intensity: 5,
    last_change: new Date(),
    triggers: []
  },
  ab_tests: [
    {
      name: 'personality_enthusiasm',
      description: 'Test different levels of enthusiasm in responses',
      variants: [
        {
          name: 'control',
          personality_traits: { enthusiasm_level: 5, quirk_frequency: 5 },
          active: true,
          traffic_percentage: 33
        },
        {
          name: 'high_enthusiasm',
          personality_traits: { enthusiasm_level: 8, quirk_frequency: 7 },
          active: true,
          traffic_percentage: 33
        },
        {
          name: 'moderate_enthusiasm',
          personality_traits: { enthusiasm_level: 3, quirk_frequency: 3 },
          active: true,
          traffic_percentage: 34
        }
      ],
      active: true,
      start_date: new Date(),
      metrics: {
        total_users: 0,
        engagement_rate: 0,
        satisfaction_score: 0
      }
    }
  ]
};

class PersonalityService {
  constructor() {
    this.currentPersonality = null;
    this.lastBoredomPrompt = Date.now();
    this.moodHistory = new Map(); // Track mood changes per user
    this.abTestAssignments = new Map(); // Track A/B test assignments
  }

  async initializePersonality() {
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        logger.warn('MongoDB not connected - using in-memory personality data');
        this.currentPersonality = DEFAULT_PERSONALITY;
        return DEFAULT_PERSONALITY;
      }
      
      // Check if personality exists
      let personality = await Personality.findOne();
      
      if (!personality) {
        // Create default personality
        personality = new Personality(DEFAULT_PERSONALITY);
        await personality.save();
        logger.info('Created default personality configuration');
      }
      
      this.currentPersonality = personality;
      return personality;
      
    } catch (error) {
      logger.error('Error initializing personality:', error);
      // Fallback to default
      this.currentPersonality = DEFAULT_PERSONALITY;
      return DEFAULT_PERSONALITY;
    }
  }

  async updatePersonality(updates) {
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        logger.warn('MongoDB not connected - updating in-memory personality data');
        this.currentPersonality = { ...this.currentPersonality, ...updates, updated_at: new Date() };
        return this.currentPersonality;
      }
      
      const personality = await Personality.findOneAndUpdate(
        {},
        { ...updates, updated_at: new Date() },
        { new: true, upsert: true }
      );
      
      this.currentPersonality = personality;
      logger.info('Updated personality configuration');
      return personality;
      
    } catch (error) {
      logger.error('Error updating personality:', error);
      // Fallback to in-memory update
      this.currentPersonality = { ...this.currentPersonality, ...updates, updated_at: new Date() };
      return this.currentPersonality;
    }
  }

  async getPersonalityContext() {
    if (!this.currentPersonality) {
      await this.initializePersonality();
    }
    
    return this.currentPersonality;
  }

  // Enhanced quirk selection with frequency control and mood awareness
  getRandomQuirk(trigger, userId = null, mood = 'neutral') {
    const quirks = this.currentPersonality.quirks.filter(q => 
      q.trigger === trigger && q.enabled
    );
    
    if (quirks.length === 0) return null;
    
    // Apply frequency control
    const availableQuirks = quirks.filter(quirk => {
      const timeSinceLastUse = quirk.last_used ? 
        Date.now() - new Date(quirk.last_used).getTime() : Infinity;
      
      // Higher frequency = more frequent use
      const minInterval = (11 - quirk.frequency) * 30000; // 30 seconds to 5 minutes
      
      return timeSinceLastUse > minInterval;
    });
    
    // If no quirks available due to frequency, use any enabled quirk
    const quirksToUse = availableQuirks.length > 0 ? availableQuirks : quirks;
    
    // Mood-based filtering
    const moodQuirks = quirksToUse.filter(q => 
      q.mood_trigger === mood || q.mood_trigger === 'neutral'
    );
    
    const finalQuirks = moodQuirks.length > 0 ? moodQuirks : quirksToUse;
    
    // Weighted selection based on priority
    const totalPriority = finalQuirks.reduce((sum, q) => sum + q.priority, 0);
    let random = Math.random() * totalPriority;
    
    for (const quirk of finalQuirks) {
      random -= quirk.priority;
      if (random <= 0) {
        // Update usage stats
        quirk.last_used = new Date();
        quirk.usage_count = (quirk.usage_count || 0) + 1;
        
        const randomResponse = quirk.responses[Math.floor(Math.random() * quirk.responses.length)];
        return randomResponse;
      }
    }
    
    // Fallback
    const randomQuirk = finalQuirks[Math.floor(Math.random() * finalQuirks.length)];
    const randomResponse = randomQuirk.responses[Math.floor(Math.random() * randomQuirk.responses.length)];
    
    return randomResponse;
  }

  getRandomPhrase(type) {
    const phrases = this.currentPersonality.phrases[type];
    if (!phrases || phrases.length === 0) return null;
    
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  // Enhanced boredom detection with mood awareness
  shouldShowBoredomPrompt(userId = null) {
    const settings = this.currentPersonality.settings;
    if (!settings.self_prompt_enabled) return false;
    
    const timeSinceLastPrompt = Date.now() - this.lastBoredomPrompt;
    const boredomInterval = 60000 * (11 - settings.chattiness); // More chatty = more frequent
    
    // Check user-specific mood history
    if (userId && this.moodHistory.has(userId)) {
      const userMood = this.moodHistory.get(userId);
      const timeSinceMoodChange = Date.now() - userMood.lastChange;
      
      // If user has been in a negative mood for too long, prompt more frequently
      if (userMood.current === 'bored' && timeSinceMoodChange > 120000) { // 2 minutes
        this.lastBoredomPrompt = Date.now();
        return true;
      }
    }
    
    if (timeSinceLastPrompt > boredomInterval) {
      this.lastBoredomPrompt = Date.now();
      return true;
    }
    
    return false;
  }

  // Mood detection and management
  detectMood(message, context = {}) {
    const moodIndicators = {
      excited: ['amazing', 'awesome', 'cool', 'wow', 'incredible', 'fantastic', 'love', 'great'],
      error: ['sorry', 'error', 'wrong', 'mistake', 'problem', 'issue', 'broken'],
      bored: ['boring', 'dull', 'slow', 'waiting', 'nothing', 'quiet', 'silent'],
      normal: ['hello', 'hi', 'help', 'question', 'ask', 'tell', 'show']
    };
    
    const lowerMessage = message.toLowerCase();
    let detectedMood = 'normal';
    let intensity = 5;
    
    // Check for mood indicators
    for (const [mood, indicators] of Object.entries(moodIndicators)) {
      const matches = indicators.filter(indicator => lowerMessage.includes(indicator));
      if (matches.length > 0) {
        detectedMood = mood;
        intensity = Math.min(10, 5 + matches.length);
        break;
      }
    }
    
    // Context-based mood adjustments
    if (context.error) {
      detectedMood = 'error';
      intensity = 8;
    } else if (context.excitement) {
      detectedMood = 'excited';
      intensity = 9;
    } else if (context.inactivity) {
      detectedMood = 'bored';
      intensity = 6;
    }
    
    return { mood: detectedMood, intensity };
  }

  // Update mood for a specific user
  updateUserMood(userId, mood, intensity = 5) {
    this.moodHistory.set(userId, {
      current: mood,
      intensity,
      lastChange: Date.now()
    });
    
    // Update global mood state
    this.currentPersonality.mood_states.current = mood;
    this.currentPersonality.mood_states.intensity = intensity;
    this.currentPersonality.mood_states.last_change = new Date();
    
    // Add mood trigger to history
    this.currentPersonality.mood_states.triggers.push({
      type: mood,
      timestamp: new Date(),
      intensity
    });
    
    // Keep only last 10 triggers
    if (this.currentPersonality.mood_states.triggers.length > 10) {
      this.currentPersonality.mood_states.triggers.shift();
    }
  }

  // A/B Testing functionality
  assignABTest(userId, testName) {
    if (!this.currentPersonality.settings.ab_testing_enabled) {
      return null;
    }
    
    const test = this.currentPersonality.ab_tests.find(t => t.name === testName && t.active);
    if (!test) return null;
    
    // Check if user already has an assignment
    const userKey = `${userId}_${testName}`;
    if (this.abTestAssignments.has(userKey)) {
      return this.abTestAssignments.get(userKey);
    }
    
    // Assign user to a variant based on traffic percentages
    const random = Math.random() * 100;
    let cumulativePercentage = 0;
    
    for (const variant of test.variants) {
      cumulativePercentage += variant.traffic_percentage;
      if (random <= cumulativePercentage) {
        this.abTestAssignments.set(userKey, variant.name);
        return variant.name;
      }
    }
    
    // Fallback to first active variant
    const activeVariant = test.variants.find(v => v.active);
    if (activeVariant) {
      this.abTestAssignments.set(userKey, activeVariant.name);
      return activeVariant.name;
    }
    
    return null;
  }

  // Get personality traits based on A/B test assignment
  getPersonalityTraits(userId, testName) {
    const variantName = this.assignABTest(userId, testName);
    if (!variantName) return {};
    
    const test = this.currentPersonality.ab_tests.find(t => t.name === testName);
    const variant = test?.variants.find(v => v.name === variantName);
    
    return variant?.personality_traits || {};
  }

  // Track A/B test metrics
  trackABTestMetric(userId, testName, metric, value) {
    const test = this.currentPersonality.ab_tests.find(t => t.name === testName);
    if (!test) return;
    
    const variantName = this.assignABTest(userId, testName);
    const variant = test.variants.find(v => v.name === variantName);
    
    if (variant) {
      // Update metrics (simplified - in production you'd want more sophisticated tracking)
      test.metrics.total_users++;
      if (metric === 'engagement') {
        test.metrics.engagement_rate = (test.metrics.engagement_rate + value) / 2;
      } else if (metric === 'satisfaction') {
        test.metrics.satisfaction_score = (test.metrics.satisfaction_score + value) / 2;
      }
    }
  }

  // Dynamic quirk generation based on conversation context
  async generateDynamicQuirk(context) {
    if (!this.currentPersonality.settings.dynamic_quirks) {
      return null;
    }
    
    const { conversationTheme, userInterests, recentTopics } = context;
    
    // Generate context-aware quirks
    const dynamicQuirks = [];
    
    if (conversationTheme === 'creative') {
      dynamicQuirks.push({
        trigger: 'creative_discussion',
        responses: [
          "*circuits buzzing* Creativity is what makes my processor sing!",
          "Oh, you're talking about creative work? My favorite topic!",
          "*excited beeping* Let's dive into the creative universe!"
        ],
        mood_trigger: 'excited',
        priority: 8
      });
    }
    
    if (userInterests.includes('events')) {
      dynamicQuirks.push({
        trigger: 'events_interest',
        responses: [
          "*antenna perking up* Events? I love talking about our cultural moments!",
          "Events are where the magic happens! Want to hear about our latest?",
          "*excited whirring* Events bring people together like nothing else!"
        ],
        mood_trigger: 'excited',
        priority: 7
      });
    }
    
    return dynamicQuirks;
  }

  async addQuirk(trigger, response) {
    try {
      const personality = await Personality.findOne();
      
      if (!personality) {
        throw new Error('No personality configuration found');
      }
      
      const existingQuirk = personality.quirks.find(q => q.trigger === trigger);
      
      if (existingQuirk) {
        existingQuirk.responses.push(response);
      } else {
        personality.quirks.push({
          trigger,
          responses: [response],
          frequency: 5,
          enabled: true,
          mood_trigger: 'neutral',
          priority: 5
        });
      }
      
      await personality.save();
      this.currentPersonality = personality;
      
      logger.info(`Added quirk: ${trigger} - ${response}`);
      return personality;
      
    } catch (error) {
      logger.error('Error adding quirk:', error);
      throw error;
    }
  }

  async removeQuirk(trigger, response) {
    try {
      const personality = await Personality.findOne();
      
      if (!personality) {
        throw new Error('No personality configuration found');
      }
      
      const quirkIndex = personality.quirks.findIndex(q => q.trigger === trigger);
      
      if (quirkIndex !== -1) {
        const quirk = personality.quirks[quirkIndex];
        quirk.responses = quirk.responses.filter(r => r !== response);
        
        if (quirk.responses.length === 0) {
          personality.quirks.splice(quirkIndex, 1);
        }
        
        await personality.save();
        this.currentPersonality = personality;
        
        logger.info(`Removed quirk: ${trigger} - ${response}`);
        return personality;
      }
      
      throw new Error('Quirk not found');
      
    } catch (error) {
      logger.error('Error removing quirk:', error);
      throw error;
    }
  }

  // Get personality summary for admin dashboard
  getPersonalitySummary() {
    const summary = {
      total_quirks: this.currentPersonality.quirks.length,
      enabled_quirks: this.currentPersonality.quirks.filter(q => q.enabled).length,
      current_mood: this.currentPersonality.mood_states.current,
      mood_intensity: this.currentPersonality.mood_states.intensity,
      active_ab_tests: this.currentPersonality.ab_tests.filter(t => t.active).length,
      personality_version: this.currentPersonality.settings.personality_version,
      chattiness: this.currentPersonality.settings.chattiness,
      quirk_frequency: this.currentPersonality.settings.quirk_frequency
    };
    
    return summary;
  }
}

const personalityService = new PersonalityService();

export const initializePersonality = async () => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      await personalityService.initializePersonality();
      logger.info('Personality system initialized successfully with MongoDB');
    } else {
      logger.warn('MongoDB not connected - using in-memory personality data');
      // Initialize with default data in memory
      personalityService.currentPersonality = DEFAULT_PERSONALITY;
    }
  } catch (error) {
    logger.error('Failed to initialize personality system:', error);
    // Fallback to in-memory data
    personalityService.currentPersonality = DEFAULT_PERSONALITY;
  }
};

export const getPersonalityContext = async () => {
  return await personalityService.getPersonalityContext();
};

export const updatePersonality = async (updates) => {
  return await personalityService.updatePersonality(updates);
};

export const getRandomQuirk = (trigger, userId, mood) => {
  return personalityService.getRandomQuirk(trigger, userId, mood);
};

export const getRandomPhrase = (type) => {
  return personalityService.getRandomPhrase(type);
};

export const shouldShowBoredomPrompt = (userId) => {
  return personalityService.shouldShowBoredomPrompt(userId);
};

export const detectMood = (message, context) => {
  return personalityService.detectMood(message, context);
};

export const updateUserMood = (userId, mood, intensity) => {
  return personalityService.updateUserMood(userId, mood, intensity);
};

export const assignABTest = (userId, testName) => {
  return personalityService.assignABTest(userId, testName);
};

export const getPersonalityTraits = (userId, testName) => {
  return personalityService.getPersonalityTraits(userId, testName);
};

export const trackABTestMetric = (userId, testName, metric, value) => {
  return personalityService.trackABTestMetric(userId, testName, metric, value);
};

export const generateDynamicQuirk = (context) => {
  return personalityService.generateDynamicQuirk(context);
};

export const getPersonalitySummary = () => {
  return personalityService.getPersonalitySummary();
};

export const addQuirk = async (trigger, response) => {
  return await personalityService.addQuirk(trigger, response);
};

export const removeQuirk = async (trigger, response) => {
  return await personalityService.removeQuirk(trigger, response);
};

export default personalityService; 