/**
 * WAND CURSOR & MAGICAL SPARK TRAIL ENGINE
 * Handles wand tip glowing flares, interactive hover states, and spark burst emissions.
 */
class WandCursorEngine {
  constructor() {
    this.tipGlow = null;
    this.sparks = [];
    this.lastX = 0;
    this.lastY = 0;
    this.isHoveringInteractive = false;

    this.init();
  }

  init() {
    this.createGlowElement();
    this.bindEvents();
  }

  createGlowElement() {
    this.tipGlow = document.createElement('div');
    this.tipGlow.className = 'wand-tip-glow';
    document.body.appendChild(this.tipGlow);
  }

  bindEvents() {
    // Track pointer movement
    window.addEventListener('mousemove', (e) => {
      const x = e.clientX;
      const y = e.clientY;

      // Update wand tip flare
      if (this.tipGlow) {
        this.tipGlow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      // Calculate wand movement delta
      const dist = Math.hypot(x - this.lastX, y - this.lastY);
      if (dist > 8) {
        this.spawnSparks(x, y, this.isHoveringInteractive ? 3 : 1);
        this.lastX = x;
        this.lastY = y;
      }
    }, { passive: true });

    // Interactive Hover Listeners
    const interactiveSelectors = 'button, a, .btn-open-letter, .ambient-btn, .btn-close-letter, .envelope-seal, [role="button"]';
    
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        this.isHoveringInteractive = true;
        document.body.classList.add('wand-hovering');
        this.spawnSparks(e.clientX, e.clientY, 5);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        this.isHoveringInteractive = false;
        document.body.classList.remove('wand-hovering');
      }
    });

    // Wand Click Shockwave & Spark Burst
    window.addEventListener('click', (e) => {
      this.triggerClickBurst(e.clientX, e.clientY);
    });
  }

  spawnSparks(x, y, count = 2) {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.0;
      const spark = document.createElement('div');
      spark.className = 'wand-spark-particle';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty('--vx', `${Math.cos(angle) * speed * 25}px`);
      spark.style.setProperty('--vy', `${Math.sin(angle) * speed * 25}px`);
      
      // Temporary DOM spark or lightweight animation
      document.body.appendChild(spark);
      setTimeout(() => {
        if (spark.parentNode) spark.parentNode.removeChild(spark);
      }, 600);
    }
  }

  triggerClickBurst(x, y) {
    const burst = document.createElement('div');
    burst.className = 'wand-burst';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    document.body.appendChild(burst);

    setTimeout(() => {
      if (burst.parentNode) burst.parentNode.removeChild(burst);
    }, 600);

    this.spawnSparks(x, y, 8);
  }
}
