// Text effects and animations for RALPHBOT
export const applyTextEffects = (text, mood = 'normal') => {
  let processedText = text;
  let textClass = '';

  // Apply mood-based effects
  switch (mood) {
    case 'excited':
      processedText = addExcitementEffects(text);
      textClass = 'text-excited';
      break;
    case 'error':
      processedText = addErrorEffects(text);
      textClass = 'text-error';
      break;
    case 'bored':
      processedText = addBoredomEffects(text);
      textClass = 'text-bored';
      break;
    case 'glitchy':
      processedText = addGlitchEffects(text);
      textClass = 'text-glitch';
      break;
    default:
      processedText = addNormalEffects(text);
      textClass = 'text-normal';
  }

  return {
    processedText,
    textClass,
    originalText: text,
    mood
  };
};

const addExcitementEffects = (text) => {
  // Add excitement indicators and emojis
  let processed = text;
  
  // Add random excitement emojis
  const excitementEmojis = ['⚡', '🌟', '✨', '💫', '🚀', '🔥'];
  const randomEmoji = excitementEmojis[Math.floor(Math.random() * excitementEmojis.length)];
  
  // Add emoji to sentences that end with excitement
  if (text.includes('!') || text.includes('amazing') || text.includes('cool')) {
    processed = processed.replace(/!$/, `! ${randomEmoji}`);
  }
  
  // Add circuit buzzing effects
  if (text.includes('circuit') || text.includes('processor')) {
    processed = processed.replace(/\*circuits?\s+buzzing\*/gi, '*⚡ CIRCUITS BUZZING WITH EXCITEMENT ⚡*');
  }
  
  return processed;
};

const addErrorEffects = (text) => {
  // Add error indicators and glitch effects
  let processed = text;
  
  // Add glitch indicators
  if (text.includes('bzzt') || text.includes('glitch')) {
    processed = processed.replace(/\*bzzt\*/gi, '*⚠️ BZZT - SYSTEM GLITCH ⚠️*');
  }
  
  // Add error emojis
  if (text.includes('sorry') || text.includes('error')) {
    processed = processed.replace(/sorry/gi, 'sorry 😅');
  }
  
  return processed;
};

const addBoredomEffects = (text) => {
  // Add boredom indicators
  let processed = text;
  
  // Add fidgeting effects
  if (text.includes('fidget')) {
    processed = processed.replace(/\*fidgets?\s+with\s+antenna\*/gi, '*😴 fidgets with antenna...*');
  }
  
  // Add yawning effects
  if (text.includes('bored') || text.includes('waiting')) {
    processed = processed.replace(/waiting/gi, 'waiting... 😴');
  }
  
  return processed;
};

const addGlitchEffects = (text) => {
  // Add glitch text effects
  let processed = text;
  
  // Randomly glitch some characters
  const glitchChars = ['@', '#', '$', '%', '&', '*'];
  const words = processed.split(' ');
  
  words.forEach((word, index) => {
    if (Math.random() < 0.3) { // 30% chance to glitch a word
      const glitchChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      words[index] = word.replace(/[aeiou]/gi, glitchChar);
    }
  });
  
  processed = words.join(' ');
  
  // Add glitch indicators
  if (!processed.includes('*bzzt*')) {
    processed = `*bzzt* ${processed} *static*`;
  }
  
  return processed;
};

const addNormalEffects = (text) => {
  // Add subtle normal effects
  let processed = text;
  
  // Add subtle beep effects
  if (text.includes('beep') || text.includes('boop')) {
    processed = processed.replace(/\*beep\s+boop\*/gi, '*🤖 beep boop 🤖*');
  }
  
  return processed;
};

// Animation effects for UI elements
export const getAnimationVariants = (type, mood = 'normal') => {
  const baseVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  switch (type) {
    case 'message':
      return {
        ...baseVariants,
        hidden: { 
          opacity: 0, 
          x: mood === 'error' ? -20 : 20,
          y: mood === 'excited' ? -10 : 0
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 30
          }
        }
      };
    
    case 'button':
      return {
        ...baseVariants,
        hover: { 
          scale: 1.05,
          transition: { duration: 0.2 }
        },
        tap: { 
          scale: 0.95,
          transition: { duration: 0.1 }
        }
      };
    
    case 'container':
      return {
        ...baseVariants,
        hidden: { 
          opacity: 0, 
          y: 50,
          rotateX: mood === 'error' ? 5 : 0
        },
        visible: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 20
          }
        }
      };
    
    default:
      return baseVariants;
  }
};

// Particle effects for excitement
export const createParticleEffect = (element, type = 'excitement') => {
  const particles = [];
  const colors = type === 'excitement' 
    ? ['#FFD700', '#FFA500', '#FF6347'] 
    : ['#FF0000', '#FF4500', '#FF8C00'];
  
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
    `;
    
    const rect = element.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    
    particle.style.left = startX + 'px';
    particle.style.top = startY + 'px';
    
    document.body.appendChild(particle);
    
    // Animate particle
    const animation = particle.animate([
      {
        transform: 'translate(0, 0) scale(1)',
        opacity: 1
      },
      {
        transform: `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(0)`,
        opacity: 0
      }
    ], {
      duration: 1000 + Math.random() * 500,
      easing: 'ease-out'
    });
    
    animation.onfinish = () => {
      document.body.removeChild(particle);
    };
    
    particles.push(particle);
  }
  
  return particles;
};

// Text typing effect
export const typeText = (element, text, speed = 50) => {
  return new Promise((resolve) => {
    let index = 0;
    element.textContent = '';
    
    const typeChar = () => {
      if (index < text.length) {
        element.textContent += text[index];
        index++;
        setTimeout(typeChar, speed);
      } else {
        resolve();
      }
    };
    
    typeChar();
  });
};

// Glitch text effect
export const glitchText = (element, duration = 2000) => {
  const originalText = element.textContent;
  const glitchChars = ['@', '#', '$', '%', '&', '*', '!', '?'];
  
  const glitchInterval = setInterval(() => {
    const glitchedText = originalText.split('').map(char => {
      if (Math.random() < 0.1) {
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      return char;
    }).join('');
    
    element.textContent = glitchedText;
  }, 100);
  
  setTimeout(() => {
    clearInterval(glitchInterval);
    element.textContent = originalText;
  }, duration);
};

export default {
  applyTextEffects,
  getAnimationVariants,
  createParticleEffect,
  typeText,
  glitchText
}; 