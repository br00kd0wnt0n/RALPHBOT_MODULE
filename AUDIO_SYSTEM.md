# RALPHBOT Audio System Documentation

## Overview

RALPHBOT features a comprehensive audio system designed to create an immersive, sci-fi droid experience. The system integrates Web Audio API, ElevenLabs text-to-speech, spatial audio, voice recognition, and a curated library of sci-fi sound effects.

## System Architecture

### Core Components

1. **Audio Service** (`client/src/services/audio.js`)
   - Web Audio API management
   - Sound effect playback
   - ElevenLabs TTS integration
   - Spatial audio processing
   - Volume and mute controls

2. **Voice Recognition Service** (`client/src/services/voiceRecognition.js`)
   - Web Speech API integration
   - Voice input processing
   - Speech synthesis
   - Microphone permission handling

3. **Audio Controls Component** (`client/src/components/AudioControls.jsx`)
   - Volume sliders for different audio types
   - Mute/unmute controls
   - Audio presets
   - Spatial audio toggle

4. **Sound Library** (`client/public/sounds/`)
   - Curated sci-fi/droid sound effects
   - Organized by category and use case
   - Optimized for web playback

## Features

### 🎵 Sound Effects

#### Categories
- **System Sounds**: startup, beep, boop, error, glitch
- **Mood Sounds**: excited, bored, thinking
- **Interaction Sounds**: typing, message, notification, click
- **Mechanical Sounds**: circuits, whirr, static, spark
- **Ambient Sounds**: ambient, hum
- **Voice Sounds**: voice, voice-start, voice-end

#### Audio Effects
- **Reverb**: Applied to system sounds for depth
- **Filters**: High-pass/low-pass for mood variations
- **Distortion**: Mechanical sound enhancement
- **Spatial Effects**: 3D positioning for ambient sounds

### 🎤 Text-to-Speech (ElevenLabs)

#### Features
- High-quality AI voice synthesis
- Mood-based voice modulation
- Queue system for sequential playback
- Voice effect processing (pitch shift, glitch effects)

#### Configuration
```javascript
{
  voice_id: '21m00Tcm4TlvDq8ikWAM', // Default voice
  stability: 0.5,                   // Voice stability
  similarity_boost: 0.75,           // Voice similarity
  style: 0.0,                       // Voice style
  use_speaker_boost: true           // Speaker enhancement
}
```

#### Mood-Based Voice Effects
- **Excited**: Higher pitch, slight distortion
- **Error**: Glitch effects, stuttering
- **Bored**: Lower pitch, low-pass filter
- **Normal**: Standard processing

### 🎧 Spatial Audio

#### Implementation
- HRTF (Head-Related Transfer Function) panning
- Distance-based attenuation
- 3D positioning for immersive experience
- Configurable spatial audio toggle

#### Positioning
```javascript
{
  position: { x: 0, y: 0, z: 1 },  // 3D coordinates
  distance: 1,                      // Distance from listener
  rolloff: 'inverse'               // Distance model
}
```

### 🎙️ Voice Recognition

#### Features
- Real-time speech-to-text
- Multiple language support
- Interim results for feedback
- Error handling and fallbacks

#### Supported Languages
- English (US/UK)
- Spanish, French, German
- Italian, Portuguese
- Japanese, Korean, Chinese

#### Usage
```javascript
// Start listening
startVoiceRecognition({
  language: 'en-US',
  continuous: false,
  interimResults: false
});

// Handle results
setVoiceResultHandler((transcript) => {
  console.log('Recognized:', transcript);
});
```

## Audio Controls

### Volume Management

#### Individual Controls
- **Master Volume**: Overall system volume
- **Sound Effects**: SFX volume level
- **Voice**: TTS and voice recognition volume
- **Ambient**: Background sounds volume

#### Presets
- **Home**: Balanced for home use
- **Gaming**: Enhanced for gaming experience
- **Quiet**: Reduced volumes for quiet environments

### Mute Functionality
- **Master Mute**: Mute all audio
- **Sound Effects Mute**: Disable SFX only
- **Voice Mute**: Disable TTS and voice input
- **Ambient Mute**: Disable background sounds

## Integration with ChatBot

### Automatic Sound Triggers

#### Text-Based Triggers
```javascript
// Trigger sounds based on message content
triggerSoundsFromText(message, mood);

// Examples:
"*beep*" → plays beep sound
"*circuits buzzing*" → plays circuits sound
"*static*" → plays static sound
```

#### Mood-Based Triggers
- **Excited**: Spark effects, high-energy sounds
- **Error**: Glitch effects, error alerts
- **Bored**: Hum sounds, fidgeting effects
- **Normal**: Standard interaction sounds

### Voice Integration

#### TTS Queue System
```javascript
// Queue voice for sequential playback
queueVoice(text, {
  mood: 'excited',
  stability: 0.3,
  similarityBoost: 0.75,
  style: 0.2
});
```

#### Voice Recognition Integration
- Automatic microphone permission request
- Visual feedback during listening
- Error handling and user feedback
- Integration with chat input

## Technical Implementation

### Web Audio API Usage

