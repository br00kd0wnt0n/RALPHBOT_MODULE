import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import MessageBubble from './MessageBubble';
import BotScreen from './BotScreen';
import { sendMessage, getHealth } from '../services/api';
import { playSound } from '../services/audio';
import { applyTextEffects } from '../utils/effects';
import './ChatBot.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

const ChatBot = ({ onNavigate, onScreenContent, className = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [socket, setSocket] = useState(null);
  const [botMood, setBotMood] = useState('normal'); // normal, excited, glitchy, bored
  
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
      const response = await sendMessage(message);
      
      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);
        addMessage(response.response, 'bot', response.mood || 'normal');
        
        // Update bot mood based on response
        setBotMood(response.mood || 'normal');
        
        // Play response sound
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
    <div className={`ralphbot-container ${className} ${isMinimized ? 'minimized' : ''} mood-${botMood}`}>
      {/* Bot Header */}
      <div className="ralphbot-header">
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
      </div>

      {/* Bot Screen - shows content/videos */}
      <BotScreen 
        mood={botMood}
        isVisible={!isMinimized}
        onContentChange={onScreenContent}
      />

      {/* Chat Messages */}
      <div className={`ralphbot-messages ${isMinimized ? 'hidden' : ''}`}>
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="bot-avatar">🤖</div>
            <MessageBubble 
              message={{
                text: "*beep boop* Hey there! I'm RALPHBOT, your digital guide to the RALPH universe. Ask me anything about our work, events, magazine, or just say hi! 🚀",
                sender: 'bot',
                mood: 'normal'
              }}
            />
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message}
            onSuggestionClick={handleSuggestionClick}
          />
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="bot-avatar">🤖</div>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">*whirrs thoughtfully*</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`ralphbot-input ${isMinimized ? 'hidden' : ''}`}>
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleInputKeyPress}
            placeholder="Ask me anything about RALPH..."
            disabled={!isOnline}
            rows="1"
            className="message-input"
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || !isOnline}
            className="send-button"
            aria-label="Send message"
          >
            🚀
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="quick-actions">
          <button onClick={() => handleSendMessage("Show me your latest work")}>
            Latest Work
          </button>
          <button onClick={() => handleSendMessage("What events are coming up?")}>
            Events
          </button>
          <button onClick={() => handleSendMessage("Tell me about your magazine")}>
            Magazine
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;Sound(response.mood || 'normal');
        
        // Handle special actions
        if (response.action) {
          handleBotAction(response.action);
        }
      }, 1000 + Math.random() * 1000); // 1-2 second delay
      
    } catch (error) {
      setIsTyping(false);
      addMessage("*bzzt* Sorry, my circuits are a bit tangled right now. Try again?", 'bot', 'error');
      play