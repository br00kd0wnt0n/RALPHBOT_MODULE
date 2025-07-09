// Voice service for RALPHBOT speech recognition and synthesis
class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.onTranscript = null;
    this.voice = null;
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
  }

  initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('Voice recognition started');
      };
      
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (this.onTranscript) {
          this.onTranscript(transcript);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Voice recognition ended');
      };
    } else {
      console.warn('Speech recognition not supported');
    }
  }

  initSpeechSynthesis() {
    // Wait for voices to load
    this.synthesis.onvoiceschanged = () => {
      const voices = this.synthesis.getVoices();
      // Try to find a robotic or synthetic voice
      this.voice = voices.find(voice => 
        voice.name.includes('Robot') || 
        voice.name.includes('Synthetic') ||
        voice.name.includes('Microsoft David') ||
        voice.name.includes('Google UK English Male')
      ) || voices[0];
    };
  }

  startListening(onTranscript) {
    if (!this.recognition) {
      console.warn('Speech recognition not available');
      return false;
    }
    
    this.onTranscript = onTranscript;
    this.recognition.start();
    return true;
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  speak(text, options = {}) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not available');
      return false;
    }

    // Stop any current speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.1;
    utterance.volume = options.volume || 0.8;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      this.isSpeaking = false;
    };

    this.synthesis.speak(utterance);
    return true;
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  isSupported() {
    return !!(this.recognition && this.synthesis);
  }

  getStatus() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      isSupported: this.isSupported()
    };
  }
}

// Create singleton instance
const voiceService = new VoiceService();

// Export functions
export const startVoiceRecognition = (onTranscript) => voiceService.startListening(onTranscript);
export const stopVoiceRecognition = () => voiceService.stopListening();
export const speakText = (text, options) => voiceService.speak(text, options);
export const stopSpeaking = () => voiceService.stopSpeaking();
export const isVoiceSupported = () => voiceService.isSupported();
export const getVoiceStatus = () => voiceService.getStatus(); 