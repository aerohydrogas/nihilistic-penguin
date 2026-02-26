
// --- Display ---

// Device pixel ratio (capped at 2 for mobile GPU performance)
export const DPR = Math.min(window.devicePixelRatio || 1, 2);

// Force portrait mode — set to true for vertical games (dodgers, runners, collectors).
const FORCE_PORTRAIT = false; // Landscape is better for a trek
const _isPortrait = FORCE_PORTRAIT || window.innerHeight > window.innerWidth;

// Design dimensions (logical game units at 1x scale)
const _designW = 800;
const _designH = 600;
const _designAspect = _designW / _designH;

// Canvas dimensions
const _deviceW = window.innerWidth * DPR;
const _deviceH = window.innerHeight * DPR;

let _canvasW, _canvasH;
if (_deviceW / _deviceH > _designAspect) {
  _canvasW = _deviceW;
  _canvasH = Math.round(_deviceW / _designAspect);
} else {
  _canvasW = Math.round(_deviceH * _designAspect);
  _canvasH = _deviceH;
}

// PX = canvas pixels per design pixel.
export const PX = _canvasW / _designW;

export const GAME = {
  WIDTH: _canvasW,
  HEIGHT: _canvasH,
  IS_PORTRAIT: _isPortrait,
};

export const WORLD = {
  GRAVITY: 800 * PX,
  FLOOR_Y: GAME.HEIGHT * 0.85,
  WIND_FORCE: -200 * PX, // Pushes back left
  WIND_INTERVAL_MIN: 3000,
  WIND_INTERVAL_MAX: 8000,
  WIND_DURATION_MIN: 1000,
  WIND_DURATION_MAX: 3000,
};

// --- Player ---

export const PLAYER = {
  START_X: GAME.WIDTH * 0.1,
  START_Y: WORLD.FLOOR_Y - (50 * PX), // Just above floor
  WIDTH: 40 * PX,
  HEIGHT: 60 * PX,
  WALK_SPEED: 100 * PX,
  HUDDLE_SPEED: 0,
  MAX_ENERGY: 100,
  ENERGY_DRAIN_RATE: 5, // Per second
  HUDDLE_REGEN_RATE: 10, // Per second
  WIND_DRAIN_MULTIPLIER: 3, // Extra drain during wind if not huddling
  COLOR_NORMAL: 0x000000, // Black penguin
  COLOR_BELLY: 0xffffff, // White belly
};

// --- Colors ---

export const COLORS = {
  // Gameplay
  SKY: 0x87ceeb, // Light blue
  SNOW: 0xffffff,
  ICE: 0xa5f2f3,
  
  // UI text
  UI_TEXT: '#000000',
  UI_WARN: '#ff0000',
  
  // Menu / GameOver gradient backgrounds
  BG_TOP: 0x87ceeb,
  BG_BOTTOM: 0xe0f7fa,
};

// --- UI sizing (proportional to game dimensions) ---

export const UI = {
  FONT: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  TITLE_RATIO: 0.08,
  HEADING_RATIO: 0.05,
  BODY_RATIO: 0.035,
  SMALL_RATIO: 0.025,
};

export const TRANSITION = {
  DURATION: 500,
};

export const SAFE_ZONE = {
  TOP: GAME.HEIGHT * 0.15, // Reserve top 15% for Play.fun widget
  BOTTOM: GAME.HEIGHT * 0.1,
  LEFT: GAME.WIDTH * 0.05,
  RIGHT: GAME.WIDTH * 0.05,
};

