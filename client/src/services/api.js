import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

// Chat API functions
export const sendMessage = async (message, sessionId = null) => {
  try {
    const response = await api.post('/chat/message', {
      message,
      sessionId,
      context: {
        currentPage: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

export const getConversationHistory = async (sessionId) => {
  try {
    const response = await api.get(`/chat/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Get conversation history error:', error);
    throw error;
  }
};

export const clearConversation = async (sessionId) => {
  try {
    const response = await api.delete(`/chat/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Clear conversation error:', error);
    throw error;
  }
};

export const getBotStatus = async () => {
  try {
    const response = await api.get('/chat/status');
    return response.data;
  } catch (error) {
    console.error('Get bot status error:', error);
    throw error;
  }
};

export const getSuggestions = async (message, context = {}) => {
  try {
    const response = await api.post('/chat/suggestions', {
      message,
      context
    });
    return response.data;
  } catch (error) {
    console.error('Get suggestions error:', error);
    throw error;
  }
};

// Health check
export const getHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

// Admin API functions (for future admin dashboard)
export const getAnalytics = async (timeRange = '24h') => {
  try {
    const response = await api.get(`/admin/analytics?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    console.error('Get analytics error:', error);
    throw error;
  }
};

export const getPersonality = async () => {
  try {
    const response = await api.get('/admin/personality');
    return response.data;
  } catch (error) {
    console.error('Get personality error:', error);
    throw error;
  }
};

export const updatePersonality = async (updates) => {
  try {
    const response = await api.put('/admin/personality', updates);
    return response.data;
  } catch (error) {
    console.error('Update personality error:', error);
    throw error;
  }
};

export const addQuirk = async (trigger, response) => {
  try {
    const apiResponse = await api.post('/admin/personality/quirks', {
      trigger,
      response
    });
    return apiResponse.data;
  } catch (error) {
    console.error('Add quirk error:', error);
    throw error;
  }
};

export const removeQuirk = async (trigger, response) => {
  try {
    const apiResponse = await api.delete('/admin/personality/quirks', {
      data: { trigger, response }
    });
    return apiResponse.data;
  } catch (error) {
    console.error('Remove quirk error:', error);
    throw error;
  }
};

export default api; 