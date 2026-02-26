import {
  queue,
  sched,
  supercollider,
  collatz,
  choose,
  cycle,
  s,
  stack,
  slow,
  note,
  velocity,
  layer,
  every,
  fast,
  silence,
  sound,
  n,
  control
} from '@strudel/web';
import { eventBus, Events } from '../core/EventBus';

export class AudioManager {
  constructor() {
    this.initialized = false;
    this.isMuted = false;
    this.bgmScheduler = null;
    this.huddleScheduler = null;

    this.setupListeners();
  }

  setupListeners() {
    // Start audio context on first interaction
    eventBus.on(Events.AUDIO_INIT, () => this.init());
    
    // Game events
    eventBus.on(Events.GAME_START, () => this.playBGM());
    eventBus.on(Events.GAME_OVER, () => this.onGameOver());
    eventBus.on(Events.PLAYER_MOVE, () => this.playStep());
    eventBus.on(Events.PLAYER_JUMP, () => this.playJump()); // Optional jump sound
    eventBus.on('penguin:huddle', (isHuddling) => this.playHuddle(isHuddling));
    
    eventBus.on(Events.AUDIO_TOGGLE_MUTE, () => this.toggleMute());
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // Resume AudioContext if suspended (browser policy)
      // Strudel uses a global audio context usually, but we can trigger it
      // by playing a silent sound
      silence.play().stop();
      
      console.log('Audio: Initialized');
      this.initialized = true;
      this.playBGM();
    } catch (e) {
      console.error('Audio init failed:', e);
    }
  }

  playBGM() {
    if (!this.initialized || this.bgmScheduler || this.isMuted) return;

    // "Lonely, cold, empty"
    // C minor drone + sparse high notes
    
    const drone = note("c2")
      .s("sawtooth")
      .lpf(200)
      .legato(1)
      .gain(0.1);

    const sparsePiano = note("eb5 g5 c6")
      .s("piano")
      .velocity(choose(0.2, 0.1, 0)) 
      .slow(4) 
      .degradeBy(0.6); 

    const wind = s("wind") // If 'wind' sample exists, otherwise use noise
      .gain(0.05)
      .slow(8);

    // Fallback wind synth if sample missing
    const windSynth = note("c3")
      .s("noise")
      .lpf(cycle(200, 400, 300).slow(8))
      .legato(1)
      .gain(0.05);

    this.bgmScheduler = stack(
      drone,
      sparsePiano,
      windSynth
    ).play();
  }

  stopBGM() {
    if (this.bgmScheduler) {
      this.bgmScheduler.stop();
      this.bgmScheduler = null;
    }
  }

  onGameOver() {
    this.stopBGM();
    if (this.isMuted) return;

    // Long fading minor chord / wind howl
    stack(
      note("c2 eb2 g2").s("sawtooth").lpf(100).decay(4).sustain(0).gain(0.3),
      note("c4").s("sine").decay(6).gain(0.1)
    ).play();
  }

  playStep() {
    if (this.isMuted || !this.initialized) return;

    // Crunchy snow step: short noise burst
    // Using random velocity for variety
    s("noise")
      .hpf(1000)
      .lpf(3000)
      .decay(0.05)
      .sustain(0)
      .gain(choose(0.1, 0.15, 0.08))
      .play();
  }

  playJump() {
     if (this.isMuted || !this.initialized) return;
     note("c3").s("sine").decay(0.1).gain(0.1).play();
  }

  playHuddle(isHuddling) {
    if (this.isMuted || !this.initialized) return;
    
    if (isHuddling) {
        if (!this.huddleScheduler) {
            // Warm low hum
            this.huddleScheduler = note("c2")
                .s("triangle")
                .lpf(150)
                .gain(0.2)
                .legato(1)
                .play();
        }
    } else {
        if (this.huddleScheduler) {
            this.huddleScheduler.stop();
            this.huddleScheduler = null;
        }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
      if (this.huddleScheduler) {
          this.huddleScheduler.stop();
          this.huddleScheduler = null;
      }
    } else {
      this.playBGM();
    }
  }
}

export const audioManager = new AudioManager();

