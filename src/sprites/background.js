import { PALETTE } from './palette.js';

// 32x32 Background Elements

const BG_PALETTE = {
  '.': PALETTE.TRANSPARENT,
  'I': PALETTE.BLUE_ICE,       // Light
  'i': PALETTE.BLUE_ICE_LIGHT, // Highlights
  'D': PALETTE.BLUE_ICE_DARK,  // Shadows
  'W': PALETTE.WHITE,          // Snow caps
  'S': PALETTE.GREY_LIGHT,     // Snow shadow
};

// Mountain: Triangle shape with shading
const MOUNTAIN_LARGE = Array(32).fill("................................");

// Procedurally generate a mountain shape in the array
// Peak at col 15, row 2. Slopes down.
for (let y = 2; y < 32; y++) {
  let width = Math.floor((y - 2) * 1.2); // Slope
  let startX = 15 - width;
  let endX = 15 + width;
  
  let rowStr = "";
  for (let x = 0; x < 32; x++) {
    if (x >= startX && x <= endX) {
      // Logic for color
      if (y < 8) rowStr += 'W'; // Snow cap
      else if (x < 15) rowStr += 'D'; // Shadow side
      else rowStr += 'I'; // Lit side
    } else {
      rowStr += '.';
    }
  }
  MOUNTAIN_LARGE[y] = rowStr;
}

// Ground tile (repeatable texture)
const GROUND_TILE = Array(16).fill("WWWWWWWWWWWWWWWW");
// Add some noise/texture
GROUND_TILE[0] = "WWWWWiWWWWWWWiWW";
GROUND_TILE[1] = "WWiWWWWWWWWWWWWW";
GROUND_TILE[5] = "WWWWWWWWWiWWWWWW";
GROUND_TILE[12] = "WWiWWWWWWWWWWiWW";

export const BG_ASSETS = {
  'mountain_large': MOUNTAIN_LARGE,
  'ground_tile': GROUND_TILE,
};

export const BG_PALETTE_MAP = BG_PALETTE;
