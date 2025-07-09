import React, { useState, useEffect } from 'react';
import ChatBot from './components/ChatBot';
import BotScreen from './components/BotScreen';
import { motion } from 'framer-motion';
import './styles/App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [screenContent, setScreenContent] = useState(null);
  const [isBotVisible, setIsBotVisible] = useState(true);

  const handleNavigate = (target) => {
    setCurrentScreen(target);
    console.log(`Navigating to: ${target}`);
  };

  const handleScreenContent = (content) => {
    setScreenContent(content);
  };

  const toggleBot = () => {
    setIsBotVisible(!isBotVisible);
  };

  return (
    <div className="app">
      {/* Space-themed background */}
      <div className="space-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
        <div className="clouds"></div>
      </div>

      {/* Main content area */}
      <div className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="content-container"
        >
          <BotScreen 
            currentScreen={currentScreen}
            content={screenContent}
            onNavigate={handleNavigate}
          />
        </motion.div>
      </div>

      {/* Floating bot toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bot-toggle"
        onClick={toggleBot}
        aria-label={isBotVisible ? "Hide RALPHBOT" : "Show RALPHBOT"}
      >
        {isBotVisible ? '🤖' : '🚀'}
      </motion.button>

      {/* ChatBot component */}
      {isBotVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.5 }}
          className="chatbot-container"
        >
          <ChatBot
            onNavigate={handleNavigate}
            onScreenContent={handleScreenContent}
            className="ralphbot-widget"
          />
        </motion.div>
      )}
    </div>
  );
}

export default App; 