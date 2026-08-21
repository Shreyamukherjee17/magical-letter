/**
 * HARRY POTTER BACKGROUND THEME MUSIC & AUDIO CONTROLLER
 * Controls playback, volume fading, looping, and tab visibility management for harry_potter_theme.mp3
 */

class HarryPotterMusicPlayer {
  constructor(audioElementId = 'hpThemeAudio') {
    this.audio = document.getElementById(audioElementId) || new Audio('assets/music/harry_potter_theme.mp3?v=hp2026');
    this.audio.loop = true;
    this.targetVolume = 0.55;
    this.audio.volume = this.targetVolume;
    this.isPlaying = false;
    this.audioInitialized = false;
    this.audioCtx = null;
    this.fadeInterval = null;

    // Single source of truth for user sound preference:
    // Check localStorage. If absent, default to true (sound enabled).
    const storedPref = localStorage.getItem('soundEnabled');
    this.soundEnabled = storedPref !== null ? storedPref === 'true' : true;

    // Initialize audio system and listeners
    this.initAudio();
  }

  initAudio() {
    if (!this.audio) return;

    // Preload audio asset & prepare volume
    if (!this.audio.src.includes('harry_potter_theme.mp3')) {
      this.audio.src = 'assets/music/harry_potter_theme.mp3?v=hp2026';
    }
    this.audio.volume = this.targetVolume;

    try {
      this.audio.load();
      this.audioInitialized = true;
    } catch (e) {
      console.log('Audio load warning:', e);
    }

    // Initialize Web Audio Context for seamless autoplay activation
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass && !this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
    } catch (e) {
      console.log('Web Audio Context initialization note:', e);
    }

    // Initialize UI toggle button according to stored user preference
    this.updateUI(this.soundEnabled);

