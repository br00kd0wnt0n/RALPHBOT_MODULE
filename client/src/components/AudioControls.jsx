import React, { useState, useEffect } from 'react';
import { 
  getAudioSettings, 
  updateAudioSettings,
  setMasterVolume,
  setSoundEffectsVolume,
  setVoiceVolume,
  setAmbientVolume,
  mute,
  unmute,
  muteSoundEffects,
  unmuteSoundEffects,
  muteVoice,
  unmuteVoice
  // enableSpatialAudio,
  // disableSpatialAudio
} from '../services/audio';
import '../styles/AudioControls.css';

const AudioControls = ({ isVisible, onClose }) => {
  const [settings, setSettings] = useState({
    masterVolume: 0.7,
    soundEffectsVolume: 0.5,
    voiceVolume: 0.8,
    ambientVolume: 0.3,
    spatialAudio: true,
    voiceEnabled: true,
    soundEffectsEnabled: true,
    ambientEnabled: true
  });

  useEffect(() => {
    const currentSettings = getAudioSettings();
    setSettings(currentSettings);
  }, []);

  const handleVolumeChange = (type, value) => {
    const newSettings = { ...settings, [type]: value };
    setSettings(newSettings);
    updateAudioSettings(newSettings);
    
    // Update individual volume controls
    switch (type) {
      case 'masterVolume':
        setMasterVolume(value);
        break;
      case 'soundEffectsVolume':
        setSoundEffectsVolume(value);
        break;
      case 'voiceVolume':
        setVoiceVolume(value);
        break;
      case 'ambientVolume':
        setAmbientVolume(value);
        break;
    }
  };

  const handleToggle = (type) => {
    const newSettings = { ...settings, [type]: !settings[type] };
    setSettings(newSettings);
    updateAudioSettings(newSettings);
    
    // Handle specific toggles
    switch (type) {
      case 'voiceEnabled':
        if (newSettings.voiceEnabled) {
          unmuteVoice();
        } else {
          muteVoice();
        }
        break;
      case 'soundEffectsEnabled':
        if (newSettings.soundEffectsEnabled) {
          unmuteSoundEffects();
        } else {
          muteSoundEffects();
        }
        break;
      case 'spatialAudio':
        if (newSettings.spatialAudio) {
          // enableSpatialAudio(); // Temporarily commented out
        } else {
          // disableSpatialAudio(); // Temporarily commented out
        }
        break;
    }
  };

  const handleMasterMute = () => {
    if (settings.masterVolume > 0) {
      mute();
      setSettings(prev => ({ ...prev, masterVolume: 0 }));
    } else {
      unmute();
      setSettings(prev => ({ ...prev, masterVolume: 0.7 }));
      setMasterVolume(0.7);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="audio-controls-overlay" onClick={onClose}>
      <div className="audio-controls-panel" onClick={(e) => e.stopPropagation()}>
        <div className="audio-controls-header">
          <h3>🎵 Audio Settings</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="audio-controls-content">
          {/* Master Volume */}
          <div className="volume-control">
            <div className="volume-label">
              <span>🔊 Master Volume</span>
              <button 
                className="mute-btn"
                onClick={handleMasterMute}
                title={settings.masterVolume > 0 ? 'Mute' : 'Unmute'}
              >
                {settings.masterVolume > 0 ? '🔊' : '🔇'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.masterVolume}
              onChange={(e) => handleVolumeChange('masterVolume', parseFloat(e.target.value))}
              className="volume-slider"
            />
            <span className="volume-value">{Math.round(settings.masterVolume * 100)}%</span>
          </div>

          {/* Sound Effects */}
          <div className="volume-control">
            <div className="volume-label">
              <span>🎵 Sound Effects</span>
              <button 
                className="toggle-btn"
                onClick={() => handleToggle('soundEffectsEnabled')}
                title={settings.soundEffectsEnabled ? 'Disable' : 'Enable'}
              >
                {settings.soundEffectsEnabled ? '✅' : '❌'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.soundEffectsVolume}
              onChange={(e) => handleVolumeChange('soundEffectsVolume', parseFloat(e.target.value))}
              className="volume-slider"
              disabled={!settings.soundEffectsEnabled}
            />
            <span className="volume-value">{Math.round(settings.soundEffectsVolume * 100)}%</span>
          </div>

          {/* Voice */}
          <div className="volume-control">
            <div className="volume-label">
              <span>🎤 Voice</span>
              <button 
                className="toggle-btn"
                onClick={() => handleToggle('voiceEnabled')}
                title={settings.voiceEnabled ? 'Disable' : 'Enable'}
              >
                {settings.voiceEnabled ? '✅' : '❌'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.voiceVolume}
              onChange={(e) => handleVolumeChange('voiceVolume', parseFloat(e.target.value))}
              className="volume-slider"
              disabled={!settings.voiceEnabled}
            />
            <span className="volume-value">{Math.round(settings.voiceVolume * 100)}%</span>
          </div>

          {/* Ambient */}
          <div className="volume-control">
            <div className="volume-label">
              <span>🌌 Ambient</span>
              <button 
                className="toggle-btn"
                onClick={() => handleToggle('ambientEnabled')}
                title={settings.ambientEnabled ? 'Disable' : 'Enable'}
              >
                {settings.ambientEnabled ? '✅' : '❌'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.ambientVolume}
              onChange={(e) => handleVolumeChange('ambientVolume', parseFloat(e.target.value))}
              className="volume-slider"
              disabled={!settings.ambientEnabled}
            />
            <span className="volume-value">{Math.round(settings.ambientVolume * 100)}%</span>
          </div>

          {/* Audio Features */}
          <div className="audio-features">
            <div className="feature-toggle">
              <span>🎧 Spatial Audio</span>
              <button 
                className={`toggle-btn ${settings.spatialAudio ? 'active' : ''}`}
                onClick={() => handleToggle('spatialAudio')}
                title={settings.spatialAudio ? 'Disable' : 'Enable'}
              >
                {settings.spatialAudio ? '✅' : '❌'}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="audio-presets">
            <h4>🎛️ Quick Presets</h4>
            <div className="preset-buttons">
              <button 
                className="preset-btn"
                onClick={() => {
                  updateAudioSettings({
                    masterVolume: 0.5,
                    soundEffectsVolume: 0.3,
                    voiceVolume: 0.7,
                    ambientVolume: 0.2
                  });
                  setSettings(getAudioSettings());
                }}
              >
                🏠 Home
              </button>
              <button 
                className="preset-btn"
                onClick={() => {
                  updateAudioSettings({
                    masterVolume: 0.8,
                    soundEffectsVolume: 0.6,
                    voiceVolume: 0.9,
                    ambientVolume: 0.4
                  });
                  setSettings(getAudioSettings());
                }}
              >
                🎮 Gaming
              </button>
              <button 
                className="preset-btn"
                onClick={() => {
                  updateAudioSettings({
                    masterVolume: 0.3,
                    soundEffectsVolume: 0.2,
                    voiceVolume: 0.5,
                    ambientVolume: 0.1
                  });
                  setSettings(getAudioSettings());
                }}
              >
                📚 Quiet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioControls; 