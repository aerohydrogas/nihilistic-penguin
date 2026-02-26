import { PALETTE } from './palette.js';

// 16x16 Penguin Matrices

const PALETTE_MAP = {
  '.': PALETTE.TRANSPARENT,
  'B': PALETTE.BLACK,
  'W': PALETTE.WHITE,
  'w': PALETTE.GREY_LIGHT, // Highlights or belly shading
  'Y': PALETTE.YELLOW,     // Beak/Feet
  'y': PALETTE.YELLOW_DARK,
  'G': PALETTE.GREY,       // Eye or detail
};

// Side view, walking frame 1
export const PENGUIN_WALK_1 = [
  ".......BB.......",
  "......BBBB......",
  ".....BBBBBB.....",
  "....BBWWBBBB....", // Eye area
  "....BBWWBBBB....",
  "...BBBBBBBBB....",
  "...BBWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "...BBBBBBYYY....", // Feet forward
  "....YYY.........",
  "................",
];

// Side view, walking frame 2
export const PENGUIN_WALK_2 = [
  ".......BB.......",
  "......BBBB......",
  ".....BBBBBB.....",
  "....BBWWBBBB....",
  "....BBWWBBBB....",
  "...BBBBBBBBB....",
  "...BBWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "...BBBBBB.......",
  "....YYY..YYY....", // Feet split
  "................",
];

// Huddling frame (squished, head down)
export const PENGUIN_HUDDLE = [
  "................",
  ".......BB.......",
  "......BBBB......",
  ".....BBBBBB.....",
  "....BBBBBBBB....",
  "...BBBBBBBBB....",
  "...BBWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "..BBWWWWWBBB....",
  "...BBBBBB.......",
  "....YYY.........",
  "................",
  "................",
];

export const PENGUIN_ASSETS = {
  'penguin_walk1': PENGUIN_WALK_1,
  'penguin_walk2': PENGUIN_WALK_2,
  'penguin_huddle': PENGUIN_HUDDLE,
};

export const PENGUIN_PALETTE = PALETTE_MAP;
