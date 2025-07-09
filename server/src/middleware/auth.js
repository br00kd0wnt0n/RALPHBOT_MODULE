// Authentication middleware for RALPHBOT API

// Simple API key authentication
export const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide a valid API key in the x-api-key header'
    });
  }
  
  // Check against environment variable
  const validApiKey = process.env.API_KEY || 'ralphbot-dev-key-2024';
  
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }
  
  next();
};

// Admin authentication (more restrictive)
export const authenticateAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!adminKey) {
    return res.status(401).json({
      error: 'Admin key required',
      message: 'Please provide a valid admin key in the x-admin-key header'
    });
  }
  
  // Check against environment variable
  const validAdminKey = process.env.ADMIN_KEY || 'ralphbot-admin-key-2024';
  
  if (adminKey !== validAdminKey) {
    return res.status(403).json({
      error: 'Invalid admin key',
      message: 'The provided admin key is not valid'
    });
  }
  
  // Add admin role to request
  req.user = { role: 'admin' };
  next();
};

// Rate limiting for different endpoints
export const createRateLimiter = (windowMs, max, message) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    // Simple in-memory rate limiting (in production, use Redis)
    if (!req.app.locals.rateLimit) {
      req.app.locals.rateLimit = new Map();
    }
    
    const userLimits = req.app.locals.rateLimit.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (now > userLimits.resetTime) {
      userLimits.count = 0;
      userLimits.resetTime = now + windowMs;
    }
    
    if (userLimits.count >= max) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: message || 'Too many requests, please try again later',
        retryAfter: Math.ceil((userLimits.resetTime - now) / 1000)
      });
    }
    
    userLimits.count++;
    req.app.locals.rateLimit.set(key, userLimits);
    next();
  };
};

// Specific rate limiters
export const chatRateLimit = createRateLimiter(
  60 * 1000, // 1 minute
  10, // 10 requests per minute
  'Too many chat messages, please slow down'
);

export const adminRateLimit = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  50, // 50 requests per 5 minutes
  'Too many admin requests, please try again later'
);

// Request size limits
export const limitRequestSize = (maxSize) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'], 10);
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        message: `Request size exceeds ${maxSize} bytes`
      });
    }
    
    next();
  };
};

// Log authentication attempts
export const logAuthAttempt = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn(`Authentication failed for IP: ${req.ip}, Path: ${req.path}, Status: ${res.statusCode}`);
    }
    originalSend.call(this, data);
  };
  
  next();
}; 