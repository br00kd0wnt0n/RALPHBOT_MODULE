import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true,
    index: true
  },
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    trim: true,
    index: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: {
      values: [
        'message_sent',
        'message_received',
        'button_click',
        'voice_input',
        'voice_output',
        'page_view',
        'conversation_start',
        'conversation_end',
        'error_occurred',
        'satisfaction_rated'
      ],
      message: 'Invalid action type'
    },
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
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
    currentPage: {
      type: String,
      trim: true,
      maxlength: [200, 'Page URL too long']
    },
    deviceInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    performance: {
      responseTime: Number,
      loadTime: Number,
      memoryUsage: Number
    }
  }
}, {
  timestamps: true
});

const PopularQuerySchema = new mongoose.Schema({
  query: {
    type: String,
    required: [true, 'Query text is required'],
    trim: true,
    maxlength: [500, 'Query too long'],
    index: true
  },
  count: {
    type: Number,
    default: 1,
    min: [1, 'Count must be at least 1']
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: {
      values: ['work', 'magazine', 'events', 'shop', 'friends', 'general'],
      message: 'Invalid query category'
    },
    default: 'general',
    index: true
  },
  successRate: {
    type: Number,
    min: [0, 'Success rate cannot be negative'],
    max: [1, 'Success rate cannot exceed 1'],
    default: 0.8
  },
  averageSatisfaction: {
    type: Number,
    min: [1, 'Satisfaction must be at least 1'],
    max: [5, 'Satisfaction cannot exceed 5'],
    default: null
  }
}, {
  timestamps: true
});

const SatisfactionSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'Conversation ID is required'],
    index: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true,
    index: true
  },
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    trim: true,
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: {
      values: ['helpfulness', 'accuracy', 'speed', 'personality', 'overall'],
      message: 'Invalid satisfaction category'
    },
    default: 'overall'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  metadata: {
    responseTime: Number,
    messageCount: Number,
    topics: [String],
    mood: String
  }
}, {
  timestamps: true
});

const DailyStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    unique: true,
    index: true
  },
  totalConversations: {
    type: Number,
    default: 0,
    min: [0, 'Total conversations cannot be negative']
  },
  totalMessages: {
    type: Number,
    default: 0,
    min: [0, 'Total messages cannot be negative']
  },
  totalInteractions: {
    type: Number,
    default: 0,
    min: [0, 'Total interactions cannot be negative']
  },
  uniqueUsers: {
    type: Number,
    default: 0,
    min: [0, 'Unique users cannot be negative']
  },
  averageSessionDuration: {
    type: Number,
    default: 0,
    min: [0, 'Average session duration cannot be negative']
  },
  averageSatisfaction: {
    type: Number,
    default: 0,
    min: [0, 'Average satisfaction cannot be negative'],
    max: [5, 'Average satisfaction cannot exceed 5']
  },
  topTopics: [{
    topic: String,
    count: Number
  }],
  sentimentBreakdown: {
    positive: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    negative: { type: Number, default: 0 }
  },
  errors: {
    type: Number,
    default: 0,
    min: [0, 'Error count cannot be negative']
  },
  performance: {
    averageResponseTime: { type: Number, default: 0 },
    uptime: { type: Number, default: 100 },
    memoryUsage: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const AnalyticsSchema = new mongoose.Schema({
  interactions: {
    type: [InteractionSchema],
    default: []
  },
  popularQueries: {
    type: [PopularQuerySchema],
    default: []
  },
  satisfaction: {
    type: [SatisfactionSchema],
    default: []
  },
  dailyStats: {
    type: [DailyStatsSchema],
    default: []
  },
  metadata: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    version: {
      type: String,
      default: '1.0.0'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total interaction count
AnalyticsSchema.virtual('totalInteractions').get(function() {
  return this.interactions.length;
});

// Virtual for average satisfaction
AnalyticsSchema.virtual('averageSatisfaction').get(function() {
  if (this.satisfaction.length === 0) return 0;
  const total = this.satisfaction.reduce((sum, s) => sum + s.rating, 0);
  return total / this.satisfaction.length;
});

// Indexes for performance
AnalyticsSchema.index({ 'interactions.timestamp': -1 });
AnalyticsSchema.index({ 'interactions.action': 1, 'interactions.timestamp': -1 });
AnalyticsSchema.index({ 'popularQueries.query': 1 });
AnalyticsSchema.index({ 'popularQueries.category': 1 });
AnalyticsSchema.index({ 'satisfaction.rating': 1 });
AnalyticsSchema.index({ 'satisfaction.category': 1 });
AnalyticsSchema.index({ 'dailyStats.date': -1 });
AnalyticsSchema.index({ createdAt: -1 });

// Static method to get interactions by date range
AnalyticsSchema.statics.getInteractionsByDateRange = function(startDate, endDate) {
  return this.find({
    'interactions.timestamp': {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Static method to get popular queries
AnalyticsSchema.statics.getPopularQueries = function(limit = 10) {
  return this.aggregate([
    { $unwind: '$popularQueries' },
    { $sort: { 'popularQueries.count': -1 } },
    { $limit: limit },
    { $group: { _id: null, queries: { $push: '$popularQueries' } } }
  ]);
};

// Static method to get satisfaction by category
AnalyticsSchema.statics.getSatisfactionByCategory = function(category) {
  return this.aggregate([
    { $unwind: '$satisfaction' },
    { $match: { 'satisfaction.category': category } },
    { $group: {
      _id: '$satisfaction.category',
      averageRating: { $avg: '$satisfaction.rating' },
      totalRatings: { $sum: 1 }
    }}
  ]);
};

// Instance method to add interaction
AnalyticsSchema.methods.addInteraction = function(interactionData) {
  this.interactions.push(interactionData);
  this.metadata.lastUpdated = new Date();
  return this.save();
};

// Instance method to update popular query
AnalyticsSchema.methods.updatePopularQuery = function(query, category = 'general') {
  const existingQuery = this.popularQueries.find(q => q.query === query);
  
  if (existingQuery) {
    existingQuery.count++;
    existingQuery.lastUsed = new Date();
  } else {
    this.popularQueries.push({
      query,
      category,
      count: 1,
      lastUsed: new Date()
    });
  }
  
  this.metadata.lastUpdated = new Date();
  return this.save();
};

// Instance method to add satisfaction rating
AnalyticsSchema.methods.addSatisfaction = function(satisfactionData) {
  this.satisfaction.push(satisfactionData);
  this.metadata.lastUpdated = new Date();
  return this.save();
};

const Analytics = mongoose.model('Analytics', AnalyticsSchema);

export default Analytics; 