class GameState {
  constructor() {
    this.isMuted = localStorage.getItem('muted') === 'true';
    this.reset();
  }

  reset() {
    this.score = 0; // Represents distance traveled
    this.bestScore = this.bestScore || 0;
    this.started = false;
    this.gameOver = false;

    // Trek mechanics
    this.warmth = 100;
    this.isHuddling = false;
    this.isWindy = false;
  }

  setHuddling(status) {
    this.isHuddling = status;
  }

  setWindy(status) {
    this.isWindy = status;
  }

  updateDistance(pixels) {
    if (!this.started || this.gameOver) return;
    // Simple conversion: 1 pixel = 1 meter? Or just raw pixels as score.
    // Let's use raw pixels / 10 for score to keep numbers manageable.
    this.score += Math.abs(pixels / 10);
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }
  }

  updateWarmth(amount) {
      if (this.gameOver) return;
      this.warmth += amount;
      if (this.warmth > 100) this.warmth = 100;
      if (this.warmth <= 0) {
          this.warmth = 0;
          this.gameOver = true;
          // Game Over logic handled by scene/event bus
      }
  }
}

export const gameState = new GameState();
