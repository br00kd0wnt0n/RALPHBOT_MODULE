// RALPHBOT Visual Effects Utility
// Comprehensive visual effects for sci-fi droid experience

class VisualEffects {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animations = new Map();
    this.isInitialized = false;
  }

  // Initialize canvas for particle effects
  initCanvas(container) {
    if (this.isInitialized) return;

    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1000';
    this.canvas.width = container.offsetWidth;
    this.canvas.height = container.offsetHeight;

    this.ctx = this.canvas.getContext('2d');
    container.appendChild(this.canvas);
    this.isInitialized = true;

    // Handle resize
    window.addEventListener('resize', () => {
      this.canvas.width = container.offsetWidth;
      this.canvas.height = container.offsetHeight;
    });
  }

  // Glitch text effect
  applyGlitchEffect(element, duration = 2000, intensity = 0.3) {
    const originalText = element.textContent;
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let startTime = Date.now();

    const glitchInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        element.textContent = originalText;
        element.style.textShadow = '';
        element.style.transform = '';
        clearInterval(glitchInterval);
        return;
      }

      // Random glitch characters
      const glitchText = originalText.split('').map((char, index) => {
        if (Math.random() < intensity * (1 - progress)) {
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        return char;
      }).join('');

      element.textContent = glitchText;

      // Glitch positioning
      const offsetX = (Math.random() - 0.5) * 4 * intensity;
      const offsetY = (Math.random() - 0.5) * 2 * intensity;
      element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

      // Glitch color effects
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      element.style.textShadow = `
        ${offsetX}px ${offsetY}px 0 ${color},
        ${-offsetX}px ${-offsetY}px 0 ${color}
      `;
    }, 50);
  }

  // Typing animation with cursor effects
  typeText(element, text, speed = 50, cursorBlink = true) {
    return new Promise((resolve) => {
      element.textContent = '';
      let index = 0;
      const cursor = cursorBlink ? '|' : '';

      const typeInterval = setInterval(() => {
        if (index < text.length) {
          element.textContent = text.substring(0, index + 1) + cursor;
          index++;
        } else {
          element.textContent = text;
          clearInterval(typeInterval);
          resolve();
        }
      }, speed);

      // Cursor blink effect
      if (cursorBlink) {
        let cursorVisible = true;
        const blinkInterval = setInterval(() => {
          if (index >= text.length) {
            clearInterval(blinkInterval);
            return;
          }
          cursorVisible = !cursorVisible;
          element.textContent = text.substring(0, index) + (cursorVisible ? cursor : '');
        }, 500);
      }
    });
  }

  // Static/interference effect during thinking
  applyStaticEffect(element, duration = 3000) {
    const originalContent = element.innerHTML;
    const staticChars = '█▓▒░▄▌▐▀■□▪▫▬▭▮▯▰▱▲△▴▵▶▷▸▹►▻▼▽▾▿◀◁◂◃◄◅◆◇◈◉◊○◌◍◎●◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡◢◣◤◥◦◧◨◩◪◫◬◭◮◯';
    let startTime = Date.now();

    const staticInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        element.innerHTML = originalContent;
        element.style.opacity = '1';
        clearInterval(staticInterval);
        return;
      }

      // Generate static pattern
      const staticText = Array.from({ length: 20 }, () => 
        staticChars[Math.floor(Math.random() * staticChars.length)]
      ).join('');

      element.innerHTML = staticText;
      element.style.opacity = 0.7 + (Math.random() * 0.3);
    }, 100);
  }

  // Particle effects for excitement
  createParticleEffect(x, y, color = '#00ffff', count = 20) {
    if (!this.isInitialized) return;

    for (let i = 0; i < count; i++) {
      const particle = {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        size: 2 + Math.random() * 4,
        color: color,
        alpha: 1.0
      };
      this.particles.push(particle);
    }

    this.animateParticles();
  }

  // Animate particles
  animateParticles() {
    if (this.particles.length === 0) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      particle.alpha = particle.life;

      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Draw particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animateParticles());
    }
  }

  // Screen flicker for errors
  applyScreenFlicker(element, duration = 1000, intensity = 0.5) {
    const originalOpacity = element.style.opacity || '1';
    let startTime = Date.now();

    const flickerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        element.style.opacity = originalOpacity;
        element.style.filter = '';
        clearInterval(flickerInterval);
        return;
      }

      // Random flicker
      const flicker = Math.random() < intensity * (1 - progress);
      element.style.opacity = flicker ? '0.3' : originalOpacity;
      
      // Red tint for error
      element.style.filter = `hue-rotate(${Math.random() * 30}deg) saturate(1.5)`;
    }, 50);
  }

  // Smooth mood transitions
  applyMoodTransition(element, mood, duration = 1000) {
    const moodStyles = {
      normal: {
        color: '#ffffff',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
        transform: 'scale(1)',
        filter: 'hue-rotate(0deg)'
      },
      excited: {
        color: '#ffff00',
        textShadow: '0 0 20px rgba(255, 255, 0, 0.8)',
        transform: 'scale(1.05)',
        filter: 'hue-rotate(60deg) saturate(1.2)'
      },
      error: {
        color: '#ff4444',
        textShadow: '0 0 15px rgba(255, 68, 68, 0.7)',
        transform: 'scale(0.95)',
        filter: 'hue-rotate(-30deg) saturate(1.5)'
      },
      bored: {
        color: '#888888',
        textShadow: '0 0 5px rgba(136, 136, 136, 0.3)',
        transform: 'scale(0.98)',
        filter: 'hue-rotate(0deg) saturate(0.7)'
      }
    };

    const targetStyle = moodStyles[mood] || moodStyles.normal;
    
    element.style.transition = `all ${duration}ms ease-in-out`;
    Object.assign(element.style, targetStyle);

    // Reset transition after animation
    setTimeout(() => {
      element.style.transition = '';
    }, duration);
  }

  // Circuit pattern animation
  createCircuitPattern(element, duration = 3000) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';
    
    const rect = element.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    element.style.position = 'relative';
    element.appendChild(canvas);

    const startTime = Date.now();
    const nodes = [];
    const connections = [];

    // Create circuit nodes
    for (let i = 0; i < 8; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        active: false,
        pulse: 0
      });
    }

    // Create connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < 0.3) {
          connections.push({
            from: i,
            to: j,
            active: false,
            progress: 0
          });
        }
      }
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        element.removeChild(canvas);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animate nodes
      nodes.forEach((node, index) => {
        if (Math.random() < 0.02) {
          node.active = true;
          node.pulse = 1;
        }

        if (node.active) {
          node.pulse -= 0.05;
          if (node.pulse <= 0) {
            node.active = false;
            node.pulse = 0;
          }

          // Draw active node
          ctx.save();
          ctx.globalAlpha = node.pulse;
          ctx.fillStyle = '#00ffff';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw inactive node
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Animate connections
      connections.forEach(conn => {
        if (nodes[conn.from].active || nodes[conn.to].active) {
          conn.active = true;
          conn.progress = 1;
        }

        if (conn.active) {
          conn.progress -= 0.02;
          if (conn.progress <= 0) {
            conn.active = false;
            conn.progress = 0;
          }

          // Draw active connection
          const from = nodes[conn.from];
          const to = nodes[conn.to];
          
          ctx.save();
          ctx.globalAlpha = conn.progress;
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  // Data stream effect
  createDataStream(element, duration = 2000) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';
    
    const rect = element.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    element.style.position = 'relative';
    element.appendChild(canvas);

    const startTime = Date.now();
    const streams = [];

    // Create data streams
    for (let i = 0; i < 5; i++) {
      streams.push({
        x: Math.random() * canvas.width,
        y: 0,
        speed: 2 + Math.random() * 3,
        chars: '01',
        length: 10 + Math.floor(Math.random() * 20)
      });
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        element.removeChild(canvas);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      streams.forEach(stream => {
        // Update stream position
        stream.y += stream.speed;
        if (stream.y > canvas.height) {
          stream.y = -20;
          stream.x = Math.random() * canvas.width;
        }

        // Draw stream
        ctx.save();
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        
        for (let i = 0; i < stream.length; i++) {
          const char = stream.chars[Math.floor(Math.random() * stream.chars.length)];
          const alpha = 1 - (i / stream.length);
          ctx.globalAlpha = alpha;
          ctx.fillText(char, stream.x, stream.y - (i * 15));
        }
        
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  // Hologram effect
  applyHologramEffect(element, duration = 3000) {
    const originalOpacity = element.style.opacity || '1';
    let startTime = Date.now();

    const hologramInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        element.style.opacity = originalOpacity;
        element.style.filter = '';
        element.style.transform = '';
        clearInterval(hologramInterval);
        return;
      }

      // Hologram flicker
      const flicker = 0.7 + (Math.sin(elapsed * 0.01) * 0.3);
      element.style.opacity = flicker;

      // Hologram color shift
      const hue = (elapsed * 0.1) % 360;
      element.style.filter = `hue-rotate(${hue}deg) saturate(1.2)`;

      // Slight movement
      const moveX = Math.sin(elapsed * 0.005) * 2;
      const moveY = Math.cos(elapsed * 0.003) * 1;
      element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }, 50);
  }

  // Cleanup
  destroy() {
    this.particles = [];
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
const visualEffects = new VisualEffects();

// Export functions for easy use
export const initVisualEffects = (container) => visualEffects.initCanvas(container);
export const applyGlitchEffect = (element, duration, intensity) => visualEffects.applyGlitchEffect(element, duration, intensity);
export const typeText = (element, text, speed, cursorBlink) => visualEffects.typeText(element, text, speed, cursorBlink);
export const applyStaticEffect = (element, duration) => visualEffects.applyStaticEffect(element, duration);
export const createParticleEffect = (x, y, color, count) => visualEffects.createParticleEffect(x, y, color, count);
export const applyScreenFlicker = (element, duration, intensity) => visualEffects.applyScreenFlicker(element, duration, intensity);
export const applyMoodTransition = (element, mood, duration) => visualEffects.applyMoodTransition(element, mood, duration);
export const createCircuitPattern = (element, duration) => visualEffects.createCircuitPattern(element, duration);
export const createDataStream = (element, duration) => visualEffects.createDataStream(element, duration);
export const applyHologramEffect = (element, duration) => visualEffects.applyHologramEffect(element, duration);
export const destroyVisualEffects = () => visualEffects.destroy();

export default visualEffects; 