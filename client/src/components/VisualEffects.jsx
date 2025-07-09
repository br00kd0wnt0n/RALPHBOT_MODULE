import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  initVisualEffects,
  applyGlitchEffect,
  typeText,
  applyStaticEffect,
  createParticleEffect,
  applyScreenFlicker,
  applyMoodTransition,
  createCircuitPattern,
  createDataStream,
  applyHologramEffect,
  destroyVisualEffects
} from '../utils/visualEffects';
import '../styles/visualEffects.css';

// Visual Effects Context
const VisualEffectsContext = createContext();

export const useVisualEffects = () => {
  const context = useContext(VisualEffectsContext);
  if (!context) {
    throw new Error('useVisualEffects must be used within a VisualEffectsProvider');
  }
  return context;
};

// Visual Effects Provider
export const VisualEffectsProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !isInitialized) {
      initVisualEffects(containerRef.current);
      setIsInitialized(true);
    }

    return () => {
      destroyVisualEffects();
    };
  }, [isInitialized]);

  const effects = {
    // Glitch effects
    glitchText: (element, duration = 2000, intensity = 0.3) => {
      if (element) {
        applyGlitchEffect(element, duration, intensity);
      }
    },

    // Typing animation
    typeText: (element, text, speed = 50, cursorBlink = true) => {
      if (element) {
        return typeText(element, text, speed, cursorBlink);
      }
    },

    // Static effect
    staticEffect: (element, duration = 3000) => {
      if (element) {
        applyStaticEffect(element, duration);
      }
    },

    // Particle effects
    createParticles: (x, y, color = '#00ffff', count = 20) => {
      createParticleEffect(x, y, color, count);
    },

    // Screen flicker
    screenFlicker: (element, duration = 1000, intensity = 0.5) => {
      if (element) {
        applyScreenFlicker(element, duration, intensity);
      }
    },

    // Mood transitions
    moodTransition: (element, mood, duration = 1000) => {
      if (element) {
        applyMoodTransition(element, mood, duration);
      }
    },

    // Circuit patterns
    circuitPattern: (element, duration = 3000) => {
      if (element) {
        createCircuitPattern(element, duration);
      }
    },

    // Data streams
    dataStream: (element, duration = 2000) => {
      if (element) {
        createDataStream(element, duration);
      }
    },

    // Hologram effect
    hologramEffect: (element, duration = 3000) => {
      if (element) {
        applyHologramEffect(element, duration);
      }
    }
  };

  return (
    <VisualEffectsContext.Provider value={effects}>
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    </VisualEffectsContext.Provider>
  );
};

// Glitch Text Component
export const GlitchText = ({ 
  children, 
  duration = 2000, 
  intensity = 0.3, 
  className = '', 
  onGlitchComplete 
}) => {
  const textRef = useRef(null);
  const { glitchText } = useVisualEffects();

  const handleGlitch = () => {
    if (textRef.current) {
      glitchText(textRef.current, duration, intensity);
      if (onGlitchComplete) {
        setTimeout(onGlitchComplete, duration);
      }
    }
  };

  return (
    <span 
      ref={textRef}
      className={`glitch-effect ${className}`}
      data-text={children}
      onClick={handleGlitch}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </span>
  );
};

// Typing Text Component
export const TypingText = ({ 
  text, 
  speed = 50, 
  cursorBlink = true, 
  className = '', 
  onComplete 
}) => {
  const textRef = useRef(null);
  const { typeText } = useVisualEffects();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (textRef.current && text && !isTyping) {
      setIsTyping(true);
      typeText(textRef.current, text, speed, cursorBlink).then(() => {
        setIsTyping(false);
        if (onComplete) onComplete();
      });
    }
  }, [text, speed, cursorBlink, onComplete, isTyping, typeText]);

  return (
    <span 
      ref={textRef}
      className={`typing-animation ${className}`}
    >
      {text}
    </span>
  );
};

