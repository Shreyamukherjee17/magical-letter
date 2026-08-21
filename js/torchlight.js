/**
 * TORCHLIGHT ENGINE
 * Smooth physics-based torchlight cursor illumination with realistic flickering & mobile ambient drift.
 */
class TorchlightEngine {
  constructor() {
    this.targetX = window.innerWidth / 2;
    this.targetY = window.innerHeight / 2;
    this.currentX = this.targetX;
    this.currentY = this.targetY;
    
    // Physics easing lerp factor
    this.easing = 0.085;
    
    // Base radius
    this.baseRadius = 320;
    this.currentRadius = this.baseRadius;
    
    // Flickering parameters
    this.time = 0;
    this.flickerIntensity = 1.0;
    
    // Mobile / Idle Ambient Wandering Torch
    this.isIdle = false;
    this.lastMoveTime = Date.now();
    this.idleTimeThreshold = 3500; // ms before ambient wandering begins
    this.idleAngle = 0;

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateBaseRadius();
    this.animate();
  }

  updateBaseRadius() {
    if (window.innerWidth < 600) {
      this.baseRadius = 220;
    } else if (window.innerWidth < 900) {
      this.baseRadius = 270;
    } else {
      this.baseRadius = 340;
    }
  }

  bindEvents() {
    // Mouse Move (Desktop)
    window.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
      this.isIdle = false;
      this.lastMoveTime = Date.now();
    }, { passive: true });

    // Touch Move / Touch Start (Mobile & Tablets)
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.targetX = e.touches[0].clientX;
        this.targetY = e.touches[0].clientY;
        this.isIdle = false;
        this.lastMoveTime = Date.now();
      }
    }, { passive: true });

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.targetX = e.touches[0].clientX;
        this.targetY = e.touches[0].clientY;
        this.isIdle = false;
        this.lastMoveTime = Date.now();
      }
    }, { passive: true });

    // Window Resize
    window.addEventListener('resize', () => {
      this.updateBaseRadius();
    }, { passive: true });
  }

  update() {
    this.time += 0.05;
    const now = Date.now();

    // Check if user is idle -> start gentle ambient wandering torch
    if (now - this.lastMoveTime > this.idleTimeThreshold) {
      this.isIdle = true;
      this.idleAngle += 0.012;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const orbitX = Math.cos(this.idleAngle * 0.7) * (window.innerWidth * 0.22);
      const orbitY = Math.sin(this.idleAngle * 1.1) * (window.innerHeight * 0.16);
      this.targetX = centerX + orbitX;
      this.targetY = centerY + orbitY;
    }

    // Smooth inertia interpolation (LERP)
    this.currentX += (this.targetX - this.currentX) * this.easing;
    this.currentY += (this.targetY - this.currentY) * this.easing;

    // Organic flame flicker calculation
    // Multi-frequency harmonic superposition for organic flame behavior
    const flicker1 = Math.sin(this.time * 7.3) * 0.04;
    const flicker2 = Math.cos(this.time * 13.1) * 0.03;
    const flicker3 = (Math.random() - 0.5) * 0.05;
    this.flickerIntensity = 1.0 + flicker1 + flicker2 + flicker3;

    // Dynamic radius variation
    this.currentRadius = this.baseRadius * (0.96 + this.flickerIntensity * 0.04);

    // Apply coordinates and lighting intensities to CSS Custom Properties
    const root = document.documentElement;
    root.style.setProperty('--torch-x', `${this.currentX.toFixed(1)}px`);
    root.style.setProperty('--torch-y', `${this.currentY.toFixed(1)}px`);
    root.style.setProperty('--torch-radius', `${this.currentRadius.toFixed(1)}px`);
    
    // Dynamic alpha flicker
    const coreAlpha = (0.28 * this.flickerIntensity).toFixed(3);
    const midAlpha = (0.18 * this.flickerIntensity).toFixed(3);
    const edgeAlpha = (0.08 * this.flickerIntensity).toFixed(3);
    root.style.setProperty('--torch-alpha-core', coreAlpha);
    root.style.setProperty('--torch-alpha-mid', midAlpha);
    root.style.setProperty('--torch-alpha-edge', edgeAlpha);

    // Calculate proximity to hero emblem
    const emblem = document.getElementById('hpLogo');
    if (emblem) {
      const rect = emblem.getBoundingClientRect();
      const emblemCenterX = rect.left + rect.width / 2;
      const emblemCenterY = rect.top + rect.height / 2;
      const dist = Math.hypot(this.currentX - emblemCenterX, this.currentY - emblemCenterY);
      
      // Illumination factor (1.0 when directly under torch, decaying to 0.0 outside radius)
      const maxGlowDist = this.currentRadius * 1.35;
      const torchFactor = Math.max(0, Math.min(1, 1 - (dist / maxGlowDist)));
      
      const crestBrightness = (0.65 + torchFactor * 0.55 * this.flickerIntensity).toFixed(3);
      const crestOpacity = (0.60 + torchFactor * 0.40).toFixed(3);
      const crestGlow = (torchFactor * 32 * this.flickerIntensity).toFixed(1);
      
      root.style.setProperty('--crest-brightness', crestBrightness);
      root.style.setProperty('--crest-opacity', crestOpacity);
      root.style.setProperty('--crest-glow', `${crestGlow}px`);
    }
  }

  animate() {
    this.update();
    requestAnimationFrame(() => this.animate());
  }

  getPosition() {
    return { x: this.currentX, y: this.currentY, radius: this.currentRadius };
  }
}
