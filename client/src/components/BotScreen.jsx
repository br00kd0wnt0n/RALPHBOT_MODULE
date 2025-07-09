import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/BotScreen.css';

const BotScreen = ({ mood, isVisible, onContentChange, currentScreen, content }) => {
  const [screenContent, setScreenContent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (content) {
      setScreenContent(content);
    }
  }, [content]);

  const getMoodAnimation = () => {
    switch (mood) {
      case 'excited':
        return {
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0],
          transition: { duration: 0.5, repeat: Infinity }
        };
      case 'error':
        return {
          x: [0, -5, 5, -5, 0],
          transition: { duration: 0.3, repeat: 3 }
        };
      case 'bored':
        return {
          opacity: [1, 0.7, 1],
          transition: { duration: 2, repeat: Infinity }
        };
      default:
        return {};
    }
  };

  const renderContent = () => {
    if (screenContent) {
      return (
        <motion.div
          className="screen-content"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
        >
          {screenContent.type === 'video' && (
            <div className="video-container">
              <video
                src={screenContent.url}
                controls
                autoPlay={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="content-video"
              />
              <div className="video-overlay">
                <span className="video-title">{screenContent.title}</span>
              </div>
            </div>
          )}
          
          {screenContent.type === 'image' && (
            <div className="image-container">
              <img
                src={screenContent.url}
                alt={screenContent.alt || 'RALPH content'}
                className="content-image"
              />
              <div className="image-overlay">
                <span className="image-title">{screenContent.title}</span>
              </div>
            </div>
          )}
          
          {screenContent.type === 'text' && (
            <div className="text-container">
              <h3 className="content-title">{screenContent.title}</h3>
              <p className="content-description">{screenContent.description}</p>
              {screenContent.link && (
                <a 
                  href={screenContent.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="content-link"
                >
                  Learn More →
                </a>
              )}
            </div>
          )}
        </motion.div>
      );
    }

    // Default screen content based on mood
    return (
      <motion.div
        className="default-screen"
        animate={getMoodAnimation()}
      >
        <div className="screen-background">
          <div className="circuit-pattern"></div>
          <div className="floating-elements">
            <span className="floating-element">🚀</span>
            <span className="floating-element">⭐</span>
            <span className="floating-element">🌌</span>
          </div>
        </div>
        
        <div className="screen-text">
          <h2 className="screen-title">RALPHBOT Interface</h2>
          <p className="screen-subtitle">
            {mood === 'excited' && "*circuits buzzing* Ready for adventure!"}
            {mood === 'error' && "*static crackle* Systems recalibrating..."}
            {mood === 'bored' && "*fidgets* Waiting for something interesting..."}
            {mood === 'normal' && "Welcome to the RALPH universe! *beep boop*"}
          </p>
        </div>
      </motion.div>
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      className="bot-screen"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="screen-header">
        <div className="screen-indicators">
          <span className="indicator red"></span>
          <span className="indicator yellow"></span>
          <span className="indicator green"></span>
        </div>
        <div className="screen-title-bar">
          <span className="title-text">RALPHBOT Display</span>
        </div>
      </div>
      
      <div className="screen-body">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
      
      <div className="screen-footer">
        <div className="status-bar">
          <span className="status-text">
            {mood === 'excited' && "⚡ ENTHUSIASTIC MODE"}
            {mood === 'error' && "⚠️ SYSTEM GLITCH"}
            {mood === 'bored' && "😴 IDLE MODE"}
            {mood === 'normal' && "🤖 OPERATIONAL"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default BotScreen; 