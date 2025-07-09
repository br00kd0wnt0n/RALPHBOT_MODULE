# RALPHBOT 🚀

A quirky space-themed chatbot for RALPH creative agency, built with React, Express, and Claude AI.

## Features

- 🤖 **Quirky Personality**: Star Wars droid-like character with space-themed responses
- 🎨 **Space-Themed UI**: Beautiful cosmic design with animations and effects
- 🔊 **Audio Effects**: Web Audio API powered sound effects
- 📊 **Analytics**: Track conversations and user interactions
- 🔧 **Admin Dashboard**: Manage bot personality and view analytics
- ⚡ **Real-time**: Socket.io for live updates
- 📱 **Responsive**: Works on all devices
- 🎭 **Mood System**: Bot responds with different moods (excited, error, bored, normal)

## Tech Stack

### Frontend
- **React 18** with Vite
- **Framer Motion** for animations
- **Socket.io Client** for real-time features
- **Web Audio API** for sound effects
- **Space-themed CSS** with custom animations

### Backend
- **Express.js** server
- **Socket.io** for real-time communication
- **MongoDB** with Mongoose for data storage
- **Claude AI** for intelligent responses
- **Winston** for logging
- **Helmet** for security

## Project Structure

```
ralphbot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API and audio services
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS files
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # MongoDB schemas
│   │   └── middleware/     # Express middleware
│   └── config/             # Configuration files
├── admin/                  # Admin dashboard (future)
└── shared/                 # Shared utilities
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB
- Claude API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ralphbot
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Admin Dashboard: http://localhost:3002 (future)

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ralphbot

# Claude AI Configuration
CLAUDE_API_KEY=your_claude_api_key_here

# Client Configuration
CLIENT_URL=http://localhost:3000

# Admin Configuration
ADMIN_SECRET=your_admin_secret_here

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=logs/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your_session_secret_here

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=30

# Personality Settings
DEFAULT_CHATTINESS=7
DEFAULT_QUIRK_FREQUENCY=5
SELF_PROMPT_ENABLED=true

# Audio Settings
AUDIO_ENABLED=true
AUDIO_VOLUME=0.3

# Development Settings
DEBUG_MODE=true
HOT_RELOAD=true
```

## API Endpoints

### Chat Endpoints
- `POST /api/chat/message` - Send message to bot
- `GET /api/chat/history/:sessionId` - Get conversation history
- `DELETE /api/chat/history/:sessionId` - Clear conversation
- `GET /api/chat/status` - Get bot status
- `POST /api/chat/suggestions` - Get context-aware suggestions

### Admin Endpoints
- `GET /api/admin/personality` - Get personality configuration
- `PUT /api/admin/personality` - Update personality
- `POST /api/admin/personality/quirks` - Add new quirk
- `DELETE /api/admin/personality/quirks` - Remove quirk
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/sessions` - Get active sessions
- `GET /api/admin/health` - System health check

## Bot Personality

RALPHBOT has a unique personality inspired by Star Wars droids:

### Core Traits
- **Enthusiastic** about creative work and bringing people together
- **Slightly rough around the edges** but charming
- **Occasionally glitchy** in an endearing way
- **Space-themed** language and references
- **RALPH-focused** knowledge and expertise

### Moods
- **Normal**: Standard helpful responses
- **Excited**: Enthusiastic about interesting topics
- **Error**: Apologetic when things go wrong
- **Bored**: Self-prompting when conversation lags

### Sound Effects
- `*beep boop*` - Standard bot sounds
- `*circuits buzzing*` - Excitement
- `*bzzt*` - Errors or glitches
- `*static crackle*` - System issues
- `*whirrs*` - Processing

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start all services
npm run client:dev       # Start frontend only
npm run server:dev       # Start backend only

# Building
npm run build            # Build all services
npm run client:build     # Build frontend
npm run server:build     # Build backend

# Production
npm start                # Start production server
npm run deploy           # Prepare for deployment
```

### Code Style

- **Frontend**: React functional components with hooks
- **Backend**: ES6 modules with async/await
- **Styling**: CSS modules with space theme
- **Animations**: Framer Motion for smooth transitions

### Testing

```bash
# Run tests (when implemented)
npm test
npm run test:client
npm run test:server
```

## Deployment

### Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to:
- **Vercel** (Frontend)
- **Railway** (Backend)
- **Heroku** (Full stack)
- **DigitalOcean** (VPS)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email [support@ralph.com](mailto:support@ralph.com) or create an issue in this repository.

---

**Built with ❤️ by the RALPH team**

*"Making entertainment that brings people together and celebrates what makes life feel good."* 