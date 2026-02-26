import Phaser from 'phaser';
import { PLAYER, WORLD, COLORS, GAME } from '../core/Constants.js';
import { PixelRenderer } from '../core/PixelRenderer.js';
import { PENGUIN_ASSETS, PENGUIN_PALETTE } from '../sprites/penguin.js';
import { eventBus, Events } from '../core/EventBus.js';

export class Penguin extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Generate textures if needed
    // We'll generate a 32x32 sprite sheet or individual frames?
    // Let's generate individual frames for simplicity
    PixelRenderer.generate(scene, 'penguin_walk1', PENGUIN_ASSETS.penguin_walk1, PENGUIN_PALETTE, 4); // Scale 4x (16 -> 64px)
    PixelRenderer.generate(scene, 'penguin_walk2', PENGUIN_ASSETS.penguin_walk2, PENGUIN_PALETTE, 4);
    PixelRenderer.generate(scene, 'penguin_huddle', PENGUIN_ASSETS.penguin_huddle, PENGUIN_PALETTE, 4);

    // Physics body setup
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(WORLD.GRAVITY);
    this.body.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
    this.body.setOffset(-PLAYER.WIDTH / 2, -PLAYER.HEIGHT / 2);

    // Visuals - Replace shapes with Sprite
    this.sprite = scene.add.sprite(0, 0, 'penguin_walk1');
    this.add(this.sprite);

    // Animation state
    this.animTimer = 0;
    this.animFrame = 0;

    // State
    this.isHuddling = false;
    this.currentSpeed = PLAYER.WALK_SPEED;

    // Hook into scene update
    this.scene.events.on('update', this.update, this);
    
    // Cleanup on destroy
    this.on('destroy', () => {
        this.scene.events.off('update', this.update, this);
    });
  }

  update(time, delta) {
    if (!this.active) return; // Don't update if destroyed

    if (this.isHuddling) {
        this.sprite.setTexture('penguin_huddle');
    } else {
        // Simple walk cycle
        this.animTimer += delta;
        if (this.animTimer > 200) { // 200ms per frame
            this.animTimer = 0;
            this.animFrame = 1 - this.animFrame; // Toggle 0/1
            this.sprite.setTexture(this.animFrame === 0 ? 'penguin_walk1' : 'penguin_walk2');
            
            // Emit step sound on specific frame (e.g., when foot hits ground)
            // Or just every frame change for now
            eventBus.emit(Events.PLAYER_MOVE);
        }
    }
  }

  walk() {
    if (this.isHuddling) return;
    this.body.setVelocityX(this.currentSpeed);
  }

  huddle() {
    this.isHuddling = true;
    this.body.setVelocityX(0);
    // Visual update handled in update loop
  }

  stopHuddle() {
    this.isHuddling = false;
    this.walk();
  }

  applyWind(forceX) {
    if (this.isHuddling) {
        this.body.setVelocityX(forceX * 0.2); 
    } else {
        this.body.setVelocityX(this.currentSpeed + forceX);
    }
  }
}
