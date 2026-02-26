// src/playfun.js — Play.fun (OpenGameProtocol) integration
import { eventBus, Events } from './core/EventBus.js';
import { gameState } from './core/GameState.js';

const GAME_ID = '7d97fb68-aad5-4c8d-8b01-335f6e6b4144';
let sdk = null;
let initialized = false;

export async function initPlayFun() {
  // Check for global PlayFun object (injected by script tag)
  if (typeof window.PlayFun === 'undefined') {
    console.warn('Play.fun SDK script not found on window.PlayFun');
    return;
  }
  
  try {
    // Initialize SDK
    // Note: v1 SDK might return the instance directly or via promise
    sdk = await window.PlayFun.init({
      gameId: GAME_ID
    });
    
    initialized = true;
    console.log('Play.fun SDK initialized successfully');

    // Track points incrementally
    eventBus.on(Events.SCORE_CHANGED, ({ score, delta }) => {
      if (initialized && delta > 0) {
        // Try common method names for points tracking
        if (typeof sdk.addPoints === 'function') {
            sdk.addPoints(delta);
        } else if (typeof sdk.trackPoints === 'function') {
            sdk.trackPoints(delta);
        }
      }
    });

    // Save session on Game Over
    eventBus.on(Events.GAME_OVER, () => { 
      if (initialized) {
        if (typeof sdk.savePoints === 'function') {
            sdk.savePoints(); 
        } else if (typeof sdk.saveSession === 'function') {
            sdk.saveSession();
        } else if (typeof sdk.submitScore === 'function') {
            // Fallback for leaderboard-only SDKs
            sdk.submitScore(Math.floor(gameState.score));
        }
      }
    });

    // Save on unload
    window.addEventListener('beforeunload', () => { 
      if (initialized && typeof sdk.savePoints === 'function') {
        sdk.savePoints(); 
      }
    });

  } catch (err) {
    console.error('Play.fun init failed:', err);
  }
}
