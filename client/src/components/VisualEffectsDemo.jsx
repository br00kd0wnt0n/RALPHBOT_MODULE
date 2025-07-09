import React, { useState } from 'react';
import {
  VisualEffectsProvider,
  GlitchText,
  TypingText,
  StaticEffect,
  ParticleEffect,
  ScreenFlicker,
  MoodTransition,
  CircuitPattern,
  DataStream,
  HologramEffect,
  LoadingSpinner,
  LoadingDots,
  useVisualEffects
} from './VisualEffects';
import '../styles/visualEffects.css';

const VisualEffectsDemo = () => {
  const [activeEffect, setActiveEffect] = useState(null);
  const [demoText, setDemoText] = useState('Hello, I am RALPHBOT! 🤖');
  const [currentMood, setCurrentMood] = useState('normal');

  const effects = [
    {
      name: 'Glitch Text',
      component: <GlitchText duration={2000} intensity={0.4}>{demoText}</GlitchText>,
      description: 'Text with glitch effects and character substitution'
    },
    {
      name: 'Typing Animation',
      component: <TypingText text={demoText} speed={50} cursorBlink={true} />,
      description: 'Character-by-character typing with cursor effects'
    },
    {
      name: 'Static Effect',
      component: <StaticEffect duration={3000}>{demoText}</StaticEffect>,
      description: 'Static noise and interference patterns'
    },
    {
      name: 'Particle Effect',
      component: <ParticleEffect x={150} y={100} color="#00ffff" count={30} />,
      description: 'Canvas-based particle system with physics'
    },
    {
      name: 'Screen Flicker',
      component: <ScreenFlicker duration={1500} intensity={0.6}>{demoText}</ScreenFlicker>,
      description: 'Screen flicker and brightness variations'
    },
    {
      name: 'Mood Transitions',
      component: <MoodTransition mood={currentMood} duration={1000}>{demoText}</MoodTransition>,
      description: 'Smooth mood-based color and style transitions'
    },
    {
      name: 'Circuit Pattern',
      component: <CircuitPattern duration={3000}>{demoText}</CircuitPattern>,
      description: 'Animated circuit patterns with nodes and connections'
    },
    {
      name: 'Data Stream',
      component: <DataStream duration={2000}>{demoText}</DataStream>,
      description: 'Matrix-style falling data characters'
    },
    {
      name: 'Hologram Effect',
      component: <HologramEffect duration={3000}>{demoText}</HologramEffect>,
      description: 'Holographic appearance with color shifting'
    }
  ];

  const moods = ['normal', 'excited', 'error', 'bored'];

  return (
    <VisualEffectsProvider>
      <div className="visual-effects-demo">
        <div className="demo-header">
          <h1>🎭 RALPHBOT Visual Effects Demo</h1>
          <p>Explore the comprehensive visual effects system</p>
        </div>

        <div className="demo-controls">
          <div className="control-group">
            <label>Demo Text:</label>
            <input
              type="text"
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              placeholder="Enter text to animate..."
            />
          </div>

          <div className="control-group">
            <label>Mood:</label>
            <select value={currentMood} onChange={(e) => setCurrentMood(e.target.value)}>
              {moods.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="effects-grid">
          {effects.map((effect, index) => (
            <div key={index} className="effect-card">
              <h3>{effect.name}</h3>
              <div className="effect-preview">
                {effect.component}
              </div>
              <p className="effect-description">{effect.description}</p>
              <button
                className="trigger-btn"
                onClick={() => setActiveEffect(effect.name)}
              >
                Trigger Effect
              </button>
            </div>
          ))}
        </div>

        <div className="loading-demo">
          <h3>Loading Effects</h3>
          <div className="loading-examples">
            <div className="loading-item">
              <LoadingSpinner size={30} />
              <span>Spinner</span>
            </div>
            <div className="loading-item">
              <LoadingDots />
            </div>
          </div>
        </div>

        <div className="demo-info">
          <h3>🎨 Visual Effects Features</h3>
          <ul>
            <li><strong>Glitch Effects:</strong> Text distortion, character substitution, color channel separation</li>
            <li><strong>Typing Animations:</strong> Character-by-character display, cursor effects, speed control</li>
            <li><strong>Static/Interference:</strong> Noise patterns, color shifting, mood-based intensity</li>
            <li><strong>Particle Systems:</strong> Canvas-based physics, life cycle management, color customization</li>
            <li><strong>Screen Effects:</strong> Flicker, brightness variations, error states</li>
            <li><strong>Mood Transitions:</strong> Smooth color changes, text shadows, scale animations</li>
            <li><strong>Circuit Patterns:</strong> Animated nodes, flow effects, connection visualization</li>
            <li><strong>Data Streams:</strong> Matrix-style falling characters, customizable content</li>
            <li><strong>Hologram Effects:</strong> Color shifting, scan lines, transparency variations</li>
          </ul>
        </div>

        <div className="performance-info">
          <h3>⚡ Performance Features</h3>
          <ul>
            <li>GPU-accelerated CSS animations</li>
            <li>Canvas optimization with requestAnimationFrame</li>
            <li>Object pooling for particle systems</li>
            <li>Reduced motion support for accessibility</li>
            <li>Memory management and cleanup</li>
            <li>Responsive design for mobile devices</li>
          </ul>
        </div>
      </div>
    </VisualEffectsProvider>
  );
};

export default VisualEffectsDemo; 