    // Attach gesture listeners to trigger audio playback on user interaction if sound is enabled
    this.setupGestureListeners();
  }

  setupGestureListeners() {
    const unlockAudio = (event) => {
      // Only attempt if sound is enabled and it's not already playing
      if (this.soundEnabled && !this.isPlaying) {
        
        // Call play directly inside this trusted user event
        const playPromise = this.play(); 
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Success! The browser allowed autoplay.
            this.isPlaying = true;
            console.log('Audio unlocked by user gesture:', event.type);
            
            // CRITICAL: Remove all listeners immediately so they don't spam .play()
            removeListeners();
          }).catch((err) => {
            // The browser still rejected it (e.g., it wasn't a "primary" interaction)
            console.log('Gesture rejected by browser, waiting for next interaction:', err);
          });
        }
      }
    };

    const gestures = ['click', 'pointerdown', 'touchstart', 'keydown'];

    // Helper function to clean up listeners
    const removeListeners = () => {
      gestures.forEach((evt) => {
        window.removeEventListener(evt, unlockAudio, { capture: true });
      });
    };

    // Attach the listeners
    gestures.forEach((evt) => {
      window.addEventListener(evt, unlockAudio, { capture: true, passive: true });
    });
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  setVolume(newVolume) {
    // Pure volume control: ONLY changes volume level, never starts audio or changes soundEnabled
    this.targetVolume = Math.max(0, Math.min(1, newVolume));
    if (this.audio) {
      this.audio.volume = this.targetVolume;
    }
  }

  getVolume() {
    return this.targetVolume;
  }

  enableSound() {
    this.soundEnabled = true;
    localStorage.setItem('soundEnabled', 'true');
    this.updateUI(true);
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    this.play();
  }

  disableSound() {
    this.soundEnabled = false;
    localStorage.setItem('soundEnabled', 'false');
    this.updateUI(false);
    this.pause();
  }

  toggleSound() {
    if (this.soundEnabled) {
      this.disableSound();
    } else {
      this.enableSound();
    }
    return this.soundEnabled;
  }

  toggle() {
    return this.toggleSound();
  }

  playIfEnabled() {
    if (this.soundEnabled && !this.isPlaying) {
      this.play();
    }
  }

  play() {
    // Rule 1: NEVER play audio if sound is disabled by the user preference
    if (!this.soundEnabled) {
      return;
    }

    if (!this.audio) return;

    // Ensure audio volume matches target volume
    this.audio.volume = this.targetVolume;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isPlaying = true;
        this.updateUI(true);
      }).catch((err) => {
        // Autoplay blocked by browser policy until user gesture
        this.isPlaying = false;
      });
    }
    return playPromise;
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.updateUI(this.soundEnabled && this.isPlaying);
  }

  fadeIn(duration = 1000) {
    clearInterval(this.fadeInterval);
    const step = (this.targetVolume - this.audio.volume) / (duration / 50);
    this.fadeInterval = setInterval(() => {
      if (this.audio.volume < this.targetVolume - step) {
        this.audio.volume = Math.min(this.targetVolume, this.audio.volume + step);
      } else {
        this.audio.volume = this.targetVolume;
        clearInterval(this.fadeInterval);
      }
    }, 50);
  }

  fadeOut(callback = null, duration = 800) {
    clearInterval(this.fadeInterval);
    const step = this.audio.volume / (duration / 50);
    this.fadeInterval = setInterval(() => {
      if (this.audio.volume > step) {
        this.audio.volume = Math.max(0, this.audio.volume - step);
      } else {
        this.audio.volume = 0;
        clearInterval(this.fadeInterval);
        if (callback) callback();
      }
    }, 50);
  }

  updateUI(enabled) {
    const audioBtn = document.getElementById('toggleAudio');
    const soundIcon = document.getElementById('soundIcon');
    const muteIcon = document.getElementById('muteIcon');

    if (!audioBtn) return;

    // Reflect global sound preference (soundEnabled state)
    const showSoundIcon = typeof enabled === 'boolean' ? enabled : this.soundEnabled;

    if (showSoundIcon) {
      if (soundIcon) soundIcon.style.display = 'block';
      if (muteIcon) muteIcon.style.display = 'none';
      audioBtn.setAttribute('aria-label', 'Mute Harry Potter Theme Music');
      audioBtn.setAttribute('title', 'Mute Harry Potter Theme Music');
    } else {
      if (soundIcon) soundIcon.style.display = 'none';
      if (muteIcon) muteIcon.style.display = 'block';
      audioBtn.setAttribute('aria-label', 'Play Harry Potter Theme Music');
      audioBtn.setAttribute('title', 'Play Harry Potter Theme Music');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Engines
  const torchlight = new TorchlightEngine();
  const storm = new StormEngine(torchlight);
  const wand = new WandCursorEngine();
  const letter = new LetterTransitionEngine();
  const music = new HarryPotterMusicPlayer('hpThemeAudio');

  // Audio Toggle Button
  const audioBtn = document.getElementById('toggleAudio');
  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      music.toggleSound();
    });
  }

  // Full-screen Intro Overlay: Tap/Click anywhere to unlock audio & reveal website
  const enterOverlay = document.getElementById('enterOverlay');
  if (enterOverlay) {
    let enterTriggered = false;
    const handleEnter = (e) => {
      if (enterTriggered) return;
      enterTriggered = true;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Immediately trigger background music playback if user preference is ON
      if (music.isSoundEnabled()) {
        music.playIfEnabled();
      }

      // Smoothly fade out the black overlay to reveal castle homepage
      enterOverlay.classList.add('fade-out');

      // Remove element from DOM after transition completes
      setTimeout(() => {
        if (enterOverlay.parentNode) {
          enterOverlay.parentNode.removeChild(enterOverlay);
        }
      }, 1800);
    };

    enterOverlay.addEventListener('click', handleEnter);
    enterOverlay.addEventListener('touchstart', handleEnter, { passive: false });
    enterOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleEnter(e);
      }
    });
  }

  // Trigger playback on OPEN THE LETTER click if sound is enabled
  const openLetterBtn = document.getElementById('btnOpenLetter');
  if (openLetterBtn) {
    openLetterBtn.addEventListener('click', () => {
      if (music.isSoundEnabled()) {
        music.playIfEnabled();
      }
    });
  }

  // Handle Tab Inactivity (Preserve CPU/GPU & mute politely)
  let wasPlayingBeforeHidden = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      wasPlayingBeforeHidden = music.isPlaying;
      if (music.isPlaying) music.fadeOut();
    } else {
      if (music.isSoundEnabled() && wasPlayingBeforeHidden) {
        music.playIfEnabled();
      }
    }
  });

  console.log('✨ Harry Potter Enchanted Experience Initialized with Theme Music ✨');
});
