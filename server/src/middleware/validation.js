import { body, param, query, validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Chat message validation
export const validateChatMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('sessionId')
    .optional()
    .isString()
    .withMessage('Session ID must be a string'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  validate
];

// Session ID validation
export const validateSessionId = [
  param('sessionId')
    .isString()
    .isLength({ min: 10, max: 100 })
    .withMessage('Invalid session ID format'),
  validate
];

// Personality update validation
export const validatePersonalityUpdate = [
  body('quirks')
    .optional()
    .isArray()
    .withMessage('Quirks must be an array'),
  body('quirks.*.trigger')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Quirk trigger must be between 1 and 200 characters'),
  body('quirks.*.response')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Quirk response must be between 1 and 500 characters'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object'),
  validate
];

// Analytics query validation
export const validateAnalyticsQuery = [
  query('timeRange')
    .optional()
    .isIn(['1h', '24h', '7d', '30d', 'all'])
    .withMessage('Time range must be one of: 1h, 24h, 7d, 30d, all'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  validate
];

// Quirk validation
export const validateQuirk = [
  body('trigger')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Trigger must be between 1 and 200 characters'),
  body('response')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Response must be between 1 and 500 characters'),
  validate
];

// Sanitize input
export const sanitizeInput = (req, res, next) => {
  // Sanitize message content
  if (req.body.message) {
    req.body.message = req.body.message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }
  
  // Sanitize other string fields
  const stringFields = ['trigger', 'response', 'sessionId'];
  stringFields.forEach(field => {
    if (req.body[field]) {
      req.body[field] = req.body[field].trim();
    }
  });
  
  next();
}; 