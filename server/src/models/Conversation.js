import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  sender: {
    type: String,
    required: [true, 'Sender is required'],
    enum: {
      values: ['user', 'bot'],
      message: 'Sender must be either "user" or "bot"'
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  mood: {
    type: String,
    enum: {
      values: ['normal', 'excited', 'glitchy', 'bored', 'error', 'positive', 'negative'],
      message: 'Invalid mood value'
    },
    default: 'normal'
  },
  confidence: {
    type: Number,
    min: [0, 'Confidence cannot be negative'],
    max: [1, 'Confidence cannot exceed 1'],
    default: 0.8
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true,
    index: true
  },
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  messages: {
    type: [MessageSchema],
    default: [],
    validate: {
      validator: function(messages) {
        return messages.length <= 1000; // Limit to 1000 messages per conversation
      },
      message: 'Conversation cannot exceed 1000 messages'
    }
  },
  metadata: {
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent too long']
    },
    ipAddress: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^[a-fA-F0-9:]+$/.test(v);
        },
        message: 'Invalid IP address format'
      }
    },
    referrer: {
      type: String,
      trim: true,
      maxlength: [500, 'Referrer too long']
    },
    currentPage: {
      type: String,
      trim: true,
      maxlength: [200, 'Page URL too long']
    },
    deviceInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  analytics: {
    totalMessages: {
      type: Number,
      default: 0,
      min: [0, 'Total messages cannot be negative']
    },
    userMessages: {
      type: Number,
      default: 0,
      min: [0, 'User messages cannot be negative']
    },
    botMessages: {
      type: Number,
      default: 0,
      min: [0, 'Bot messages cannot be negative']
    },
    averageResponseTime: {
      type: Number,
      default: 0,
      min: [0, 'Response time cannot be negative']
    },
    sessionDuration: {
      type: Number,
      default: 0,
      min: [0, 'Session duration cannot be negative']
    },
    topics: {
      type: [String],
      default: [],
      validate: {
        validator: function(topics) {
          return topics.length <= 50; // Limit to 50 topics
        },
        message: 'Cannot exceed 50 topics'
      }
    },
    sentiment: {
      positive: {
        type: Number,
        default: 0,
        min: [0, 'Positive count cannot be negative']
      },
      neutral: {
        type: Number,
        default: 0,
        min: [0, 'Neutral count cannot be negative']
      },
      negative: {
        type: Number,
        default: 0,
        min: [0, 'Negative count cannot be negative']
      }
    },
    satisfaction: {
      type: Number,
      min: [1, 'Satisfaction must be at least 1'],
      max: [5, 'Satisfaction cannot exceed 5'],
      default: null
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'paused', 'ended', 'archived'],
      message: 'Invalid status value'
    },
    default: 'active'
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags) {
        return tags.length <= 20; // Limit to 20 tags
      },
      message: 'Cannot exceed 20 tags'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for message count
ConversationSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Virtual for session duration in minutes
ConversationSchema.virtual('durationMinutes').get(function() {
  if (!this.analytics.sessionDuration) return 0;
  return Math.round(this.analytics.sessionDuration / 60000);
});

// Indexes for performance
ConversationSchema.index({ userId: 1, createdAt: -1 });
ConversationSchema.index({ sessionId: 1 });
ConversationSchema.index({ 'messages.timestamp': -1 });
ConversationSchema.index({ status: 1, updatedAt: -1 });
ConversationSchema.index({ 'analytics.topics': 1 });
ConversationSchema.index({ createdAt: -1 });

// Pre-save middleware to update analytics
ConversationSchema.pre('save', function(next) {
  // Update message counts
  this.analytics.totalMessages = this.messages.length;
  this.analytics.userMessages = this.messages.filter(m => m.sender === 'user').length;
  this.analytics.botMessages = this.messages.filter(m => m.sender === 'bot').length;
  
  // Update session duration if conversation is ended
  if (this.status === 'ended' && this.messages.length > 0) {
    const firstMessage = this.messages[0];
    const lastMessage = this.messages[this.messages.length - 1];
    this.analytics.sessionDuration = lastMessage.timestamp - firstMessage.timestamp;
  }
  
  next();
});

// Static method to get conversations by user
ConversationSchema.statics.findByUser = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('messages');
};

// Static method to get active conversations
ConversationSchema.statics.findActive = function() {
  return this.find({ status: 'active' })
    .sort({ updatedAt: -1 });
};

// Instance method to add message
ConversationSchema.methods.addMessage = function(text, sender, mood = 'normal', confidence = 0.8) {
  this.messages.push({
    text,
    sender,
    mood,
    confidence,
    timestamp: new Date()
  });
  
  // Update sentiment
  if (mood === 'excited' || mood === 'positive') {
    this.analytics.sentiment.positive++;
  } else if (mood === 'error' || mood === 'negative') {
    this.analytics.sentiment.negative++;
  } else {
    this.analytics.sentiment.neutral++;
  }
  
  return this.save();
};

// Instance method to end conversation
ConversationSchema.methods.endConversation = function() {
  this.status = 'ended';
  if (this.messages.length > 0) {
    const firstMessage = this.messages[0];
    const lastMessage = this.messages[this.messages.length - 1];
    this.analytics.sessionDuration = lastMessage.timestamp - firstMessage.timestamp;
  }
  return this.save();
};

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation; 