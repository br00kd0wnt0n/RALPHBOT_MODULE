import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  GlitchText, 
  TypingText, 
  StaticEffect, 
  ParticleEffect, 
  ScreenFlicker,
  MoodTransition,
  useVisualEffects 
} from './VisualEffects';
import '../styles/MessageBubble.css';

const MessageBubble = ({ message }) => {
  const { text, sender, mood, effects, intensity = 5 } = message;
  const messageRef = useRef(null);
  const { createParticles, glitchText, staticEffect, screenFlicker } = useVisualEffects();
  
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

  // Apply visual effects based on mood and intensity
  useEffect(() => {
    if (!isUser && messageRef.current) {
      const rect = messageRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Apply effects based on mood
      switch (mood) {
        case 'excited':
          // Create particle effects for excitement
          createParticles(centerX, centerY, '#ffff00', 15 + intensity);
          break;
        case 'error':
          // Apply screen flicker for errors
          screenFlicker(messageRef.current, 1000, 0.6);
          break;
        case 'bored':
          // Apply static effect for boredom
          staticEffect(messageRef.current, 2000);
          break;
        default:
          break;
      }
    }
  }, [mood, intensity, isUser, createParticles, screenFlicker, staticEffect]);

  // Handle glitch effects for error messages
  const handleGlitch = () => {
    if (mood === 'error' && messageRef.current) {
      glitchText(messageRef.current, 2000, 0.4);
    }
  };

  // Render text with appropriate effects
  const renderText = () => {
    if (mood === 'error' && intensity > 7) {
      return (
        <GlitchText 
          duration={2000} 
          intensity={0.4}
          onGlitchComplete={handleGlitch}
        >
          {processedText}
        </GlitchText>
      );
    }

    if (mood === 'excited' && intensity > 6) {
      return (
        <TypingText 
          text={processedText}
          speed={30}
          cursorBlink={true}
        />
      );
    }

    return (
      <div className={`message-text ${textClass}`}>
        {processedText}
      </div>
    );
  };

  return (
    <motion.div
      ref={messageRef}
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
      
      <MoodTransition mood={mood} duration={800}>
        <motion.div
          className={`message-bubble ${isUser ? 'user' : 'bot'} mood-${mood}`}
          variants={glowVariants}
          animate={mood}
        >
          {renderText()}
          
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

          {!isUser && mood === 'bored' && (
            <div className="bored-static">
              <span className="static-text">*hum*</span>
            </div>
          )}
        </motion.div>
      </MoodTransition>
      
      {isUser && (
        <div className="user-avatar">
          <span className="user-icon">👤</span>
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble; 