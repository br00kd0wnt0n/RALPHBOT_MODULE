import mongoose from 'mongoose';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// MongoDB Schema for conversation analytics
const ConversationSchema = new mongoose.Schema({
  userId: String,
  sessionId: String,
  messages: [{
    text: String,
    sender: String, // 'user' or 'bot'
    timestamp: { type: Date, default: Date.now },
    mood: String,
    confidence: Number
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    currentPage: String
  },
  analytics: {
    totalMessages: { type: Number, default: 0 },
    userMessages: { type: Number, default: 0 },
    botMessages: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 },
    topics: [String],
    sentiment: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

// MongoDB Schema for interaction logs
const InteractionSchema = new mongoose.Schema({
  userId: String,
  sessionId: String,
  action: String, // 'message_sent', 'message_received', 'button_click', etc.
  data: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
  metadata: {
    userAgent: String,
    ipAddress: String,
    currentPage: String
  }
});

const Interaction = mongoose.model('Interaction', InteractionSchema);

class AnalyticsService {
  constructor() {
    this.activeSessions = new Map();
  }

  async logInteraction(message, sender, sessionId, metadata = {}) {
    try {
      const interaction = new Interaction({
        userId: sessionId,
        sessionId,
        action: 'message_sent',
        data: { message, sender },
        metadata
      });

      await interaction.save();
      logger.info(`Logged interaction for session ${sessionId}`);
      
      return interaction;
    } catch (error) {
      logger.error('Error logging interaction:', error);
      throw error;
    }
  }

  async logConversation(sessionId, message, sender, mood = 'normal', confidence = 0.8) {
    try {
      let conversation = await Conversation.findOne({ sessionId });
      
      if (!conversation) {
        conversation = new Conversation({
          userId: sessionId,
          sessionId,
          messages: [],
          analytics: {
            totalMessages: 0,
            userMessages: 0,
            botMessages: 0,
            averageResponseTime: 0,
            sessionDuration: 0,
            topics: [],
            sentiment: { positive: 0, neutral: 0, negative: 0 }
          }
        });
      }

      // Add message
      conversation.messages.push({
        text: message,
        sender,
        timestamp: new Date(),
        mood,
        confidence
      });

      // Update analytics
      conversation.analytics.totalMessages++;
      if (sender === 'user') {
        conversation.analytics.userMessages++;
      } else {
        conversation.analytics.botMessages++;
      }

      // Update sentiment based on mood
      if (mood === 'excited' || mood === 'positive') {
        conversation.analytics.sentiment.positive++;
      } else if (mood === 'error' || mood === 'negative') {
        conversation.analytics.sentiment.negative++;
      } else {
        conversation.analytics.sentiment.neutral++;
      }

      // Extract topics from message
      const topics = this.extractTopics(message);
      topics.forEach(topic => {
        if (!conversation.analytics.topics.includes(topic)) {
          conversation.analytics.topics.push(topic);
        }
      });

      conversation.updatedAt = new Date();
      await conversation.save();

      logger.info(`Updated conversation for session ${sessionId}`);
      return conversation;

    } catch (error) {
      logger.error('Error logging conversation:', error);
      throw error;
    }
  }

  extractTopics(message) {
    const topics = [];
    const lowerMessage = message.toLowerCase();

    // Topic keywords
    const topicKeywords = {
      'work': ['work', 'project', 'case study', 'portfolio', 'creative'],
      'magazine': ['magazine', 'print', 'issue', 'article'],
      'events': ['event', 'launch', 'screening', 'pop-up', 'q&a'],
      'shop': ['shop', 'merch', 'buy', 'purchase'],
      'friends': ['collaboration', 'partner', 'friend', 'team']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  async getAnalytics(timeRange = '24h') {
    try {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const conversations = await Conversation.find({
        createdAt: { $gte: startDate }
      });

      const interactions = await Interaction.find({
        timestamp: { $gte: startDate }
      });

      // Calculate analytics
      const analytics = {
        totalConversations: conversations.length,
        totalInteractions: interactions.length,
        averageMessagesPerConversation: 0,
        topTopics: [],
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        activeSessions: this.activeSessions.size,
        timeRange
      };

      if (conversations.length > 0) {
        const totalMessages = conversations.reduce((sum, conv) => sum + conv.analytics.totalMessages, 0);
        analytics.averageMessagesPerConversation = totalMessages / conversations.length;

        // Aggregate sentiment
        conversations.forEach(conv => {
          analytics.sentimentBreakdown.positive += conv.analytics.sentiment.positive;
          analytics.sentimentBreakdown.neutral += conv.analytics.sentiment.neutral;
          analytics.sentimentBreakdown.negative += conv.analytics.sentiment.negative;
        });

        // Get top topics
        const topicCounts = {};
        conversations.forEach(conv => {
          conv.analytics.topics.forEach(topic => {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
          });
        });

        analytics.topTopics = Object.entries(topicCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([topic, count]) => ({ topic, count }));
      }

      return analytics;

    } catch (error) {
      logger.error('Error getting analytics:', error);
      throw error;
    }
  }

  async getConversationHistory(sessionId) {
    try {
      const conversation = await Conversation.findOne({ sessionId });
      return conversation || null;
    } catch (error) {
      logger.error('Error getting conversation history:', error);
      throw error;
    }
  }

  trackSession(sessionId, metadata = {}) {
    this.activeSessions.set(sessionId, {
      startTime: new Date(),
      metadata
    });
  }

  endSession(sessionId) {
    this.activeSessions.delete(sessionId);
  }

  getActiveSessions() {
    return Array.from(this.activeSessions.entries()).map(([sessionId, data]) => ({
      sessionId,
      startTime: data.startTime,
      duration: Date.now() - data.startTime.getTime(),
      metadata: data.metadata
    }));
  }
}

const analyticsService = new AnalyticsService();

export const logInteraction = async (message, sender, sessionId, metadata = {}) => {
  return await analyticsService.logInteraction(message, sender, sessionId, metadata);
};

export const logConversation = async (sessionId, message, sender, mood = 'normal', confidence = 0.8) => {
  return await analyticsService.logConversation(sessionId, message, sender, mood, confidence);
};

export const getAnalytics = async (timeRange = '24h') => {
  return await analyticsService.getAnalytics(timeRange);
};

export const getConversationHistory = async (sessionId) => {
  return await analyticsService.getConversationHistory(sessionId);
};

export const trackSession = (sessionId, metadata = {}) => {
  analyticsService.trackSession(sessionId, metadata);
};

export const endSession = (sessionId) => {
  analyticsService.endSession(sessionId);
};

export const getActiveSessions = () => {
  return analyticsService.getActiveSessions();
};

export default analyticsService; 