/**
 * STORM & ATMOSPHERIC PARTICLES ENGINE
 * Multi-layer 60fps canvas rain simulation, procedural lightning flashes, and golden ember dust.
 */
class StormEngine {
  constructor(torchEngine) {
    this.torchEngine = torchEngine;
    this.rainCanvas = document.getElementById('rainCanvas');
    this.rainCtx = this.rainCanvas.getContext('2d');
    this.particlesCanvas = document.getElementById('particlesCanvas');
    this.particlesCtx = this.particlesCanvas.getContext('2d');
    this.lightningElement = document.getElementById('lightningFlash');

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Raindrop collections
    this.raindrops = [];
    this.splashes = [];
    this.totalDrops = this.getOptimalDropCount();

    // Embers collection
    this.embers = [];
    this.totalEmbers = 45;

    // Lightning parameters
    this.nextLightningTime = Date.now() + this.getRandomLightningInterval();
    this.isLightningActive = false;

    this.init();
  }

  getOptimalDropCount() {
    // Scale particles based on screen resolution for 60fps performance
    const pixels = window.innerWidth * window.innerHeight;
    if (pixels < 500000) return 90; // Mobile
    if (pixels < 1200000) return 180; // Tablet/Laptop
    return 280; // Desktop
  }

  init() {
    this.resizeCanvases();
    this.createRaindrops();
    this.createEmbers();
    this.bindEvents();
    this.animate();
  }

  resizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.rainCanvas.width = this.width * dpr;
    this.rainCanvas.height = this.height * dpr;
    this.rainCtx.scale(dpr, dpr);

