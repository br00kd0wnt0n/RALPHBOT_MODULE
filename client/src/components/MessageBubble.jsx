import React from 'react';
import { motion } from 'framer-motion';
import '../styles/MessageBubble.css';

const MessageBubble = ({ message }) => {
  const { text, sender, mood, effects } = message;
  
  const isUser = sender === 'user';
  
  // Apply text effects based on mood
  const processedText = effects ? effects.processedText : text;
  const textClass = effects ? effects.textClass : '';
  
  const bubbleVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      x: isUser ? 50 : -50 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const glowVariants = {
    normal: { boxShadow: "0 0 10px rgba(0, 255, 255, 0.3)" },
    excited: { 
      boxShadow: "0 0 20px rgba(255, 255, 0, 0.6)",
      transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
    },
    error: { 
      boxShadow: "0 0 15px rgba(255, 0, 0, 0.4)",
      transition: { duration: 0.3, repeat: Infinity, repeatType: "reverse" }
    },
    bored: { 
      boxShadow: "0 0 8px rgba(128, 128, 128, 0.3)",
      transition: { duration: 2, repeat: Infinity, repeatType: "reverse" }
    }
  };

  return (
    <motion.div
      className={`message-container ${isUser ? 'user-message' : 'bot-message'}`}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
    >
      {!isUser && (
        <div className="bot-avatar">
          <span className="bot-icon">🤖</span>
          {mood === 'excited' && <span className="mood-indicator excited">⚡</span>}
          {mood === 'error' && <span className="mood-indicator error">⚠️</span>}
          {mood === 'bored' && <span className="mood-indicator bored">😴</span>}
        </div>
      )}
      
      <motion.div
        className={`message-bubble ${isUser ? 'user' : 'bot'} mood-${mood}`}
        variants={glowVariants}
        animate={mood}
      >
        <div className={`message-text ${textClass}`}>
          {processedText}
        </div>
        
        {!isUser && mood === 'excited' && (
          <div className="excitement-particles">
            <span>✨</span>
            <span>🌟</span>
            <span>💫</span>
          </div>
        )}
        
        {!isUser && mood === 'error' && (
          <div className="error-glitch">
            <span className="glitch-text">*bzzt*</span>
          </div>
        )}
      </motion.div>
      
      {isUser && (
        <div className="user-avatar">
          <span className="user-icon">👤</span>
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble; 