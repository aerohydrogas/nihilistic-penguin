// src/playfun.js
import { eventBus, Events } from './core/EventBus.js';
import { gameState } from './core/GameState.js';

export function setupPlayFunEvents() {
    // SDK instance is available at window.playFunSDK (set in index.html)
    // or via PlayFun global
    
    eventBus.on(Events.SCORE_CHANGED, ({ score, delta }) => {
        const sdk = window.playFunSDK || (window.PlayFun && window.PlayFun.instance);
        if (sdk && delta > 0) {
            if (typeof sdk.addPoints === 'function') sdk.addPoints(delta);
            else if (typeof sdk.trackPoints === 'function') sdk.trackPoints(delta);
        }
    });

    eventBus.on(Events.GAME_OVER, () => {
        const sdk = window.playFunSDK || (window.PlayFun && window.PlayFun.instance);
        if (sdk) {
            if (typeof sdk.savePoints === 'function') sdk.savePoints();
            else if (typeof sdk.saveSession === 'function') sdk.saveSession();
            else if (typeof sdk.submitScore === 'function') sdk.submitScore(Math.floor(gameState.score));
        }
    });
}
