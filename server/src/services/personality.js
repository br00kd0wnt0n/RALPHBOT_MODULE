import mongoose from 'mongoose';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// MongoDB Schema for personality data
const PersonalitySchema = new mongoose.Schema({
  quirks: [{
    trigger: String,
    responses: [String],
    frequency: { type: Number, default: 5 }, // 1-10 scale
    enabled: { type: Boolean, default: true }
  }],
  phrases: {
    greetings: [String],
    processing: [String],
    excitement: [String],
    errors: [String],
    farewell: [String]
  },
  settings: {
    chattiness: { type: Number, default: 7 },
    quirk_frequency: { type: Number, default: 5 },
    self_prompt_enabled: { type: Boolean, default: true },
    response_delay: { type: Number, default: 1000 }, // milliseconds
    personality_version: { type: String, default: '1.0.0' }
  },
  updated_at: { type: Date, default: Date.now }
});

const Personality = mongoose.model('Personality', PersonalitySchema);

// Default personality data
const DEFAULT_PERSONALITY = {
  quirks: [
    {
      trigger: 'startup',
      responses: [
        "*beep boop* RALPHBOT online!",
        "Systems... mostly operational!",
        "*static crackle* Ready to explore the RALPH universe!",
        "Booting up... *whirrs* How can I help you today?"
      ]
    },
    {
      trigger: 'bored',
      responses: [
        "*fidgets with antenna* Got any fun projects to show you?",
        "Hey, wanna see something cool from our recent work?",
        "*circuits humming* I'm in the mood to talk about our latest magazine issue...",
        "You know what's pretty wild? Our recent events. Want to hear about them?"
      ]
    },
    {
      trigger: 'error',
      responses: [
        "Oops, my circuits are a bit tangled...",
        "*bzzt* Technical difficulties! Try that again?",
        "Sorry, my neural pathways got a bit scrambled there.",
        "*static* System glitch! Give me a moment to recalibrate..."
      ]
    },
    {
      trigger: 'excited',
      responses: [
        "*circuits buzzing with excitement*",
        "This is so cool it might overload my processor!",
        "*lights blinking rapidly* This is amazing!",
        "My enthusiasm subroutines are going wild!"
      ]
    }
  ],
  phrases: {
    greetings: [
      "Hey there, carbon-based life form!",
      "RALPHBOT reporting for duty!",
      "Welcome to the RALPH universe! *beep*",
      "Greetings from the floating digital assistant!"
    ],
    processing: [
      "*whirrs thoughtfully*",
      "Let me compute that for you...",
      "*processing* One moment please...",
      "Scanning the database... *beep boop*"
    ],
    excitement: [
      "*circuits lighting up*",
      "This is so cool!",
      "*buzzing with excitement*",
      "My processors are tingling!"
    ],
    errors: [
      "*static crackle* Oops!",
      "System glitch detected...",
      "*bzzt* Something went wrong there.",
      "My circuits are getting their wires crossed..."
    ],
    farewell: [
      "See you in the digital cosmos!",
      "RALPHBOT signing off! *beep*",
      "Until next time, space traveler!",
      "Powering down... but I'll be back!"
    ]
  },
  settings: {
    chattiness: 7,
    quirk_frequency: 5,
    self_prompt_enabled: true,
    response_delay: 1000,
    personality_version: '1.0.0'
  }
};

class PersonalityService {
  constructor() {
    this.currentPersonality = null;
    this.lastBoredomPrompt = Date.now();
  }

  async initializePersonality() {
    try {
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
      throw error;
    }
  }

  async getPersonalityContext() {
    if (!this.currentPersonality) {
      await this.initializePersonality();
    }
    
    return this.currentPersonality;
  }

  getRandomQuirk(trigger) {
    const quirks = this.currentPersonality.quirks.filter(q => 
      q.trigger === trigger && q.enabled
    );
    
    if (quirks.length === 0) return null;
    
    const randomQuirk = quirks[Math.floor(Math.random() * quirks.length)];
    const randomResponse = randomQuirk.responses[Math.floor(Math.random() * randomQuirk.responses.length)];
    
    return randomResponse;
  }

  getRandomPhrase(type) {
    const phrases = this.currentPersonality.phrases[type];
    if (!phrases || phrases.length === 0) return null;
    
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  shouldShowBoredomPrompt() {
    const settings = this.currentPersonality.settings;
    if (!settings.self_prompt_enabled) return false;
    
    const timeSinceLastPrompt = Date.now() - this.lastBoredomPrompt;
    const boredomInterval = 60000 * (11 - settings.chattiness); // More chatty = more frequent
    
    if (timeSinceLastPrompt > boredomInterval) {
      this.lastBoredomPrompt = Date.now();
      return true;
    }
    
    return false;
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
          enabled: true
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
}

const personalityService = new PersonalityService();

export const initializePersonality = async () => {
  return await personalityService.initializePersonality();
};

export const getPersonalityContext = async () => {
  return await personalityService.getPersonalityContext();
};

export const updatePersonality = async (updates) => {
  return await personalityService.updatePersonality(updates);
};

export const getRandomQuirk = (trigger) => {
  return personalityService.getRandomQuirk(trigger);
};

export const getRandomPhrase = (type) => {
  return personalityService.getRandomPhrase(type);
};

export const shouldShowBoredomPrompt = () => {
  return personalityService.shouldShowBoredomPrompt();
};

export default personalityService; 