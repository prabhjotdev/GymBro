/**
 * Workout Draft Slice
 * Manages the in-progress workout. Persisted to localStorage for crash recovery.
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { WorkoutDraft, DraftEntry, DraftSet } from '../../types';

const STORAGE_KEY = 'gymbro_workout_draft';

function loadDraftFromStorage(): WorkoutDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraftToStorage(draft: WorkoutDraft | null): void {
  try {
    if (draft) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage full – ignore
  }
}

interface DraftState {
  draft: WorkoutDraft | null;
}

const initialState: DraftState = {
  draft: loadDraftFromStorage(),
};

const workoutDraftSlice = createSlice({
  name: 'workoutDraft',
  initialState,
  reducers: {
    startDraft(state, action: PayloadAction<WorkoutDraft>) {
      state.draft = action.payload;
      saveDraftToStorage(action.payload);
    },
    clearDraft(state) {
      state.draft = null;
      saveDraftToStorage(null);
    },
    addSet(state, action: PayloadAction<{ entryId: string; set: DraftSet }>) {
      if (!state.draft) return;
      const entry = state.draft.entries.find(e => e.id === action.payload.entryId);
      if (entry) {
        entry.sets.push(action.payload.set);
        saveDraftToStorage(state.draft);
      }
    },
    updateSet(state, action: PayloadAction<{ entryId: string; setIndex: number; patch: Partial<DraftSet> }>) {
      if (!state.draft) return;
      const entry = state.draft.entries.find(e => e.id === action.payload.entryId);
      if (entry) {
        const s = entry.sets.find(s => s.setIndex === action.payload.setIndex);
        if (s) Object.assign(s, action.payload.patch);
        saveDraftToStorage(state.draft);
      }
    },
    removeSet(state, action: PayloadAction<{ entryId: string; setIndex: number }>) {
      if (!state.draft) return;
      const entry = state.draft.entries.find(e => e.id === action.payload.entryId);
      if (entry) {
        entry.sets = entry.sets.filter(s => s.setIndex !== action.payload.setIndex);
        // Re-index
        entry.sets.forEach((s, i) => { s.setIndex = i; });
        saveDraftToStorage(state.draft);
      }
    },
    markSetDone(state, action: PayloadAction<{ entryId: string; setIndex: number; done: boolean }>) {
      if (!state.draft) return;
      const entry = state.draft.entries.find(e => e.id === action.payload.entryId);
      if (entry) {
        const s = entry.sets.find(s => s.setIndex === action.payload.setIndex);
        if (s) s.done = action.payload.done;
        saveDraftToStorage(state.draft);
      }
    },
    addEntry(state, action: PayloadAction<DraftEntry>) {
      if (!state.draft) return;
      state.draft.entries.push(action.payload);
      saveDraftToStorage(state.draft);
    },
    removeEntry(state, action: PayloadAction<string>) {
      if (!state.draft) return;
      state.draft.entries = state.draft.entries.filter(e => e.id !== action.payload);
      saveDraftToStorage(state.draft);
    },
  },
});

export const {
  startDraft, clearDraft,
  addSet, updateSet, removeSet, markSetDone,
  addEntry, removeEntry,
} = workoutDraftSlice.actions;

export default workoutDraftSlice.reducer;
