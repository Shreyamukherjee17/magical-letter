/**
 * HARRY POTTER BACKGROUND THEME MUSIC & AUDIO CONTROLLER
 * Controls playback, volume fading, looping, and tab visibility management for harry_potter_theme.mp3
 */

class HarryPotterMusicPlayer {
  constructor(audioElementId = 'hpThemeAudio') {
    this.audio = document.getElementById(audioElementId) || new Audio('assets/music/harry_potter_theme.mp3?v=hp2026');
    this.audio.loop = true;
    this.targetVolume = 0.55;
    this.audio.volume = 0;
    this.isPlaying = false;
    this.fadeInterval = null;
  }

  play() {
    // Ensure src points to updated theme file
    if (!this.audio.src.includes('harry_potter_theme.mp3')) {
      this.audio.src = 'assets/music/harry_potter_theme.mp3?v=hp2026';
    }

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isPlaying = true;
        this.fadeIn();
        this.updateUI(true);
      }).catch((err) => {
        console.log('Audio playback waiting for user gesture:', err);
      });
    }
  }

  pause() {
    this.fadeOut(() => {
      this.audio.pause();
      this.isPlaying = false;
      this.updateUI(false);
    });
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  fadeIn(duration = 1000) {
    clearInterval(this.fadeInterval);
    const step = this.targetVolume / (duration / 50);
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

  updateUI(playing) {
    const audioBtn = document.getElementById('toggleAudio');
    const soundIcon = document.getElementById('soundIcon');
    const muteIcon = document.getElementById('muteIcon');

    if (!audioBtn) return;

    if (playing) {
      if (soundIcon) soundIcon.style.display = 'block';
      if (muteIcon) muteIcon.style.display = 'none';
      audioBtn.setAttribute('aria-label', 'Mute Harry Potter Theme Music');
    } else {
      if (soundIcon) soundIcon.style.display = 'none';
      if (muteIcon) muteIcon.style.display = 'block';
      audioBtn.setAttribute('aria-label', 'Play Harry Potter Theme Music');
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
      music.toggle();
    });
  }

  // Seamlessly start audio when opening the letter if not already playing
  const openLetterBtn = document.getElementById('btnOpenLetter');
  if (openLetterBtn) {
    openLetterBtn.addEventListener('click', () => {
      if (!music.isPlaying) {
        music.play();
      }
    });
  }

  // First interaction listener to allow autoplay smoothly if desired
  const startAudioOnFirstInteraction = () => {
    // Attempt auto-start on first user interaction if user clicks to explore
    document.removeEventListener('click', startAudioOnFirstInteraction);
  };
  document.addEventListener('click', startAudioOnFirstInteraction);

  // Handle Tab Inactivity (Preserve CPU/GPU & mute politely)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (music.isPlaying) music.fadeOut();
    } else {
      if (music.isPlaying) music.fadeIn();
    }
  });

  console.log('✨ Harry Potter Enchanted Experience Initialized with Theme Music ✨');
});
