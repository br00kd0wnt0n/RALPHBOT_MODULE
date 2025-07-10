import React, { useState } from 'react';
import ChatBot from './components/ChatBot';
import { VisualEffectsProvider } from './components/VisualEffects';
import ErrorBoundary from './components/ErrorBoundary';
import { motion } from 'framer-motion';
import './styles/App.css';
import './styles/visualEffects.css';

function App() {
  const [isBotVisible, setIsBotVisible] = useState(true);

  const handleNavigate = (target) => {
    console.log(`Navigating to: ${target}`);
  };

  const handleScreenContent = (content) => {
    console.log('Screen content:', content);
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
        <ErrorBoundary>
          <VisualEffectsProvider>
            {/* 
              IMPORTANT: Do NOT add className="chatbot-container" to this motion.div wrapper.
              The ChatBot component already has its own container with that class.
              Adding it here creates a box-within-box effect that cuts off content.
            */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.5 }}
            >
              <ChatBot
                onNavigate={handleNavigate}
                onScreenContent={handleScreenContent}
                className="ralphbot-widget"
              />
            </motion.div>
          </VisualEffectsProvider>
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App; 