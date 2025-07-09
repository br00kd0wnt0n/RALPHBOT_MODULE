// Environment Configuration Example
// Copy this file to .env and fill in your actual API keys

export const ENV_CONFIG = {
  // Server Configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // MongoDB Configuration (optional for development)
  MONGODB_URI: process.env.MONGODB_URI || null,

  // Claude AI Configuration
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || 'your_claude_api_key_here',
  CLAUDE_MODEL: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',

  // ElevenLabs Text-to-Speech (optional)
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || 'your_elevenlabs_api_key_here',

  // JWT Secret for Admin Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_here',

  // Admin Credentials (for development)
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',

  // Rate Limiting
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 900000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log'
};

// Validation function
export const validateConfig = () => {
  const required = ['CLAUDE_API_KEY'];
  const missing = required.filter(key => !ENV_CONFIG[key] || ENV_CONFIG[key].includes('your_'));
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing required environment variables: ${missing.join(', ')}`);
    console.warn('RALPHBOT will run in limited mode without AI features');
    return false;
  }
  
  return true;
}; 