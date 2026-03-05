import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  darkMode: boolean;
  snackbar: { open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' };
  restTimer: { active: boolean; seconds: number; remaining: number };
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialState: UIState = {
  darkMode: prefersDark,
  snackbar: { open: false, message: '', severity: 'success' },
  restTimer: { active: false, seconds: 90, remaining: 90 },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
    },
    showSnackbar(state, action: PayloadAction<{ message: string; severity?: UIState['snackbar']['severity'] }>) {
      state.snackbar = { open: true, message: action.payload.message, severity: action.payload.severity ?? 'success' };
    },
    hideSnackbar(state) {
      state.snackbar.open = false;
    },
    startRestTimer(state, action: PayloadAction<number>) {
      state.restTimer = { active: true, seconds: action.payload, remaining: action.payload };
    },
    tickRestTimer(state) {
      if (state.restTimer.remaining > 0) {
        state.restTimer.remaining -= 1;
      } else {
        state.restTimer.active = false;
      }
    },
    stopRestTimer(state) {
      state.restTimer.active    = false;
      state.restTimer.remaining = state.restTimer.seconds;
    },
  },
});

export const {
  toggleDarkMode, setDarkMode,
  showSnackbar, hideSnackbar,
  startRestTimer, tickRestTimer, stopRestTimer,
} = uiSlice.actions;
export default uiSlice.reducer;
