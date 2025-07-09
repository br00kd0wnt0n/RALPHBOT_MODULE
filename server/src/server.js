import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import winston from 'winston';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import routes
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';

// Import services
import { initializePersonality } from './services/personality.js';
import { logInteraction } from './services/analytics.js';

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ralphbot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch((error) => {
  logger.error('MongoDB connection error:', error);
});

// Initialize personality system
initializePersonality();

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'RALPHBOT Server'
  });
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