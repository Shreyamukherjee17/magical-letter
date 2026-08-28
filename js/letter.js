/**
 * CINEMATIC HOGWARTS LETTER TRANSITION & MAGICAL PARTICLE ENGINE
 * Orchestrates the slow, elegant transition:
 * OPEN THE LETTER -> Darkness -> Magical particles -> Parchment appears -> Letter unfolds -> Birthday letter is revealed
 */

class LetterParticlesSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.particles = [];
    this.animationId = null;
    this.isVortex = false;
    this.isRunning = false;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', this.resize);
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  startVortex(duration = 2400) {
    this.isRunning = true;
    this.isVortex = true;
    this.particles = [];

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Spawn burst of swirling magical lumos particles
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 180 + Math.random() * 380;
      this.particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 1.5 + Math.random() * 2.8,
        angle: angle,
        orbitRadius: radius,
        speed: 0.025 + Math.random() * 0.035,
        inwardSpeed: 1.8 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.8,
        color: Math.random() > 0.3 ? '#ffd166' : '#f5a623',
        decay: 0.004 + Math.random() * 0.008,
        trail: []
      });
    }

    if (!this.animationId) {
      this.loop();
    }

    // After vortex duration, transition to gentle ambient floating dust
    setTimeout(() => {
      this.isVortex = false;
      this.initAmbientParticles();
    }, duration);
  }

  initAmbientParticles() {
    this.particles = [];
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: 0.8 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.35,
        alpha: 0.15 + Math.random() * 0.5,
        color: '#ffd166',
        flickerSpeed: 0.015 + Math.random() * 0.025,
        flickerPhase: Math.random() * Math.PI * 2
      });
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  loop() {
    if (!this.isRunning || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    if (this.isVortex) {
      // Swirling golden vortex
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.angle += p.speed;
        p.orbitRadius = Math.max(10, p.orbitRadius - p.inwardSpeed);
        p.x = centerX + Math.cos(p.angle) * p.orbitRadius;
        p.y = centerY + Math.sin(p.angle) * p.orbitRadius;

        // Draw glowing particle
        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = p.color;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        if (p.orbitRadius <= 15) {
          p.alpha -= p.decay * 2;
        }

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }
    } else {
      // Gentle ambient golden dust floating around parchment
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.flickerPhase += p.flickerSpeed;
        const dynamicAlpha = p.alpha * (0.65 + 0.35 * Math.sin(p.flickerPhase));

        if (p.y < -10) p.y = this.canvas.height + 10;
        if (p.x < -10) p.x = this.canvas.width + 10;
        if (p.x > this.canvas.width + 10) p.x = -10;

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, dynamicAlpha);
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = p.color;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    this.animationId = requestAnimationFrame(this.loop);
  }
}

class LetterTransitionEngine {
  constructor() {
    this.openBtn = document.getElementById('btnOpenLetter');
    this.closeBtn = document.getElementById('btnCloseLetter');
    this.letterScreen = document.getElementById('letterScreen');
    this.parchmentWrapper = document.getElementById('parchmentWrapper');
    this.scrollArea = document.querySelector('.parchment-letter-scroll-area');
    this.heroContent = document.getElementById('heroContent');
    this.rainCanvas = document.getElementById('rainCanvas');
    this.castleBackdrop = document.getElementById('castleBackdrop');
    this.particlesCanvas = document.getElementById('letterParticlesCanvas');

    this.particlesSystem = this.particlesCanvas ? new LetterParticlesSystem(this.particlesCanvas) : null;

    this.isOpen = false;
    this.isTransitioning = false;

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.startCinematicTransition();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.returnToCastleGrounds();
      });
    }

    // Keyboard Accessibility (Escape key closes parchment)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen && !this.isTransitioning) {
        this.returnToCastleGrounds();
      }
    });
  }

  /**
   * Orchestrates the slow, cinematic letter reveal sequence:
   * OPEN THE LETTER -> Darkness -> Magical particles -> Parchment appears -> Letter unfolds -> Birthday letter is revealed
   */
  startCinematicTransition() {
    if (this.isOpen || this.isTransitioning) return;
    this.isOpen = true;
    this.isTransitioning = true;

    // Reset scroll position on start
    if (this.scrollArea) {
      this.scrollArea.scrollTop = 0;
    }

    // 1. DARKNESS: Fade homepage content, rain, and castle lighting into darkness
    if (this.heroContent) {
      this.heroContent.style.transition = 'opacity 1.2s ease, transform 1.2s ease, filter 1.2s ease';
      this.heroContent.style.opacity = '0';
      this.heroContent.style.transform = 'scale(0.92) translateY(24px)';
      this.heroContent.style.filter = 'blur(10px)';
      this.heroContent.style.pointerEvents = 'none';
    }

    if (this.rainCanvas) {
      this.rainCanvas.style.transition = 'opacity 1.4s ease';
      this.rainCanvas.style.opacity = '0.08';
    }

    if (this.castleBackdrop) {
      this.castleBackdrop.style.transition = 'filter 1.5s ease';
      this.castleBackdrop.style.filter = 'brightness(0.08) contrast(1.15)';
    }

    // 2. MAGICAL PARTICLES: Activate chamber modal & launch swirling golden vortex
    setTimeout(() => {
      if (this.letterScreen) {
        this.letterScreen.classList.add('active');
      }

      if (this.particlesSystem) {
        this.particlesSystem.startVortex(2000);
      }

      // 3. PARCHMENT APPEARS & 4. LETTER UNFOLDS
      setTimeout(() => {
        if (this.parchmentWrapper) {
          this.parchmentWrapper.classList.add('visible');
          this.parchmentWrapper.classList.add('unfolding');
        }

        // 5. BIRTHDAY LETTER IS REVEALED & STABILIZED
        setTimeout(() => {
          if (this.parchmentWrapper) {
            this.parchmentWrapper.classList.remove('unfolding');
          }
          this.isTransitioning = false;
        }, 1600);

      }, 1000);

    }, 800);
  }

  /**
   * Reverses the transition and smoothly returns to the castle storm
   */
  returnToCastleGrounds() {
    if (!this.isOpen || this.isTransitioning) return;
    this.isTransitioning = true;

    // Fade parchment letter
    if (this.parchmentWrapper) {
      this.parchmentWrapper.classList.remove('visible');
    }

    if (this.particlesSystem) {
      this.particlesSystem.stop();
    }

    setTimeout(() => {
      if (this.letterScreen) {
        this.letterScreen.classList.remove('active');
      }

      // Restore hero screen, storm rain, and castle lighting
      if (this.rainCanvas) {
        this.rainCanvas.style.opacity = '0.75';
      }

      if (this.castleBackdrop) {
        this.castleBackdrop.style.filter = 'brightness(0.4) contrast(1.15) saturate(0.85)';
      }

      if (this.heroContent) {
        this.heroContent.style.opacity = '1';
        this.heroContent.style.transform = 'scale(1) translateY(0)';
        this.heroContent.style.filter = 'blur(0)';
        this.heroContent.style.pointerEvents = 'auto';
      }

      this.isOpen = false;
      this.isTransitioning = false;
    }, 700);
  }
}
