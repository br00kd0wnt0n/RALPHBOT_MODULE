// Audio service for RALPHBOT sound effects
class AudioService {
  constructor() {
    this.sounds = new Map();
    this.isEnabled = true;
    this.volume = 0.3;
    this.initSounds();
  }

  initSounds() {
    // Create audio contexts for different sound effects
    this.createBeepSound();
    this.createTypingSound();
    this.createResponseSound();
    this.createErrorSound();
    this.createBoredSound();
    this.createToggleSound();
  }

  createBeepSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    this.sounds.set('beep', { audioContext, oscillator, gainNode });
  }

  createTypingSound() {
    // Create a typing sound effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
    
    this.sounds.set('typing', { audioContext, oscillator, gainNode });
  }

  createResponseSound() {
    // Create a response sound effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    this.sounds.set('response', { audioContext, oscillator, gainNode });
  }

  createErrorSound() {
    // Create an error sound effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
    
    this.sounds.set('error', { audioContext, oscillator, gainNode });
  }

  createBoredSound() {
    // Create a bored sound effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(450, audioContext.currentTime + 0.2);
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    this.sounds.set('bored', { audioContext, oscillator, gainNode });
  }

  createToggleSound() {
    // Create a toggle sound effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
    
    this.sounds.set('toggle', { audioContext, oscillator, gainNode });
  }

  playSound(soundName) {
    if (!this.isEnabled) return;
    
    try {
      // Recreate the sound for each play (Web Audio API limitation)
      switch (soundName) {
        case 'beep':
          this.createBeepSound();
          break;
        case 'typing':
          this.createTypingSound();
          break;
        case 'response':
          this.createResponseSound();
          break;
        case 'error':
          this.createErrorSound();
          break;
        case 'bored':
          this.createBoredSound();
          break;
        case 'toggle':
          this.createToggleSound();
          break;
        default:
          console.warn(`Unknown sound: ${soundName}`);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

// Create singleton instance
const audioService = new AudioService();

// Export functions
export const playSound = (soundName) => {
  audioService.playSound(soundName);
};

export const setVolume = (volume) => {
  audioService.setVolume(volume);
};

export const enableAudio = () => {
  audioService.enable();
};

export const disableAudio = () => {
  audioService.disable();
};

export const toggleAudio = () => {
  return audioService.toggle();
};

export default audioService; 