// Static Effect Component
export const StaticEffect = ({ 
  children, 
  duration = 3000, 
  className = '', 
  onStaticComplete 
}) => {
  const staticRef = useRef(null);
  const { staticEffect } = useVisualEffects();

  const handleStatic = () => {
    if (staticRef.current) {
      staticEffect(staticRef.current, duration);
      if (onStaticComplete) {
        setTimeout(onStaticComplete, duration);
      }
    }
  };

  return (
    <div 
      ref={staticRef}
      className={`static-effect ${className}`}
      onClick={handleStatic}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};

// Particle Effect Component
export const ParticleEffect = ({ 
  x, 
  y, 
  color = '#00ffff', 
  count = 20, 
  className = '' 
}) => {
  const { createParticles } = useVisualEffects();

  const handleParticles = () => {
    createParticles(x, y, color, count);
  };

  return (
    <div 
      className={`particle-container ${className}`}
      onClick={handleParticles}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ position: 'absolute', left: x, top: y, width: 1, height: 1 }} />
    </div>
  );
};

// Screen Flicker Component
export const ScreenFlicker = ({ 
  children, 
  duration = 1000, 
  intensity = 0.5, 
  className = '', 
  onFlickerComplete 
}) => {
  const flickerRef = useRef(null);
  const { screenFlicker } = useVisualEffects();

  const handleFlicker = () => {
    if (flickerRef.current) {
      screenFlicker(flickerRef.current, duration, intensity);
      if (onFlickerComplete) {
        setTimeout(onFlickerComplete, duration);
      }
    }
  };

  return (
    <div 
      ref={flickerRef}
      className={`screen-flicker ${className}`}
      onClick={handleFlicker}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};

// Mood Transition Component
export const MoodTransition = ({ 
  children, 
  mood = 'normal', 
  duration = 1000, 
  className = '' 
}) => {
  const moodRef = useRef(null);
  const { moodTransition } = useVisualEffects();

  useEffect(() => {
    if (moodRef.current) {
      moodTransition(moodRef.current, mood, duration);
    }
  }, [mood, duration, moodTransition]);

  return (
    <div 
      ref={moodRef}
      className={`mood-${mood} ${className}`}
    >
      {children}
    </div>
  );
};

// Circuit Pattern Component
export const CircuitPattern = ({ 
  children, 
  duration = 3000, 
  className = '', 
  onPatternComplete 
}) => {
  const circuitRef = useRef(null);
  const { circuitPattern } = useVisualEffects();

  const handleCircuit = () => {
    if (circuitRef.current) {
      circuitPattern(circuitRef.current, duration);
      if (onPatternComplete) {
        setTimeout(onPatternComplete, duration);
      }
    }
  };

  return (
    <div 
      ref={circuitRef}
      className={`circuit-pattern ${className}`}
      onClick={handleCircuit}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};

// Data Stream Component
export const DataStream = ({ 
  children, 
  duration = 2000, 
  className = '', 
  onStreamComplete 
}) => {
  const streamRef = useRef(null);
  const { dataStream } = useVisualEffects();

  const handleStream = () => {
    if (streamRef.current) {
      dataStream(streamRef.current, duration);
      if (onStreamComplete) {
        setTimeout(onStreamComplete, duration);
      }
    }
  };

  return (
    <div 
      ref={streamRef}
      className={`data-stream ${className}`}
      onClick={handleStream}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};

// Hologram Effect Component
export const HologramEffect = ({ 
  children, 
  duration = 3000, 
  className = '', 
  onHologramComplete 
}) => {
  const hologramRef = useRef(null);
  const { hologramEffect } = useVisualEffects();

  const handleHologram = () => {
    if (hologramRef.current) {
      hologramEffect(hologramRef.current, duration);
      if (onHologramComplete) {
        setTimeout(onHologramComplete, duration);
      }
    }
  };

  return (
    <div 
      ref={hologramRef}
      className={`hologram-effect ${className}`}
      onClick={handleHologram}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 20, className = '' }) => {
  return (
    <div 
      className={`loading-spinner ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// Loading Dots Component
export const LoadingDots = ({ className = '' }) => {
  return (
    <span className={`loading-dots ${className}`}>
      Processing
    </span>
  );
};

// Effect Trigger Component
export const EffectTrigger = ({ 
  effect, 
  children, 
  className = '', 
  onComplete,
  ...props 
}) => {
  const effects = useVisualEffects();
  const triggerRef = useRef(null);

  const handleTrigger = () => {
    if (triggerRef.current && effects[effect]) {
      effects[effect](triggerRef.current, ...Object.values(props));
      if (onComplete) {
        setTimeout(onComplete, props.duration || 1000);
      }
    }
  };

  return (
    <div 
      ref={triggerRef}
      className={className}
      onClick={handleTrigger}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};

export default VisualEffectsProvider; 