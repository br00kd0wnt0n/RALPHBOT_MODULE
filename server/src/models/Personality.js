import mongoose from 'mongoose';

const QuirkSchema = new mongoose.Schema({
  trigger: {
    type: String,
    required: [true, 'Quirk trigger is required'],
    trim: true,
    maxlength: [200, 'Trigger cannot exceed 200 characters'],
    index: true
  },
  responses: {
    type: [String],
    required: [true, 'Quirk responses are required'],
    validate: {
      validator: function(responses) {
        return responses.length > 0 && responses.length <= 20;
      },
      message: 'Must have between 1 and 20 responses'
    }
  },
  frequency: {
    type: Number,
    min: [1, 'Frequency must be at least 1'],
    max: [10, 'Frequency cannot exceed 10'],
    default: 5
  },
  enabled: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: {
      values: ['startup', 'bored', 'excited', 'error', 'general', 'custom'],
      message: 'Invalid quirk category'
    },
    default: 'general'
  },
  priority: {
    type: Number,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10'],
    default: 5
  }
}, {
  timestamps: true
});

const PhraseSchema = new mongoose.Schema({
  greetings: {
    type: [String],
    default: [],
    validate: {
      validator: function(phrases) {
        return phrases.length <= 50;
      },
      message: 'Cannot exceed 50 greeting phrases'
    }
  },
  processing: {
    type: [String],
    default: [],
    validate: {
      validator: function(phrases) {
        return phrases.length <= 30;
      },
      message: 'Cannot exceed 30 processing phrases'
    }
  },
  excitement: {
    type: [String],
    default: [],
    validate: {
      validator: function(phrases) {
        return phrases.length <= 30;
      },
      message: 'Cannot exceed 30 excitement phrases'
    }
  },
  errors: {
    type: [String],
    default: [],
    validate: {
      validator: function(phrases) {
        return phrases.length <= 20;
      },
      message: 'Cannot exceed 20 error phrases'
    }
  },
  farewell: {
    type: [String],
    default: [],
    validate: {
      validator: function(phrases) {
        return phrases.length <= 30;
      },
      message: 'Cannot exceed 30 farewell phrases'
    }
  },
  custom: {
    type: Map,
    of: [String],
    default: new Map()
  }
}, {
  timestamps: true
});

const SettingsSchema = new mongoose.Schema({
  chattiness: {
    type: Number,
    min: [1, 'Chattiness must be at least 1'],
    max: [10, 'Chattiness cannot exceed 10'],
    default: 7
  },
  quirk_frequency: {
    type: Number,
    min: [1, 'Quirk frequency must be at least 1'],
    max: [10, 'Quirk frequency cannot exceed 10'],
    default: 5
  },
  self_prompt_enabled: {
    type: Boolean,
    default: true
  },
  response_delay: {
    type: Number,
    min: [0, 'Response delay cannot be negative'],
    max: [10000, 'Response delay cannot exceed 10 seconds'],
    default: 1000
  },
  personality_version: {
    type: String,
    required: [true, 'Personality version is required'],
    trim: true,
    match: [/^\d+\.\d+\.\d+$/, 'Version must be in semantic versioning format (e.g., 1.0.0)']
  },
  voice_enabled: {
    type: Boolean,
    default: true
  },
  sound_effects: {
    type: Boolean,
    default: true
  },
  animations: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'en',
    enum: {
      values: ['en', 'es', 'fr', 'de'],
      message: 'Unsupported language'
    }
  },
  timezone: {
    type: String,
    default: 'UTC',
    trim: true
  }
}, {
  timestamps: true
});

const PersonalitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Personality name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    unique: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  quirks: {
    type: [QuirkSchema],
    default: [],
    validate: {
      validator: function(quirks) {
        return quirks.length <= 100; // Limit to 100 quirks
      },
      message: 'Cannot exceed 100 quirks'
    }
  },
  phrases: {
    type: PhraseSchema,
    default: () => ({})
  },
  settings: {
    type: SettingsSchema,
    required: [true, 'Settings are required']
  },
  mood_states: {
    current: { type: String, default: 'normal' },
    intensity: { type: Number, default: 5 },
    last_change: { type: Date, default: Date.now },
    triggers: [{
      type: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      intensity: {
        type: Number,
        default: 5
      }
    }]
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  },
  is_default: {
    type: Boolean,
    default: false
  },
  created_by: {
    type: String,
    trim: true,
    maxlength: [100, 'Creator name too long']
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags) {
        return tags.length <= 20;
      },
      message: 'Cannot exceed 20 tags'
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for quirk count
PersonalitySchema.virtual('quirkCount').get(function() {
  return this.quirks.length;
});

// Virtual for enabled quirk count
PersonalitySchema.virtual('enabledQuirkCount').get(function() {
  return this.quirks.filter(q => q.enabled).length;
});

// Indexes for performance
PersonalitySchema.index({ name: 1 });
PersonalitySchema.index({ is_active: 1, is_default: 1 });
PersonalitySchema.index({ 'quirks.trigger': 1 });
PersonalitySchema.index({ 'quirks.category': 1 });
PersonalitySchema.index({ createdAt: -1 });
PersonalitySchema.index({ updatedAt: -1 });

// Pre-save middleware to validate version
PersonalitySchema.pre('save', function(next) {
  // Ensure only one default personality exists
  if (this.is_default) {
    this.constructor.updateMany(
      { _id: { $ne: this._id }, is_default: true },
      { is_default: false }
    ).exec();
  }
  
  next();
});

// Static method to get active personality
PersonalitySchema.statics.getActive = function() {
  return this.findOne({ is_active: true, is_default: true });
};

// Static method to get personality by name
PersonalitySchema.statics.findByName = function(name) {
  return this.findOne({ name: new RegExp(name, 'i') });
};

// Static method to get personalities by category
PersonalitySchema.statics.findByCategory = function(category) {
  return this.find({ 'quirks.category': category, is_active: true });
};

// Instance method to add quirk
PersonalitySchema.methods.addQuirk = function(trigger, responses, category = 'custom') {
  this.quirks.push({
    trigger,
    responses: Array.isArray(responses) ? responses : [responses],
    category
  });
  return this.save();
};

// Instance method to remove quirk
PersonalitySchema.methods.removeQuirk = function(trigger) {
  this.quirks = this.quirks.filter(q => q.trigger !== trigger);
  return this.save();
};

// Instance method to enable/disable quirk
PersonalitySchema.methods.toggleQuirk = function(trigger) {
  const quirk = this.quirks.find(q => q.trigger === trigger);
  if (quirk) {
    quirk.enabled = !quirk.enabled;
    return this.save();
  }
  throw new Error('Quirk not found');
};

// Instance method to get random quirk response
PersonalitySchema.methods.getRandomQuirkResponse = function(trigger) {
  const enabledQuirks = this.quirks.filter(q => 
    q.trigger === trigger && q.enabled
  );
  
  if (enabledQuirks.length === 0) return null;
  
  const randomQuirk = enabledQuirks[Math.floor(Math.random() * enabledQuirks.length)];
  const randomResponse = randomQuirk.responses[Math.floor(Math.random() * randomQuirk.responses.length)];
  
  return randomResponse;
};

// Instance method to get random phrase
PersonalitySchema.methods.getRandomPhrase = function(type) {
  const phrases = this.phrases[type];
  if (!phrases || phrases.length === 0) return null;
  
  return phrases[Math.floor(Math.random() * phrases.length)];
};

const Personality = mongoose.model('Personality', PersonalitySchema);

export default Personality; 