import Phaser from 'phaser';

export class PixelRenderer {
  /**
   * Generates a texture from a matrix of color codes.
   * @param {Phaser.Scene} scene - The scene to add the texture to.
   * @param {string} key - The texture key.
   * @param {string[]} matrix - Array of strings representing rows.
   * @param {Object} palette - Map of characters to hex strings.
   * @param {number} scale - Pixel scale factor (how big is one "pixel").
   */
  static generate(scene, key, matrix, palette, scale = 1) {
    if (scene.textures.exists(key)) return;

    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Create an offline canvas
    const canvas = document.createElement('canvas');
    canvas.width = cols * scale;
    canvas.height = rows * scale;
    const ctx = canvas.getContext('2d');
    
    // Draw pixels
    for (let y = 0; y < rows; y++) {
      const row = matrix[y];
      for (let x = 0; x < cols; x++) {
        const char = row[x];
        const color = palette[char];
        
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    
    // Add to Texture Manager
    scene.textures.addCanvas(key, canvas);
  }
}
