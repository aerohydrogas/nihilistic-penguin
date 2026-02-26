import {
  note,
  s,
  stack,
  choose
} from '@strudel/web';
import { eventBus, Events } from '../core/EventBus.js'; // Fixed import extension

export class AudioManager {
  constructor() {
    this.initialized = false;
    this.isMuted = false;
    this.scheduler = null;
  }

  setupListeners() {
    eventBus.on(Events.AUDIO_INIT, () => this.init());
    eventBus.on(Events.GAME_START, () => this.playBGM());
    eventBus.on(Events.GAME_OVER, () => this.stopBGM());
    eventBus.on('penguin:step', () => this.playStep()); // Corrected event name
    eventBus.on('penguin:huddle', (isHuddling) => {
        if (isHuddling) this.playHuddle();
        else this.stopHuddle();
    });
  }

  async init() {
    if (this.initialized) return;
    try {
      // Resume AudioContext logic would go here
      console.log('Audio: Initialized');
      this.initialized = true;
      this.setupListeners();
      this.playBGM();
    } catch (e) {
      console.error('Audio init failed:', e);
    }
  }

  playBGM() {
    if (!this.initialized || this.scheduler || this.isMuted) return;

    // Wind Drone: continuous noise with slow filter sweep
    const wind = s("noise")
      .lpf(s("200 400 300").slow(8)) // Replaced cycle with s() pattern
      .legato(1)
      .gain(0.05);

    // Sparse Piano: occasional high notes
    const piano = note("eb5 g5 c6")
      .s("piano")
      .velocity(choose(0.2, 0.1, 0))
      .slow(4)
      .degradeBy(0.6); // 60% chance to be silent

    // Drone bass
    const drone = note("c2")
      .s("sawtooth")
      .lpf(200)
      .legato(1)
      .gain(0.1);

    this.scheduler = stack(wind, piano, drone).play();
  }

  stopBGM() {
    if (this.scheduler) {
      this.scheduler.stop();
      this.scheduler = null;
    }
  }

  playStep() {
    if (this.isMuted || !this.initialized) return;
    s("noise")
      .hpf(1000)
      .lpf(3000)
      .decay(0.05)
      .sustain(0)
      .gain(0.1)
      .play();
  }

  playHuddle() {
     // Implementation for continuous huddle sound would require a separate scheduler
     // Keeping it simple for now or play once
  }
  
  stopHuddle() {}

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopBGM();
    else this.playBGM();
  }
}

export const audioManager = new AudioManager();
