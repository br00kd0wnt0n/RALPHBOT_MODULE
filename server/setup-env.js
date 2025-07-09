import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envTemplate = `# RALPHBOT Environment Configuration
# Fill in your actual API keys below

# Server Configuration
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB Configuration (optional for development)
# MONGODB_URI=mongodb://localhost:27017/ralphbot

# Claude AI Configuration (REQUIRED for AI features)
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_MODEL=claude-3-sonnet-20240229

# ElevenLabs Text-to-Speech (optional - for voice features)
# ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# JWT Secret for Admin Authentication
JWT_SECRET=your_jwt_secret_here

# Admin Credentials (for development)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
`;

const envPath = path.join(__dirname, '.env');

console.log('🚀 RALPHBOT Environment Setup');
console.log('=============================\n');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('Current .env file will be backed up to .env.backup');
  fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
}

fs.writeFileSync(envPath, envTemplate);

console.log('✅ Created .env file successfully!');
console.log('\n📝 Next steps:');
console.log('1. Edit the .env file in the server directory');
console.log('2. Replace "your_claude_api_key_here" with your actual Claude API key');
console.log('3. (Optional) Add your ElevenLabs API key for voice features');
console.log('4. (Optional) Add MongoDB URI if you want database features');
console.log('\n🔑 Where to get API keys:');
console.log('- Claude API: https://console.anthropic.com/');
console.log('- ElevenLabs: https://elevenlabs.io/ (optional)');
console.log('\n💡 For development, you can run without MongoDB and ElevenLabs');
console.log('   Only Claude API key is required for AI chat features'); 