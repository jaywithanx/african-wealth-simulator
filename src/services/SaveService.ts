import { GameState } from '../types';

const SAVE_KEY = 'african_wealth_save';

export const SaveService = {
  save(state: GameState): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (_e) {
      // Ignore storage errors
    }
  },

  load(): GameState | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as GameState;
    } catch (_e) {
      return null;
    }
  },

  hasSave(): boolean {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (_e) {
      return false;
    }
  },

  delete(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (_e) {
      // Ignore storage errors
    }
  },
};
