export const PALETTE = {
  TRANSPARENT: null,
  BLACK: '#1a1a1a',      // Soft black
  WHITE: '#ffffff',      // Pure white
  GREY_LIGHT: '#d1d5db',
  GREY: '#9ca3af',
  GREY_DARK: '#4b5563',
  BLUE_ICE_LIGHT: '#e0f2fe',
  BLUE_ICE: '#bae6fd',
  BLUE_ICE_DARK: '#7dd3fc',
  YELLOW: '#facc15',     // Beak/feet
  YELLOW_DARK: '#ca8a04',
};

// Map convenient single-char codes to colors for matrix definitions
export const CODES = {
  '.': PALETTE.TRANSPARENT,
  'B': PALETTE.BLACK,
  'W': PALETTE.WHITE,
  'w': PALETTE.GREY_LIGHT,
  'g': PALETTE.GREY,
  'G': PALETTE.GREY_DARK,
  'i': PALETTE.BLUE_ICE_LIGHT,
  'I': PALETTE.BLUE_ICE,
  'D': PALETTE.BLUE_ICE_DARK,
  'Y': PALETTE.YELLOW,
  'y': PALETTE.YELLOW_DARK,
};
