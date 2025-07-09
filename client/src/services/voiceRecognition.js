// Voice Recognition Service for RALPHBOT
// Simplified and robust version
import React from 'react';

class VoiceRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResult = null;
    this.onError = null;
    
    // Initialize with proper browser support check
    this.initializeRecognition();
  }

  initializeRecognition() {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    // Use the available API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not available');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (this.onResult) {
        this.onResult(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (this.onError) {
        this.onError(event.error);
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  isSupported() {
    return this.recognition !== null;
  }

  startListening(onResult, onError) {
    if (!this.isSupported()) {
      console.warn('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      return false;
    }

    this.onResult = onResult;
    this.onError = onError;
    
    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Error starting recognition:', error);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening() {
    return this.isListening;
  }
}

// Create and export instance
const voiceRecognition = new VoiceRecognitionService();

// Export both the instance and the class
export default voiceRecognition;
export { VoiceRecognitionService };

// Export helper functions for React hooks
export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(false);

  React.useEffect(() => {
    setIsSupported(voiceRecognition.isSupported());
  }, []);

  const startListening = (onResult, onError) => {
    const success = voiceRecognition.startListening(
      (transcript) => {
        setIsListening(false);
        onResult(transcript);
      },
      (error) => {
        setIsListening(false);
        onError(error);
      }
    );
    
    if (success) {
      setIsListening(true);
    }
    
    return success;
  };

  const stopListening = () => {
    voiceRecognition.stopListening();
    setIsListening(false);
  };

  return {
    isSupported,
    isListening,
    startListening,
    stopListening
  };
}; 