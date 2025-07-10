import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import MessageBubble from './MessageBubble';
import AudioControls from './AudioControls';
import { VisualEffectsProvider, useVisualEffects } from './VisualEffects';
import { sendMessage, getHealth } from '../services/api';
import { 
  playSound, 
  speakText, 
  queueVoice, 
  stopVoice, 
  triggerSoundsFromText,
  getAudioSettings 
} from '../services/audio';
import { applyTextEffects } from '../utils/effects';
import './ChatBot.css';
import { useVoiceRecognition } from '../services/voiceRecognition';

/**
 * RALPHBOT ChatBot Component
 * 
 * IMPORTANT: This component contains the main chatbot-container div.
 * The App.jsx wrapper should NOT have the same class to avoid box-within-box layout issues.
 * 
 * Container Structure:
 * - App.jsx: motion.div (animation wrapper, NO chatbot-container class)
 * - ChatBot.jsx: div with className="chatbot-container" (main container)
 */
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

const ChatBot = ({ onNavigate, onScreenContent, className = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [socket, setSocket] = useState(null);
  const [botMood, setBotMood] = useState('normal'); // normal, excited, error, bored
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [personalityTraits, setPersonalityTraits] = useState({});
  const [dynamicQuirks, setDynamicQuirks] = useState([]);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [audioSettings, setAudioSettings] = useState({});
  const { createParticles, glitchText, staticEffect, screenFlicker } = useVisualEffects();
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Voice recognition hook
  const { 
    isSupported: voiceSupported, 
    isListening, 
    startListening, 
    stopListening 
  } = useVoiceRecognition();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    // Check health on startup
    checkHealth();
    
    // Load audio settings
    setAudioSettings(getAudioSettings());
    
    // Setup voice recognition handlers
    try {
      setupVoiceRecognition();
    } catch (error) {
      console.warn('Voice recognition setup failed:', error);
    }
    
    // Listen for admin updates
    newSocket.on('admin_update', (data) => {
      console.log('Admin update:', data);
      if (data.type === 'personality_update') {
        // Refresh personality context
        handlePersonalityUpdate(data.personality);
      }
    });
    
    return () => newSocket.close();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced boredom detection with mood awareness
  useEffect(() => {
    const boredomInterval = setInterval(() => {
      const timeSinceLastMessage = Date.now() - lastMessageTime;
      const boredomThreshold = botMood === 'bored' ? 30000 : 60000; // More frequent if already bored
      
      if (messages.length > 0 && timeSinceLastMessage > boredomThreshold) {
        simulateBoredom();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(boredomInterval);
  }, [messages, lastMessageTime, botMood]);

  const checkHealth = async () => {
    try {
      const health = await getHealth();
      setIsOnline(health.status === 'online');
    } catch (error) {
      setIsOnline(false);
    }
  };

  const setupVoiceRecognition = () => {
    // Voice recognition is now handled by the useVoiceRecognition hook
    // The handlers are set up in the handleVoiceInput function
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateBoredom = () => {
    const boredomMessages = [
      "*fidgets with antenna* Hey, wanna see something cool from our recent work?",
      "You know what's pretty wild? Our latest magazine issue. Want to check it out?",
      "*circuits humming* I'm in the mood to show off some of our events...",
      "Got any questions about what we do at RALPH? I'm feeling chatty! 🤖",
      "*taps foot* Anyone want to hear about our latest creative collaborations?"
    ];
    
    const randomMessage = boredomMessages[Math.floor(Math.random() * boredomMessages.length)];
    
    addMessage(randomMessage, 'bot', 'bored');
    setBotMood('bored');
    setMoodIntensity(6);
    playSound('bored', { mood: 'bored' });
    
    // Apply visual effects for boredom
    if (messagesEndRef.current) {
      const rect = messagesEndRef.current.getBoundingClientRect();
      staticEffect(messagesEndRef.current, 3000);
    }
  };

  const addMessage = (text, sender, mood = 'normal', intensity = 5, traits = {}) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      mood,
      intensity,
      traits,
      timestamp: new Date(),
      effects: applyTextEffects(text, mood, intensity)
    };
    
    setMessages(prev => [...prev, newMessage]);
    setLastMessageTime(Date.now());
    
    // Trigger sounds based on text content
    if (sender === 'bot') {
      triggerSoundsFromText(text, mood);
    }
    
    // Emit to socket for analytics
    if (socket) {
      socket.emit('chat_message', { 
        message: text, 
        sender, 
        mood, 
        intensity,
        userId,
        traits
      });
    }
  };

  const handlePersonalityUpdate = (personalityData) => {
    // Update personality traits and quirks
    if (personalityData.settings) {
      setPersonalityTraits(personalityData.settings);
    }
    
    if (personalityData.dynamic_quirks) {
      setDynamicQuirks(personalityData.dynamic_quirks);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    addMessage(userMessage, 'user');
    
    // Show typing indicator
    setIsTyping(true);
    playSound('typing', { volume: 0.3 });
    
    try {
      // Apply visual effects for thinking
      if (messagesEndRef.current) {
        staticEffect(messagesEndRef.current, 2000);
      }
      
      // Send message to backend
      const response = await sendMessage(userMessage, userId);
      
      // Hide typing indicator
      setIsTyping(false);
      
      if (response.success) {
        const { message, mood, intensity, traits } = response.data;
        
        // Update bot mood
        setBotMood(mood);
        setMoodIntensity(intensity);
        
        // Add bot response with effects
        addMessage(message, 'bot', mood, intensity, traits);
        
        // Apply mood-based visual effects
        if (mood === 'excited') {
          createParticles(messagesEndRef.current, 20);
        } else if (mood === 'error') {
          screenFlicker(1000);
        }
        
        // Update personality if provided
        if (traits) {
          handlePersonalityUpdate({ settings: traits });
        }
        
        // Trigger voice synthesis if enabled
        if (audioSettings.voiceEnabled) {
          queueVoice(message, { mood, intensity });
        }
        
      } else {
        // Handle error response
        setBotMood('error');
        setMoodIntensity(8);
        addMessage("Oops! Something went wrong with my circuits. Let me try again!", 'bot', 'error', 8);
        playSound('error', { volume: 0.5 });
        screenFlicker(1500);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      setBotMood('error');
      setMoodIntensity(8);
      addMessage("My circuits are having a moment! Please try again.", 'bot', 'error', 8);
      playSound('error', { volume: 0.5 });
      screenFlicker(1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    playSound('click', { volume: 0.3 });
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(
        (transcript) => {
          setInputValue(transcript);
          handleSendMessage(transcript);
        },
        (error) => {
          console.error('Voice recognition error:', error);
          addMessage("*static* Sorry, I couldn't quite catch that. Try typing instead?", 'bot', 'error');
        }
      );
    }
  };

  const handleVoiceOutput = () => {
    if (messages.length > 0) {
      const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
      if (lastBotMessage) {
        // Use browser's speech synthesis to speak the message
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(lastBotMessage.text);
          utterance.rate = 0.9; // Slightly slower for robot-like speech
          utterance.pitch = 0.8; // Lower pitch for robot voice
          utterance.volume = audioSettings.voiceVolume || 0.8;
          
          // Stop any current speech
          window.speechSynthesis.cancel();
          
          // Speak the message
          window.speechSynthesis.speak(utterance);
          
          // Add visual feedback
          addMessage("*speaking* " + lastBotMessage.text, 'bot', 'normal', 6);
          playSound('voice', { volume: 0.4 });
        } else {
          addMessage("*static* Voice output not supported in this browser", 'bot', 'error');
        }
      } else {
        addMessage("*whirrs* No bot message to speak", 'bot', 'normal');
      }
    } else {
      addMessage("*circuits humming* No messages to speak yet", 'bot', 'normal');
    }
  };

  const handleAudioControls = () => {
    setShowAudioControls(!showAudioControls);
    playSound('click', { volume: 0.3 });
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
    playSound('click', { volume: 0.3 });
  };

  const getTypingIndicator = () => {
    const baseText = "*whirrs thoughtfully*";
    const moodVariants = {
      excited: "*circuits buzzing excitedly*",
      error: "*static crackle* Processing...",
      bored: "*fidgets* Thinking...",
      normal: "*whirrs thoughtfully*"
    };
    
    return moodVariants[botMood] || baseText;
  };

  const getMoodAnimation = () => {
    const animations = {
      excited: {
        scale: [1, 1.05, 1],
        rotate: [0, 2, -2, 0],
        transition: { duration: 0.5, repeat: Infinity }
      },
      error: {
        x: [0, -3, 3, -3, 0],
        transition: { duration: 0.3, repeat: 3 }
      },
      bored: {
        opacity: [1, 0.7, 1],
        transition: { duration: 2, repeat: Infinity }
      },
      normal: {}
    };
    
    return animations[botMood] || {};
  };

  return (
    <div className={`chatbot-container ${className} ${isMinimized ? 'minimized' : ''}`}>
      {/* Chat Interface */}
      <div className="chat-interface">
        {/* Header */}
        <div className="chat-header">
          <div className="bot-status">
            <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
            <span className="bot-name">RALPHBOT</span>
            <span className="mood-indicator">
              {botMood === 'excited' && '⚡'}
              {botMood === 'error' && '⚠️'}
              {botMood === 'bored' && '😴'}
              {botMood === 'normal' && '🤖'}
            </span>
          </div>
          <div className="header-controls">
            <button 
              className={`control-btn voice-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceInput}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              disabled={!voiceSupported}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
            <button 
              className="control-btn voice-btn"
              onClick={handleVoiceOutput}
              aria-label="Voice output"
            >
              🔊
            </button>
            <button 
              className="control-btn audio-btn"
              onClick={handleAudioControls}
              aria-label="Audio settings"
            >
              🎵
            </button>
            <button 
              className="control-btn minimize-btn"
              onClick={handleMinimize}
              aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
            >
              {isMinimized ? '🔽' : '🔼'}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
            />
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-text">{getTypingIndicator()}</div>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about RALPH's creative work, events, magazine, or collaborations..."
              className="message-input"
              rows="1"
              disabled={isTyping}
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send message"
            >
              🚀
            </button>
          </div>
          
          {/* Quick Suggestions */}
          {messages.length === 0 && (
            <div className="quick-suggestions">
              <button 
                className="suggestion-btn"
                onClick={() => handleSuggestionClick("Tell me about RALPH's creative work")}
              >
                Creative Work
              </button>
              <button 
                className="suggestion-btn"
                onClick={() => handleSuggestionClick("What events do you have coming up?")}
              >
                Events
              </button>
              <button 
                className="suggestion-btn"
                onClick={() => handleSuggestionClick("Tell me about your magazine")}
              >
                Magazine
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audio Controls */}
      <AudioControls 
        isVisible={showAudioControls}
        onClose={() => setShowAudioControls(false)}
      />
    </div>
  );
};

export default ChatBot; 