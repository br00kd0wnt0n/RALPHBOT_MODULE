# API Keys Setup Guide

## Required API Keys

To use RALPHBOT's full functionality, you need to add your API keys to the `.env` file.

### 1. Anthropic Claude API Key

**Get your key from:** https://console.anthropic.com/

**Replace in `.env`:**
```env
ANTHROPIC_API_KEY=your_actual_claude_api_key_here
VITE_ANTHROPIC_API_KEY=your_actual_claude_api_key_here
```

### 2. ElevenLabs API Key (Optional - for voice features)

**Get your key from:** https://elevenlabs.io/

**Replace in `.env`:**
```env
ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key_here
VITE_ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key_here
```

## Current .env Configuration

Your `.env` file should look like this (replace the placeholder values):

```env
NODE_ENV=development
PORT=3001
ADMIN_PASSWORD=ralphbot_admin_2024
JWT_SECRET=dev_secret_change_me_in_production
MONGODB_URI=mongodb://localhost:27017/ralphbot
DEBUG=ralphbot:*

# AI Service Keys
ANTHROPIC_API_KEY=sk-ant-api03-...your-actual-key...
ELEVENLABS_API_KEY=sk-...your-actual-key...

# Optional: ElevenLabs Voice Settings
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_MODEL_ID=eleven_monolingual_v1

# Client-side environment variables (Vite)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...your-actual-key...
VITE_ELEVENLABS_API_KEY=sk-...your-actual-key...
VITE_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
VITE_ELEVENLABS_MODEL_ID=eleven_monolingual_v1
```

## Features Available

### With Claude API Key:
- ✅ Full chatbot conversations
- ✅ AI-powered responses
- ✅ Personality and mood detection
- ✅ Context-aware conversations

### With ElevenLabs API Key:
- ✅ Text-to-speech voice responses
- ✅ Voice customization
- ✅ Audio feedback

### Without API Keys:
- ✅ Basic server functionality
- ✅ Development interface
- ✅ Admin dashboard
- ❌ No AI conversations
- ❌ No voice features

## Restart Required

After updating the `.env` file, restart the server:

```bash
npm run dev
```

## Testing

1. **Health Check:** http://localhost:3001/health
2. **Chat Interface:** http://localhost:3001/
3. **Admin Dashboard:** http://localhost:3001/admin 