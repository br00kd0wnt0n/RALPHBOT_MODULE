import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import MessageBubble from './MessageBubble';
import BotScreen from './BotScreen';
import { sendMessage, getHealth } from '../services/api';
import { playSound } from '../services/audio';
import { applyTextEffects } from '../utils/effects';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ChatBot.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

const ChatBot = ({ onNavigate, onScreenContent, className = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [socket, setSocket] = useState(null);
  const [botMood, setBotMood] = useState('normal'); // normal, excited, glitchy, bored
  const [sessionId, setSessionId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    // Check health on startup
    checkHealth();
    
    // Listen for admin updates
    newSocket.on('admin_update', (data) => {
      console.log('Admin update:', data);
    });
    
    return () => newSocket.close();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate boredom prompts
  useEffect(() => {
    const boredomInterval = setInterval(() => {
      if (messages.length > 0 && Date.now() - lastMessageTime > 60000) { // 1 minute of inactivity
        simulateBoredom();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(boredomInterval);
  }, [messages]);

  const checkHealth = async () => {
    try {
      const health = await getHealth();
      setIsOnline(health.status === 'online');
    } catch (error) {
      setIsOnline(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateBoredom = () => {
    const boredomMessages = [
      "*fidgets with antenna* Hey, wanna see something cool from our recent work?",
      "You know what's pretty wild? Our latest magazine issue. Want to check it out?",
      "*circuits humming* I'm in the mood to show off some of our events...",
      "Got any questions about what we do at RALPH? I'm feeling chatty! 🤖"
    ];
    
    const randomMessage = boredomMessages[Math.floor(Math.random() * boredomMessages.length)];
    
    addMessage(randomMessage, 'bot', 'bored');
    setBotMood('bored');
    playSound('bored');
  };

  const addMessage = (text, sender, mood = 'normal') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      mood,
      timestamp: new Date(),
      effects: applyTextEffects(text, mood)
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Emit to socket for analytics
    if (socket) {
      socket.emit('chat_message', { message: text, sender, mood });
    }
  };

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return;
    
    // Add user message
    addMessage(message, 'user');
    setInputValue('');
    setIsTyping(true);
    
    // Play typing sound
    playSound('typing');
    
    try {
      // Send to API
      const response = await sendMessage(message, sessionId);
      
      // Store session ID if provided
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }
      
      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);
        addMessage(response.response, 'bot', response.mood || 'normal');
        
        // Update bot mood based on response
        setBotMood(response.mood || 'normal');
        
        // Play response sound
        playSound(response.mood === 'error' ? 'error' : 'response');
        
        // Handle bot actions
        if (response.actions) {
          response.actions.forEach(action => handleBotAction(action));
        }
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      addMessage("*bzzt* Sorry, my circuits are a bit tangled right now. Try again?", 'bot', 'error');
      setBotMood('error');
      playSound('error');
    }
  };

  const handleBotAction = (action) => {
    switch (action.type) {
      case 'navigate':
        if (onNavigate) {
          onNavigate(action.target);
        }
        break;
      case 'show_content':
        if (onScreenContent) {
          onScreenContent(action.content);
        }
        break;
      case 'play_video':
        // Handle video playback in bot screen
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    playSound('toggle');
  };

  const lastMessageTime = messages.length > 0 ? messages[messages.length - 1].timestamp.getTime() : Date.now();

  return (
    <motion.div 
      className={`ralphbot-container ${className} ${isMinimized ? 'minimized' : ''} mood-${botMood}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Bot Header */}
      <motion.div 
        className="ralphbot-header"
        whileHover={{ scale: 1.02 }}
      >
        <div className="bot-status">
          <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
          <span className="bot-name">RALPHBOT</span>
          <span className="bot-version">v1.0.0</span>
        </div>
        <button 
          className="minimize-button" 
          onClick={toggleMinimize}
          aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
        >
          {isMinimized ? '⬆' : '⬇'}
        </button>
      </motion.div>

      {/* Bot Screen - shows content/videos */}
      <BotScreen 
        mood={botMood}
        isVisible={!isMinimized}
        onContentChange={onScreenContent}
      />

      {/* Chat Messages */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div 
            className="ralphbot-messages"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {messages.length === 0 && (
              <motion.div 
                className="welcome-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bot-avatar">🤖</div>
                <MessageBubble 
                  message={{
                    text: "*beep boop* Hey there! I'm RALPHBOT, your digital guide to the RALPH universe. Ask me anything about our work, events, magazine, or just say hi! 🚀",
                    sender: 'bot',
                    mood: 'normal'
                  }}
                />
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: message.sender === 'user' ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <MessageBubble message={message} />
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                className="typing-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bot-avatar">🤖</div>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div 
            className="ralphbot-input-area"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleInputKeyPress}
                placeholder="Ask RALPHBOT anything..."
                className="message-input"
                rows="1"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="send-button"
                aria-label="Send message"
              >
                <span>🚀</span>
              </button>
            </div>

            {/* Quick Suggestions */}
            {messages.length > 0 && (
              <motion.div 
                className="suggestions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button onClick={() => handleSuggestionClick("Tell me about RALPH")}>
                  About RALPH
                </button>
                <button onClick={() => handleSuggestionClick("Show me your latest work")}>
                  Latest Work
                </button>
                <button onClick={() => handleSuggestionClick("What events do you have?")}>
                  Events
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatBot; 