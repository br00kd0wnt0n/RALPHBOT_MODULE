import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import winston from 'winston';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { existsSync } from 'fs';

// Import routes
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';

// Import services
import { initializePersonality } from './services/personality.js';
import { logInteraction } from './services/analytics.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (optional for development)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    logger.warn('Continuing without MongoDB - some features may be limited');
  });
} else {
  logger.warn('No MongoDB URI provided - running in development mode without database');
}

// Initialize personality system
initializePersonality();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'RALPHBOT Server'
  });
});

// API health check (for frontend proxy)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'RALPHBOT Server'
  });
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Serve admin dashboard static files (only if they exist)
const adminPath = path.join(process.cwd(), 'public', 'admin');
const adminIndexPath = path.join(adminPath, 'index.html');

// Check if admin files exist before serving
if (existsSync(adminIndexPath)) {
  app.use('/admin', express.static(adminPath));
  app.get('/admin/*', (req, res) => {
    res.sendFile(adminIndexPath);
  });
} else {
  // Admin dashboard not built yet - serve a placeholder
  app.get('/admin', (req, res) => {
    res.json({
      message: 'Admin dashboard not built yet',
      instructions: 'Run "npm run admin:build" to build the admin dashboard'
    });
  });
  app.get('/admin/*', (req, res) => {
    res.json({
      message: 'Admin dashboard not built yet',
      instructions: 'Run "npm run admin:build" to build the admin dashboard'
    });
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler - handle API routes and non-API routes separately
app.use('*', (req, res) => {
  // For API routes, return JSON 404
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({
      error: 'API route not found',
      message: `The API route ${req.originalUrl} does not exist`
    });
  } else {
    // For non-API routes, return a simple 404 page
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>404 - Page Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <p><a href="/admin">Go to Admin Dashboard</a> | <a href="/health">Health Check</a></p>
        </body>
      </html>
    `);
  }
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  logger.info('User connected:', socket.id);
  
  socket.on('chat_message', async (data) => {
    try {
      // Log the interaction
      await logInteraction(data.message, 'user', socket.id);
      
      // Emit to admin dashboard for real-time monitoring
      socket.broadcast.emit('admin_update', {
        type: 'new_message',
        message: data.message,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('Socket message error:', error);
    }
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🚀 RALPHBOT Server is running on port ${PORT}`);
  logger.info(`Dashboard available at http://localhost:${PORT}/admin`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app; 