#### Audio Context Management
```javascript
// Initialize audio context
this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create gain nodes for different audio types
this.masterGain = this.audioContext.createGain();
this.soundEffectsGain = this.audioContext.createGain();
this.voiceGain = this.audioContext.createGain();
this.ambientGain = this.audioContext.createGain();
```

#### Audio Effects Processing
```javascript
// Add reverb effect
addReverb(gainNode, decay, wetLevel);

// Add filter effect
addFilter(gainNode, type); // 'highpass' or 'lowpass'

// Add distortion effect
addDistortion(gainNode, amount);

// Add spatial effects
addSpatialEffects(gainNode, options);
```

### Performance Optimizations

#### Audio Loading
- Preload frequently used sounds
- Lazy loading for ambient sounds
- Audio buffer caching
- Compression optimization

#### Memory Management
- Audio buffer cleanup
- Context suspension when not in use
- Efficient gain node routing
- Minimal audio processing overhead

## Configuration

### Environment Variables
```bash
# ElevenLabs Configuration
REACT_APP_ELEVENLABS_API_KEY=your_api_key_here
REACT_APP_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Audio Settings
REACT_APP_AUDIO_ENABLED=true
REACT_APP_SPATIAL_AUDIO_ENABLED=true
REACT_APP_VOICE_RECOGNITION_ENABLED=true
```

### Default Settings
```javascript
{
  masterVolume: 0.7,
  soundEffectsVolume: 0.5,
  voiceVolume: 0.8,
  ambientVolume: 0.3,
  spatialAudio: true,
  voiceEnabled: true,
  soundEffectsEnabled: true,
  ambientEnabled: true
}
```

## Accessibility Features

### Audio Alternatives
- Visual indicators for audio states
- Text alternatives for sound effects
- Screen reader compatibility
- Keyboard navigation support

### User Preferences
- Respects system audio preferences
- Supports reduced motion preferences
- High contrast mode compatibility
- Volume normalization

### Error Handling
- Graceful fallbacks for unsupported features
- Clear error messages
- Alternative input methods
- Offline functionality

## Browser Compatibility

### Supported Browsers
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (with limitations)
- **Edge**: Full support

### Feature Detection
```javascript
// Check Web Audio API support
const audioSupported = 'AudioContext' in window || 'webkitAudioContext' in window;

// Check Speech Recognition support
const speechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

// Check Speech Synthesis support
const synthesisSupported = 'speechSynthesis' in window;
```

## Troubleshooting

### Common Issues

#### Audio Not Playing
1. Check browser permissions
2. Verify audio context state
3. Check volume settings
4. Test with different audio files

#### Voice Recognition Issues
1. Verify microphone permissions
2. Check browser support
3. Test with different languages
4. Review console errors

#### TTS Problems
1. Verify ElevenLabs API key
2. Check network connectivity
3. Test with different voices
4. Review API rate limits

### Debug Tools
```javascript
// Enable audio debugging
localStorage.setItem('audioDebug', 'true');

// Check audio context state
console.log('Audio Context State:', audioContext.state);

// Monitor audio events
audioContext.addEventListener('statechange', (e) => {
  console.log('Audio Context State Changed:', e.target.state);
});
```

## Future Enhancements

### Planned Features
- **Audio Synthesis**: Procedurally generated sounds
- **Adaptive Volume**: Environment-based volume adjustment
- **Audio Analytics**: Usage tracking and optimization
- **Custom Sound Packs**: User-uploadable sound effects

### Advanced Audio
- **3D Audio**: Full spatial audio implementation
- **Audio Streaming**: Real-time audio processing
- **Voice Cloning**: Custom voice training
- **Audio AI**: Intelligent sound selection

## API Reference

### Audio Service Functions
```javascript
// Sound effects
playSound(soundName, options)
playAmbient(soundName, options)
triggerSoundsFromText(text, mood)

// Text-to-speech
speakText(text, options)
queueVoice(text, options)
stopVoice()

// Volume controls
setMasterVolume(volume)
setSoundEffectsVolume(volume)
setVoiceVolume(volume)
setAmbientVolume(volume)

// Mute controls
mute() / unmute()
muteSoundEffects() / unmuteSoundEffects()
muteVoice() / unmuteVoice()

// Settings
getAudioSettings()
updateAudioSettings(settings)
```

### Voice Recognition Functions
```javascript
// Voice input
startVoiceRecognition(options)
stopVoiceRecognition()
isListening()
isVoiceSupported()

// Speech synthesis
speakText(text, options)
stopSpeaking()
isSpeaking()

// Utilities
getVoices()
requestMicrophonePermission()
getSupportedLanguages()
```

## Best Practices

### Audio Design
- Keep sound effects short and impactful
- Use consistent audio language
- Provide visual feedback for audio states
- Respect user audio preferences

### Performance
- Optimize audio file sizes
- Use appropriate audio formats
- Implement efficient loading strategies
- Monitor memory usage

### User Experience
- Provide clear audio controls
- Offer audio alternatives
- Handle errors gracefully
- Support accessibility standards

---

*This audio system creates an immersive, engaging experience that brings RALPHBOT to life with authentic sci-fi droid personality and professional audio quality.* 