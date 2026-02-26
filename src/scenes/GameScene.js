import { Scene } from 'phaser';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { GAME, WORLD, PLAYER, COLORS, UI } from '../core/Constants.js';
import { Penguin } from '../entities/Penguin.js';
import { PixelRenderer } from '../core/PixelRenderer.js';
import { BG_ASSETS, BG_PALETTE_MAP } from '../sprites/background.js';
import { audioManager } from '../audio/AudioManager.js';

export class GameScene extends Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    gameState.reset();
    gameState.started = true;

    // --- Generate Textures ---
    PixelRenderer.generate(this, 'mountain_large', BG_ASSETS.mountain_large, BG_PALETTE_MAP, 8); // 32x8 = 256px
    PixelRenderer.generate(this, 'ground_tile', BG_ASSETS.ground_tile, BG_PALETTE_MAP, 4); // 16x4 = 64px
    
    // Generate white pixel for snow
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 4, 4);
    graphics.generateTexture('snow_particle', 4, 4);
    
    // Generate vignette texture
    const vignette = this.make.graphics({ x: 0, y: 0, add: false });
    vignette.fillStyle(0x000000, 1);
    vignette.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    const mask = this.make.graphics({ x: 0, y: 0, add: false });
    mask.fillStyle(0xffffff, 1);
    mask.fillCircle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH * 0.6);
    // Note: Creating a proper radial gradient texture is complex with just graphics.
    // Instead, I'll use a shadow overlay in createVignette using an overlay image or a shader if possible, 
    // but for simple 2D, a large image with a hole or a simple dark border using graphics is easier.
    // Let's stick to a simple graphics overlay with alpha for now, or use a radial gradient texture if Phaser supports it easily in this version.
    // Actually, Phaser 3 Graphics can do gradients.
    
    // --- Background ---
    this.cameras.main.setBackgroundColor(COLORS.SKY);
    
    // Simple ground (TiledSprite)
    // Floor is at WORLD.FLOOR_Y.
    // We want the top of the ground to be at FLOOR_Y.
    // TiledSprite origin is center by default.
    this.ground = this.add.tileSprite(
      GAME.WIDTH / 2, 
      WORLD.FLOOR_Y + 32, // Offset to align top
      GAME.WIDTH, 
      64, 
      'ground_tile'
    );
    this.physics.add.existing(this.ground, true); // Static body
    // Adjust body size/offset if needed, but for static tileSprite it's usually full size
    
    // Parallax placeholder (mountains/icebergs)
    this.mountains = [];
    for(let i=0; i<3; i++) {
       const m = this.add.sprite(
         GAME.WIDTH * 0.2 + i * 300, 
         WORLD.FLOOR_Y, 
         'mountain_large'
       );
       m.setOrigin(0.5, 1);
       this.mountains.push(m);
    }
    
    // --- Snow Effects (Background Layer) ---
    this.createSnow();

    // --- Player ---
    this.penguin = new Penguin(this, PLAYER.START_X, PLAYER.START_Y);
    // Physics body needs to be enabled on the container
    // It is enabled in Penguin constructor via scene.physics.add.existing(this)
    
    // Collider needs to reference the body. With Arcade Physics and Container, 
    // the body is on the Container instance itself.
    this.physics.add.collider(this.penguin, this.ground);
    
    // --- Breath Effect ---
    this.createBreath();
    
    // --- Vignette ---
    this.createVignette();
    
    // --- Audio Init & Input ---
    this.input.once('pointerdown', () => {
        eventBus.emit(Events.AUDIO_INIT);
    });

    this.input.on('pointerdown', () => {
      if (gameState.gameOver) return;
      this.penguin.huddle();
      gameState.setHuddling(true);
      eventBus.emit('penguin:huddle', true);
      
      // Trigger breath immediately on huddle
      this.emitBreath();
    });
    
    this.input.on('pointerup', () => {
      if (gameState.gameOver) return;
      this.penguin.stopHuddle();
      gameState.setHuddling(false);
      eventBus.emit('penguin:huddle', false);
    });

    // --- HUD (Simple Debug/Dev HUD per instructions) ---
    this.hudText = this.add.text(20, 20, '', { 
        font: `20px ${UI.FONT}`, 
        fill: COLORS.UI_TEXT 
    });

    // --- Wind System ---
    this.windTimer = 0;
    this.windDuration = 0;
    this.windActive = false;
    this.nextWindTime = Phaser.Math.Between(WORLD.WIND_INTERVAL_MIN, WORLD.WIND_INTERVAL_MAX);
    this.breathTimer = 0;

    // Initial walk
    this.penguin.walk();
    
    eventBus.emit(Events.GAME_START);
  }

  createSnow() {
      // Background snow (slower, smaller, more transparent)
      this.snowBg = this.add.particles(0, 0, 'snow_particle', {
          x: { min: 0, max: GAME.WIDTH + 100 },
          y: -10,
          lifespan: 6000,
          speedX: { min: -50, max: -100 },
          speedY: { min: 30, max: 80 },
          scale: { start: 0.4, end: 0.2 },
          alpha: { start: 0.4, end: 0 },
          quantity: 1,
          frequency: 200,
          blendMode: 'ADD'
      });
      
      // Foreground snow (faster, larger, brighter)
      this.snowFg = this.add.particles(0, 0, 'snow_particle', {
          x: GAME.WIDTH + 50,
          y: { min: 0, max: GAME.HEIGHT },
          lifespan: 4000,
          speedX: { min: -150, max: -250 },
          speedY: { min: 20, max: 60 },
          scale: { start: 0.8, end: 0.5 },
          alpha: { start: 0.8, end: 0.2 },
          quantity: 1,
          frequency: 50,
          blendMode: 'ADD'
      });
      
      // Make snow cover the whole screen initially
      this.snowBg.start();
      this.snowFg.start();
      
      // Pre-warm the emitters so screen is full
      // Note: Phaser 3.60+ uses preEmit, older versions might just need time
      // We can manually simulate time or just spawn a bunch initially?
      // For now, standard emission is fine.
  }
  
  createBreath() {
      // Create a tiny texture for breath if needed, or reuse snow
      // Breath is a small puff attached to penguin head
      // Penguin is ~32px tall? Head is roughly at local 0,-16?
      // Since Penguin is a Container, we can't easily attach a Particle Emitter Manager to it 
      // in a way that particles follow it strictly without manual update, 
      // but we can update emitter position in update().
      
      this.breathEmitter = this.add.particles(0, 0, 'snow_particle', {
          lifespan: 1000,
          speedX: { min: 10, max: 30 }, // Blows slightly forward/right usually, but wind is left...
          // If wind is strong left, breath should go left. 
          // Let's say penguin faces right usually.
          speedY: { min: -10, max: -20 },
          scale: { start: 0.5, end: 1.5 },
          alpha: { start: 0.6, end: 0 },
          quantity: 5,
          emitting: false
      });
  }
  
  emitBreath() {
      if (!this.penguin || !this.penguin.active) return;
      
      const headX = this.penguin.x + 10; // Approx offset
      const headY = this.penguin.y - 15;
      
      this.breathEmitter.emitParticleAt(headX, headY, 10);
  }
  
  createVignette() {
     // Create a radial gradient texture for the vignette
     const width = GAME.WIDTH;
     const height = GAME.HEIGHT;
     
     const canvas = this.textures.createCanvas('vignette', width, height);
     const ctx = canvas.context;
     
     // Radial gradient: Transparent center to black edges
     const grd = ctx.createRadialGradient(width/2, height/2, width * 0.3, width/2, height/2, width * 0.8);
     grd.addColorStop(0, 'rgba(0,0,0,0)');
     grd.addColorStop(1, 'rgba(0,0,0,0.6)'); // 60% opacity black at edges
     
     ctx.fillStyle = grd;
     ctx.fillRect(0, 0, width, height);
     
     canvas.refresh();
     
     // Add to scene on top (high depth)
     this.vignette = this.add.image(width/2, height/2, 'vignette');
     this.vignette.setScrollFactor(0); // Fix to camera
     this.vignette.setDepth(100); // Ensure on top of everything
  }

  update(time, delta) {
    if (gameState.gameOver) return;
    
    // --- Wind Logic ---
    this.windTimer += delta;
    if (!this.windActive && this.windTimer > this.nextWindTime) {
       this.startWind();
    } else if (this.windActive && this.windTimer > this.windDuration) {
       this.stopWind();
    }
    
    // --- Breath Logic ---
    this.breathTimer += delta;
    if (this.breathTimer > 2000 + Math.random() * 2000) { // Every 2-4 seconds
        this.emitBreath();
        this.breathTimer = 0;
    }

    // Apply wind effect
    if (this.windActive) {
       this.penguin.applyWind(WORLD.WIND_FORCE);
       
       // Intensify snow
       this.snowFg.frequency = 20;
       this.snowFg.speedX = { min: -300, max: -500 };
    } else {
       // Reset velocity if not wind or huddling (walking logic handles its own velocity)
       if (!gameState.isHuddling) this.penguin.walk();
       
       // Normal snow
       this.snowFg.frequency = 50;
       this.snowFg.speedX = { min: -150, max: -250 };
    }

    // --- Warmth / Energy Logic ---
    let drain = PLAYER.ENERGY_DRAIN_RATE;
    if (this.windActive && !gameState.isHuddling) {
        drain *= PLAYER.WIND_DRAIN_MULTIPLIER;
    }
    
    if (gameState.isHuddling) {
        gameState.updateWarmth(PLAYER.HUDDLE_REGEN_RATE * (delta/1000));
    } else {
        gameState.updateWarmth(-drain * (delta/1000));
    }

    // --- Distance / Score ---
    if (!gameState.isHuddling) {
        // Distance is speed * time. 
        // Or since we have a fixed speed right now (mostly), just accumulate.
        // But wind pushes back, so actual velocity matters.
        const velX = this.penguin.body.velocity.x;
        if (velX > 0) {
            gameState.updateDistance(velX * (delta/1000));
            eventBus.emit(Events.SCORE_CHANGED, Math.floor(gameState.score));
            
            // Emit step event occasionally based on time or distance?
            // Since we don't have animation frames accessible easily here without digging into Penguin,
            // let's do a simple timer-based step sound.
            // But better to check Penguin.js first. 
            // For now, I'll rely on update logic or add a timer here.
            // Actually, let's just emit 'PLAYER_MOVE' here every X ms if moving?
            // Or better: Penguin.js probably handles animation.
        }
    }

    // --- Check Game Over ---
    if (gameState.warmth <= 0) {
        this.gameOver();
    }

    // --- Update HUD ---
    this.hudText.setText(
        `Warmth: ${Math.floor(gameState.warmth)}%\n` +
        `Distance: ${Math.floor(gameState.score)}m\n` +
        (this.windActive ? 'WINDY!' : '')
    );
    
    // --- Background Parallax (Infinite Scroll) ---
    // If we are moving right, background moves left
    if (!gameState.isHuddling && !this.windActive) {
        this.ground.tilePositionX += 2; // Scroll ground texture
        
        // Move mountains
        this.mountains.forEach(m => {
            m.x -= 0.5; // Slower than player
            if (m.x < -150) m.x = GAME.WIDTH + 150;
        });
    }
  }

  startWind() {
      this.windActive = true;
      this.windTimer = 0;
      this.windDuration = Phaser.Math.Between(WORLD.WIND_DURATION_MIN, WORLD.WIND_DURATION_MAX);
      gameState.setWindy(true);
      
      // Visual feedback for wind (particle or screen tint?)
      this.cameras.main.flash(500, 200, 200, 255); // Slight white flash
  }

  stopWind() {
      this.windActive = false;
      this.windTimer = 0;
      this.nextWindTime = Phaser.Math.Between(WORLD.WIND_INTERVAL_MIN, WORLD.WIND_INTERVAL_MAX);
      gameState.setWindy(false);
      
      // Ensure player resumes walking speed if not huddling
      if (!gameState.isHuddling) {
          this.penguin.walk();
      }
  }

  gameOver() {
      gameState.gameOver = true;
      this.penguin.body.setVelocity(0);
      this.physics.pause();
      this.snowFg.stop();
      this.snowBg.stop();
      this.breathEmitter.stop();
      
      // Visuals: Penguin falls over?
      this.penguin.rotation = Math.PI / 2; 

      eventBus.emit(Events.GAME_OVER, { score: Math.floor(gameState.score) });
      this.scene.start('GameOverScene');
  }
}
