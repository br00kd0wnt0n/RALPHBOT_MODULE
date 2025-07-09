// RALPHBOT Audio Service
// Comprehensive audio system with Web Audio API, ElevenLabs TTS, and spatial audio

class AudioService {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.soundEffectsGain = null;
    this.voiceGain = null;
    this.ambientGain = null;
    
    this.soundEffects = new Map();
    this.voiceQueue = [];
    this.isPlayingVoice = false;
    this.currentVoiceSource = null;
    
    this.settings = {
      masterVolume: 0.7,
      soundEffectsVolume: 0.5,
      voiceVolume: 0.8,
      ambientVolume: 0.3,
      spatialAudio: true,
      voiceEnabled: true,
      soundEffectsEnabled: true,
      ambientEnabled: true
    };
    
    this.elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    this.voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default voice
    
    this.init();
  }

  async init() {
    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain nodes for different audio types
      this.masterGain = this.audioContext.createGain();
      this.soundEffectsGain = this.audioContext.createGain();
      this.voiceGain = this.audioContext.createGain();
      this.ambientGain = this.audioContext.createGain();
      
      // Connect gain nodes
      this.soundEffectsGain.connect(this.masterGain);
      this.voiceGain.connect(this.masterGain);
      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
      
      // Set initial volumes
      this.updateVolumes();
      
      // Load sound effects
      await this.loadSoundEffects();
      
      console.log('Audio service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
  }

  async loadSoundEffects() {
    const soundEffects = {
      // Startup and system sounds
      startup: { url: '/sounds/startup.mp3', category: 'system' },
      beep: { url: '/sounds/beep.mp3', category: 'system' },
      boop: { url: '/sounds/boop.mp3', category: 'system' },
      error: { url: '/sounds/error.mp3', category: 'system' },
      glitch: { url: '/sounds/glitch.mp3', category: 'system' },
      
      // Mood-based sounds
      excited: { url: '/sounds/excited.mp3', category: 'mood' },
      bored: { url: '/sounds/bored.mp3', category: 'mood' },
      thinking: { url: '/sounds/thinking.mp3', category: 'mood' },
      
      // Interaction sounds
      typing: { url: '/sounds/typing.mp3', category: 'interaction' },
      message: { url: '/sounds/message.mp3', category: 'interaction' },
      notification: { url: '/sounds/notification.mp3', category: 'interaction' },
      click: { url: '/sounds/click.mp3', category: 'interaction' },
      
      // Circuit and mechanical sounds
      circuits: { url: '/sounds/circuits.mp3', category: 'mechanical' },
      whirr: { url: '/sounds/whirr.mp3', category: 'mechanical' },
      static: { url: '/sounds/static.mp3', category: 'mechanical' },
      spark: { url: '/sounds/spark.mp3', category: 'mechanical' },
      
      // Ambient sounds
      ambient: { url: '/sounds/ambient.mp3', category: 'ambient' },
      hum: { url: '/sounds/hum.mp3', category: 'ambient' },
      
      // Voice-related sounds
      voice: { url: '/sounds/voice.mp3', category: 'voice' },
      voiceStart: { url: '/sounds/voice-start.mp3', category: 'voice' },
      voiceEnd: { url: '/sounds/voice-end.mp3', category: 'voice' }
    };

    for (const [name, config] of Object.entries(soundEffects)) {
      try {
        const audioBuffer = await this.loadAudioFile(config.url);
        this.soundEffects.set(name, {
          buffer: audioBuffer,
          category: config.category,
          spatial: config.category === 'ambient' || config.category === 'mechanical'
        });
      } catch (error) {
        // Create a silent audio buffer as fallback
        const silentBuffer = this.audioContext.createBuffer(1, 44100, 44100);
        this.soundEffects.set(name, {
          buffer: silentBuffer,
          category: config.category,
          spatial: config.category === 'ambient' || config.category === 'mechanical'
        });
      }
    }
  }

  async loadAudioFile(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      // Only log the first few audio loading errors to reduce console noise
      if (!this.audioLoadErrorsLogged) {
        this.audioLoadErrorsLogged = 0;
      }
      if (this.audioLoadErrorsLogged < 3) {
        console.warn(`Audio files not found (using silent fallbacks). Add sound files to /public/sounds/ for full audio experience.`);
        this.audioLoadErrorsLogged++;
      }
      throw error;
    }
  }

  // Play sound effects with spatial audio support
  playSound(soundName, options = {}) {
    if (!this.settings.soundEffectsEnabled || !this.audioContext) return;

    const sound = this.soundEffects.get(soundName);
    if (!sound) {
      console.warn(`Sound effect not found: ${soundName}`);
      return;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = sound.buffer;
    source.connect(gainNode);
    
    // Apply spatial audio if enabled and sound supports it
    if (this.settings.spatialAudio && sound.spatial && options.position) {
      const panner = this.audioContext.createPanner();
      panner.setPosition(options.position.x || 0, options.position.y || 0, options.position.z || 0);
      gainNode.connect(panner);
      panner.connect(this.soundEffectsGain);
    } else {
      gainNode.connect(this.soundEffectsGain);
    }

    // Apply volume and effects
    gainNode.gain.value = (options.volume || 1) * this.settings.soundEffectsVolume;
    
    // Add effects based on sound category
    this.applySoundEffects(gainNode, sound.category, options);
    
    source.start();
    
    return source;
  }

  // Apply audio effects based on sound category
  applySoundEffects(gainNode, category, options) {
    switch (category) {
      case 'system':
        // Add slight reverb for system sounds
        this.addReverb(gainNode, 0.1, 0.3);
        break;
      case 'mood':
        // Add filter for mood sounds
        this.addFilter(gainNode, options.mood === 'excited' ? 'highpass' : 'lowpass');
        break;
      case 'mechanical':
        // Add distortion for mechanical sounds
        this.addDistortion(gainNode, 0.2);
        break;
      case 'ambient':
        // Add spatial effects for ambient sounds
        this.addSpatialEffects(gainNode, options);
        break;
    }
  }

  // Add reverb effect
  addReverb(gainNode, decay, wetLevel) {
    const convolver = this.audioContext.createConvolver();
    const reverbGain = this.audioContext.createGain();
    
    // Create impulse response for reverb
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * decay;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    convolver.buffer = impulse;
    reverbGain.gain.value = wetLevel;
    
    gainNode.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(this.soundEffectsGain);
  }

  // Add filter effect
  addFilter(gainNode, type) {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = type === 'highpass' ? 1000 : 500;
    filter.Q.value = 1;
    
    gainNode.connect(filter);
    filter.connect(this.soundEffectsGain);
  }

  // Add distortion effect
  addDistortion(gainNode, amount) {
    const waveshaper = this.audioContext.createWaveShaper();
    const curve = new Float32Array(44100);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < 44100; i++) {
      const x = (i * 2) / 44100 - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    waveshaper.curve = curve;
    waveshaper.oversample = '4x';
    
    gainNode.connect(waveshaper);
    waveshaper.connect(this.soundEffectsGain);
  }

  // Add spatial effects for ambient sounds
  addSpatialEffects(gainNode, options) {
    const panner = this.audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    
    // Set position based on options
    panner.setPosition(
      options.position?.x || 0,
      options.position?.y || 0,
      options.position?.z || 0
    );
    
    gainNode.connect(panner);
    panner.connect(this.ambientGain);
  }

  // ElevenLabs Text-to-Speech
  async speakText(text, options = {}) {
    if (!this.settings.voiceEnabled || !this.elevenLabsApiKey) {
      return null;
    }

    const voiceOptions = {
      voice_id: options.voiceId || this.voiceId,
      text_input: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: options.stability || 0.5,
        similarity_boost: options.similarityBoost || 0.75,
        style: options.style || 0.0,
        use_speaker_boost: options.useSpeakerBoost || true
      }
    };

    try {
      // Play voice start sound
      this.playSound('voiceStart', { volume: 0.3 });
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceOptions.voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey
        },
        body: JSON.stringify(voiceOptions)
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Create audio source
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(this.voiceGain);
      
      // Apply voice effects based on mood
      this.applyVoiceEffects(gainNode, options.mood);
      
      // Set volume
      gainNode.gain.value = (options.volume || 1) * this.settings.voiceVolume;
      
      // Play audio
      source.start();
      this.currentVoiceSource = source;
      
      // Play voice end sound when finished
      source.onended = () => {
        this.playSound('voiceEnd', { volume: 0.2 });
        this.currentVoiceSource = null;
      };
      
      return source;
    } catch (error) {
      console.error('Text-to-speech error:', error);
      return null;
    }
  }

  // Apply voice effects based on mood
  applyVoiceEffects(gainNode, mood) {
    switch (mood) {
      case 'excited':
        // Increase pitch and add slight distortion
        this.addPitchShift(gainNode, 1.1);
        this.addDistortion(gainNode, 0.1);
        break;
      case 'error':
        // Add glitch effects
        this.addGlitchEffect(gainNode);
        break;
      case 'bored':
        // Lower pitch and add filter
        this.addPitchShift(gainNode, 0.9);
        this.addFilter(gainNode, 'lowpass');
        break;
      default:
        // Normal voice processing
        break;
    }
  }

  // Add pitch shift effect
  addPitchShift(gainNode, pitchRatio) {
    const pitchShift = this.audioContext.createBiquadFilter();
    pitchShift.type = 'allpass';
    pitchShift.frequency.value = 1000 * pitchRatio;
    
    gainNode.connect(pitchShift);
    pitchShift.connect(this.voiceGain);
  }

  // Add glitch effect for error mood
  addGlitchEffect(gainNode) {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        gainNode.gain.value = 0;
        setTimeout(() => {
          gainNode.gain.value = this.settings.voiceVolume;
        }, Math.random() * 100);
      }
    }, 200);
    
    setTimeout(() => clearInterval(glitchInterval), 3000);
  }

  // Queue voice for sequential playback
  queueVoice(text, options = {}) {
    this.voiceQueue.push({ text, options });
    this.processVoiceQueue();
  }

  async processVoiceQueue() {
    if (this.isPlayingVoice || this.voiceQueue.length === 0) return;
    
    this.isPlayingVoice = true;
    
    while (this.voiceQueue.length > 0) {
      const { text, options } = this.voiceQueue.shift();
      const source = await this.speakText(text, options);
      
      if (source) {
        await new Promise(resolve => {
          source.onended = resolve;
        });
      }
    }
    
    this.isPlayingVoice = false;
  }

  // Stop current voice playback
  stopVoice() {
    if (this.currentVoiceSource) {
      this.currentVoiceSource.stop();
      this.currentVoiceSource = null;
    }
    this.voiceQueue = [];
    this.isPlayingVoice = false;
  }

  // Play ambient sounds with spatial audio
  playAmbient(soundName, options = {}) {
    if (!this.settings.ambientEnabled) return;
    
    const position = options.position || { x: 0, y: 0, z: 0 };
    const loop = options.loop !== false;
    
    return this.playSound(soundName, {
      ...options,
      position,
      loop,
      category: 'ambient'
    });
  }

  // Trigger sounds based on text content
  triggerSoundsFromText(text, mood = 'normal') {
    const triggers = {
      // System sounds
      '\\*beep\\*': 'beep',
      '\\*boop\\*': 'boop',
      '\\*error\\*': 'error',
      '\\*glitch\\*': 'glitch',
      
      // Mood sounds
      '\\*circuits buzzing\\*': 'circuits',
      '\\*whirrs\\*': 'whirr',
      '\\*static\\*': 'static',
      '\\*spark\\*': 'spark',
      
      // Interaction sounds
      '\\*typing\\*': 'typing',
      '\\*processing\\*': 'thinking'
    };

    for (const [pattern, sound] of Object.entries(triggers)) {
      if (new RegExp(pattern, 'gi').test(text)) {
        this.playSound(sound, { mood });
      }
    }

    // Mood-based ambient sounds
    if (mood === 'excited') {
      this.playAmbient('spark', { volume: 0.3, position: { x: 0, y: 0, z: 1 } });
    } else if (mood === 'bored') {
      this.playAmbient('hum', { volume: 0.2, position: { x: -1, y: 0, z: 0 } });
    }
  }

  // Volume controls
  updateVolumes() {
    this.masterGain.gain.value = this.settings.masterVolume;
    this.soundEffectsGain.gain.value = this.settings.soundEffectsVolume;
    this.voiceGain.gain.value = this.settings.voiceVolume;
    this.ambientGain.gain.value = this.settings.ambientVolume;
  }

  setMasterVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  setSoundEffectsVolume(volume) {
    this.settings.soundEffectsVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  setVoiceVolume(volume) {
    this.settings.voiceVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  setAmbientVolume(volume) {
    this.settings.ambientVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  // Mute functionality
  mute() {
    this.masterGain.gain.value = 0;
  }

  unmute() {
    this.updateVolumes();
  }

  muteSoundEffects() {
    this.settings.soundEffectsEnabled = false;
  }

  unmuteSoundEffects() {
    this.settings.soundEffectsEnabled = true;
  }

  muteVoice() {
    this.settings.voiceEnabled = false;
    this.stopVoice();
  }

  unmuteVoice() {
    this.settings.voiceEnabled = true;
  }

  // Spatial audio controls
  enableSpatialAudio() {
    this.settings.spatialAudio = true;
  }

  disableSpatialAudio() {
    this.settings.spatialAudio = false;
  }

  // Get audio settings
  getSettings() {
    return { ...this.settings };
  }

  // Update settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.updateVolumes();
  }

  // Cleanup
  destroy() {
    this.stopVoice();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create singleton instance
const audioService = new AudioService();

// Export functions for easy use
export const playSound = (soundName, options) => audioService.playSound(soundName, options);
export const speakText = (text, options) => audioService.speakText(text, options);
export const queueVoice = (text, options) => audioService.queueVoice(text, options);
export const stopVoice = () => audioService.stopVoice();
export const playAmbient = (soundName, options) => audioService.playAmbient(soundName, options);
export const triggerSoundsFromText = (text, mood) => audioService.triggerSoundsFromText(text, mood);

// Volume controls
export const setMasterVolume = (volume) => audioService.setMasterVolume(volume);
export const setSoundEffectsVolume = (volume) => audioService.setSoundEffectsVolume(volume);
export const setVoiceVolume = (volume) => audioService.setVoiceVolume(volume);
export const setAmbientVolume = (volume) => audioService.setAmbientVolume(volume);

// Mute controls
export const mute = () => audioService.mute();
export const unmute = () => audioService.unmute();
export const muteSoundEffects = () => audioService.muteSoundEffects();
export const unmuteSoundEffects = () => audioService.unmuteSoundEffects();
export const muteVoice = () => audioService.muteVoice();
export const unmuteVoice = () => audioService.unmuteVoice();

// Spatial audio controls
export const enableSpatialAudio = () => audioService.enableSpatialAudio();
export const disableSpatialAudio = () => audioService.disableSpatialAudio();

// Settings
export const getAudioSettings = () => audioService.getSettings();
export const updateAudioSettings = (settings) => audioService.updateSettings(settings);

export default audioService; 