    this.particlesCanvas.width = this.width * dpr;
    this.particlesCanvas.height = this.height * dpr;
    this.particlesCtx.scale(dpr, dpr);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvases();
      this.totalDrops = this.getOptimalDropCount();
      this.createRaindrops();
    }, { passive: true });
  }

  createRaindrops() {
    this.raindrops = [];
    for (let i = 0; i < this.totalDrops; i++) {
      // 3 Depth Layers: 1 (Distant/Slow), 2 (Mid), 3 (Foreground/Fast)
      const layer = Math.random() < 0.5 ? 1 : (Math.random() < 0.7 ? 2 : 3);
      this.raindrops.push({
        x: Math.random() * (this.width + 200) - 100,
        y: Math.random() * this.height,
        layer: layer,
        speed: layer === 1 ? 12 + Math.random() * 4 : (layer === 2 ? 18 + Math.random() * 6 : 26 + Math.random() * 8),
        length: layer === 1 ? 14 + Math.random() * 8 : (layer === 2 ? 24 + Math.random() * 12 : 38 + Math.random() * 16),
        alpha: layer === 1 ? 0.12 : (layer === 2 ? 0.25 : 0.42),
        wind: 1.8 + Math.random() * 0.8
      });
    }
  }

  createEmbers() {
    this.embers = [];
    for (let i = 0; i < this.totalEmbers; i++) {
      this.embers.push(this.spawnEmber(true));
    }
  }

  spawnEmber(initial = false) {
    const torchPos = this.torchEngine ? this.torchEngine.getPosition() : { x: this.width / 2, y: this.height / 2, radius: 300 };
    // Spawn within torch radius or ambient around center
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (torchPos.radius * 0.9);
    return {
      x: torchPos.x + Math.cos(angle) * dist,
      y: initial ? Math.random() * this.height : (torchPos.y + Math.sin(angle) * dist + (Math.random() * 40 - 20)),
      size: 1 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(0.4 + Math.random() * 0.8), // Floating upward
      alpha: 0.1 + Math.random() * 0.6,
      maxAlpha: 0.3 + Math.random() * 0.5,
      life: 0,
      maxLife: 150 + Math.random() * 200,
      hue: Math.random() < 0.7 ? '#ffd166' : '#f5a623'
    };
  }

  getRandomLightningInterval() {
    // Random lightning strike between 10s and 22s
    return 10000 + Math.random() * 12000;
  }

  triggerLightning() {
    if (this.isLightningActive) return;
    this.isLightningActive = true;

    const isDramatic = Math.random() > 0.45;
    const flashClass = isDramatic ? 'active-flash' : 'subtle-flash';

    // Pulse 1: Initial spike
    this.lightningElement.classList.add(flashClass);

    setTimeout(() => {
      // Dip
      this.lightningElement.classList.remove(flashClass);

      setTimeout(() => {
        // Pulse 2: Secondary thunderous aftershock
        this.lightningElement.classList.add(flashClass);

        setTimeout(() => {
          this.lightningElement.classList.remove(flashClass);
          this.isLightningActive = false;
          this.nextLightningTime = Date.now() + this.getRandomLightningInterval();
        }, isDramatic ? 140 : 80);
      }, 70);
    }, isDramatic ? 120 : 60);
  }

  updateRain() {
    this.rainCtx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.raindrops.length; i++) {
      const drop = this.raindrops[i];

      this.rainCtx.strokeStyle = `rgba(195, 218, 245, ${drop.alpha})`;
      this.rainCtx.lineWidth = drop.layer === 3 ? 1.5 : (drop.layer === 2 ? 1.0 : 0.6);
      this.rainCtx.beginPath();
      this.rainCtx.moveTo(drop.x, drop.y);
      this.rainCtx.lineTo(drop.x + drop.wind * 2, drop.y + drop.length);
      this.rainCtx.stroke();

      drop.x += drop.wind;
      drop.y += drop.speed;

      // Ground splash probability for foreground drops
      if (drop.y >= this.height - 20 && drop.layer >= 2 && Math.random() < 0.25) {
        this.splashes.push({
          x: drop.x,
          y: this.height - Math.random() * 15,
          radius: 1 + Math.random() * 2.5,
          alpha: 0.5,
          life: 0,
          maxLife: 10
        });
      }

      // Reset drop when offscreen
      if (drop.y > this.height) {
        drop.y = -drop.length - Math.random() * 50;
        drop.x = Math.random() * (this.width + 200) - 100;
      }
    }

    // Render splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.life++;
      s.alpha *= 0.85;

      this.rainCtx.strokeStyle = `rgba(200, 225, 255, ${s.alpha})`;
      this.rainCtx.lineWidth = 0.8;
      this.rainCtx.beginPath();
      this.rainCtx.arc(s.x, s.y, s.radius * (s.life / 3), 0, Math.PI * 2);
      this.rainCtx.stroke();

      if (s.life >= s.maxLife || s.alpha < 0.05) {
        this.splashes.splice(i, 1);
      }
    }
  }

  updateEmbers() {
    this.particlesCtx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.embers.length; i++) {
      const e = this.embers[i];
      e.life++;
      e.x += e.vx + Math.sin(e.life * 0.04) * 0.3;
      e.y += e.vy;

      // Fade in and fade out
      const progress = e.life / e.maxLife;
      let currentAlpha = e.maxAlpha;
      if (progress < 0.2) currentAlpha = e.maxAlpha * (progress / 0.2);
      else if (progress > 0.7) currentAlpha = e.maxAlpha * (1 - (progress - 0.7) / 0.3);

      this.particlesCtx.fillStyle = e.hue;
      this.particlesCtx.globalAlpha = Math.max(0, currentAlpha);
      this.particlesCtx.shadowBlur = 6;
      this.particlesCtx.shadowColor = '#f5a623';

      this.particlesCtx.beginPath();
      this.particlesCtx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      this.particlesCtx.fill();

      // Reset dead embers
      if (e.life >= e.maxLife || e.y < -10) {
        this.embers[i] = this.spawnEmber(false);
      }
    }
    this.particlesCtx.globalAlpha = 1;
    this.particlesCtx.shadowBlur = 0;
  }

  animate() {
    this.updateRain();
    this.updateEmbers();

    // Check lightning trigger
    if (Date.now() >= this.nextLightningTime) {
      this.triggerLightning();
    }

    requestAnimationFrame(() => this.animate());
  }
}
