#!/bin/bash

# RALPHBOT Emergency Setup Script
# Run this ONE command and everything will work

echo "🚀 RALPHBOT Emergency Setup Starting..."

# Create directory structure
mkdir -p server/src/routes
mkdir -p client/src

# Create the unified server file
cat > server/src/unified-server.js << 'EOF'
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" }});

app.use(cors());
app.use(express.json());

// HEALTH CHECK - ALWAYS WORKS
app.get('/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// CHAT API - MOCK RESPONSES
app.post('/api/chat/message', (req, res) => {
  const responses = [
    "*beep boop* Hey there! I'm RALPHBOT! 🚀",
    "*circuits buzzing* That's interesting! Tell me more!",
    "*whirrs* We make amazing entertainment at RALPH!",
    "*static crackle* Want to hear about our events?"
  ];
  setTimeout(() => {
    res.json({
      response: responses[Math.floor(Math.random() * responses.length)],
      mood: 'normal',
      confidence: 0.9
    });
  }, 1000);
});

// ADMIN DASHBOARD
app.get('/admin*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>RALPHBOT Admin</title>
    <style>body{font-family:Arial;margin:40px;background:#0a0a0a;color:#fff}</style></head>
    <body>
      <h1>🤖 RALPHBOT Admin Dashboard</h1>
      <p>✅ Server: Running on ${req.get('host')}</p>
      <p>✅ Health: <a href="/health" style="color:#0f0">/health</a></p>
      <p>✅ API: <a href="/api/chat" style="color:#0f0">/api/chat</a></p>
      <p>🚀 <a href="/" style="color:#0ff">Back to Chatbot</a></p>
    </body>
    </html>
  `);
});

// MAIN PAGE
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>RALPHBOT</title>
    <style>
      body{font-family:Arial;margin:0;padding:40px;background:linear-gradient(135deg,#0a0a0a,#1a1a1a);color:#fff;min-height:100vh}
      .container{max-width:600px;margin:0 auto;text-align:center}
      .chat{background:#1a1a1a;border-radius:8px;padding:20px;margin:20px 0}
      input{width:70%;padding:10px;margin:10px;border:none;border-radius:4px}
      button{padding:10px 20px;margin:5px;border:none;border-radius:4px;background:#333;color:#fff;cursor:pointer}
      button:hover{background:#555}
      #messages{text-align:left;max-height:300px;overflow-y:auto;margin:20px 0}
      .message{margin:10px 0;padding:10px;border-radius:6px}
      .user{background:#333;text-align:right}
      .bot{background:#1a4a1a}
    </style></head>
    <body>
      <div class="container">
        <h1>🤖 RALPHBOT</h1>
        <p>Status: <span style="color:#0f0">● ONLINE</span></p>
        <div class="chat">
          <div id="messages"></div>
          <input type="text" id="messageInput" placeholder="Ask me about RALPH..." onkeypress="if(event.key==='Enter')sendMessage()">
          <button onclick="sendMessage()">Send 🚀</button>
        </div>
        <p><a href="/admin" style="color:#0ff">Admin Dashboard</a> | <a href="/health" style="color:#0ff">Health Check</a></p>
      </div>
      <script>
        const messages = document.getElementById('messages');
        const input = document.getElementById('messageInput');
        
        function addMessage(text, sender) {
          const div = document.createElement('div');
          div.className = 'message ' + sender;
          div.textContent = text;
          messages.appendChild(div);
          messages.scrollTop = messages.scrollHeight;
        }
        
        async function sendMessage() {
          const text = input.value.trim();
          if (!text) return;
          
          addMessage(text, 'user');
          input.value = '';
          
          try {
            const response = await fetch('/api/chat/message', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({message: text})
            });
            const data = await response.json();
            addMessage(data.response, 'bot');
          } catch (error) {
            addMessage('*bzzt* Connection error!', 'bot');
          }
        }
        
        // Welcome message
        addMessage('*beep boop* Hey there! I\\'m RALPHBOT, ready to help! 🚀', 'bot');
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 RALPHBOT UNIFIED SERVER RUNNING`);
  console.log(`📱 Chatbot: http://localhost:${PORT}`);
  console.log(`📊 Admin: http://localhost:${PORT}/admin`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});
EOF

# Create package.json
cat > server/package.json << 'EOF'
{
  "name": "ralphbot-unified",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/unified-server.js",
    "dev": "node src/unified-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "socket.io": "^4.7.2"
  }
}
EOF

# Install dependencies and start
cd server
npm install

echo ""
echo "🎉 SETUP COMPLETE!"
echo ""
echo "🚀 Starting RALPHBOT..."
echo "📱 Open: http://localhost:3001"
echo "📊 Admin: http://localhost:3001/admin"
echo "🏥 Health: http://localhost:3001/health"
echo ""

npm start