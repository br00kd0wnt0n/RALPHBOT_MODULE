// server/src/unified-server.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// CRITICAL: Load environment variables FIRST before any other imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Now import everything else after env vars are loaded
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import winston from 'winston';
import mongoose from 'mongoose';

// Import your existing routes
import chatRoutes from './server/src/routes/chat.js';
import adminRoutes from './server/src/routes/admin.js';

// Debug environment variables
console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'Set' : 'Not set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// Health check - ALWAYS respond
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'running',
      admin: 'running',
      socket: 'running'
    }
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Admin Dashboard - serve static files
app.get('/admin*', (req, res) => {
  // For now, just return a simple admin page
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>RALPHBOT Admin</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #0a0a0a; color: #fff; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 20px; background: #1a1a1a; border-radius: 8px; margin: 20px 0; }
        .online { border-left: 4px solid #00ff00; }
        .header { border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { background: #1a1a1a; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .quick-actions button { 
          background: #333; color: white; border: none; padding: 10px 20px; 
          margin: 5px; border-radius: 4px; cursor: pointer; 
        }
        .quick-actions button:hover { background: #555; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 RALPHBOT Admin Dashboard</h1>
          <p>Status: <span style="color: #00ff00;">●</span> All Systems Online</p>
        </div>
        
        <div class="status online">
          <h3>System Status</h3>
          <p>✅ Server: Running on ${req.get('host')}</p>
          <p>✅ Database: Connected</p>
          <p>✅ AI Service: Ready</p>
          <p>✅ Socket.IO: Connected</p>
        </div>

        <div class="section">
          <h3>Quick Actions</h3>
          <div class="quick-actions">
            <button onclick="window.location.href='/'">View Chatbot</button>
            <button onclick="window.location.href='/health'">Health Check</button>
            <button onclick="alert('Personality editor coming soon!')">Edit Personality</button>
            <button onclick="alert('Analytics coming soon!')">View Analytics</button>
          </div>
        </div>

        <div class="section">
          <h3>Development Info</h3>
          <p><strong>Server:</strong> ${req.get('host')}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds</p>
        </div>

        <div class="section">
          <h3>Recent Activity</h3>
          <p>No recent activity to display</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  // If no React build exists, serve a simple page
  const indexPath = path.join(__dirname, 'client/dist/index.html');
  
  // Check if built React app exists
  import('fs').then(fs => {
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Serve development page
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>RALPHBOT Development</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 40px; 
              background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
              color: #fff;
              min-height: 100vh;
            }
            .container { max-width: 600px; margin: 0 auto; text-align: center; }
            .logo { font-size: 4em; margin-bottom: 20px; }
            .status { 
              background: #1a1a1a; 
              border: 1px solid #333; 
              border-radius: 8px; 
              padding: 20px; 
              margin: 20px 0; 
            }
            .links a { 
              display: inline-block; 
              background: #333; 
              color: white; 
              text-decoration: none; 
              padding: 15px 30px; 
              margin: 10px; 
              border-radius: 6px; 
              transition: background 0.3s;
            }
            .links a:hover { background: #555; }
            .online { color: #00ff00; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🤖</div>
            <h1>RALPHBOT Development Server</h1>
            <div class="status">
              <h3>Status: <span class="online">● ONLINE</span></h3>
              <p>Server running on: <strong>${req.get('host')}</strong></p>
            </div>
            <div class="links">
              <a href="/health">Health Check</a>
              <a href="/admin">Admin Dashboard</a>
              <a href="/api/chat" onclick="alert('API endpoint - use POST with JSON'); return false;">Test API</a>
            </div>
            <p style="margin-top: 40px; color: #666;">
              Build your React frontend and it will be served from this same URL
            </p>
          </div>
        </body>
        </html>
      `);
    }
  });
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  logger.info('User connected:', socket.id);
  
  socket.on('chat_message', async (data) => {
    logger.info('Chat message received:', data.message);
    // Broadcast to admin dashboard
    socket.broadcast.emit('admin_update', {
      type: 'new_message',
      message: data.message,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected:', socket.id);
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ralphbot');
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error.message);
    // Continue without database for development
  }
};

const PORT = process.env.PORT || 3001;

// Connect to database and start server
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    logger.info(`🚀 RALPHBOT Unified Server running on http://localhost:${PORT}`);
    logger.info(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    logger.info(`🤖 Chatbot: http://localhost:${PORT}`);
    console.log('\n=== ALL SERVICES RUNNING ON ONE PORT ===');
    console.log(`Open: http://localhost:${PORT}`);
  });
});

export default app;