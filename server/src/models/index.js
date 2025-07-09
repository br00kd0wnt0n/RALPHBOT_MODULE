// Export all models for easy importing
export { default as Conversation } from './Conversation.js';
export { default as Personality } from './Personality.js';
export { default as Analytics } from './Analytics.js';
export { default as AdminUser } from './AdminUser.js';

// Re-export for backward compatibility
export default {
  Conversation: (await import('./Conversation.js')).default,
  Personality: (await import('./Personality.js')).default,
  Analytics: (await import('./Analytics.js')).default,
  AdminUser: (await import('./AdminUser.js')).default
}; 