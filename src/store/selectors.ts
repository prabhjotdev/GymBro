import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { DayOfWeek, RoutineExercise } from '../types';

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const selectUid     = (s: RootState) => s.auth.uid;
export const selectAuthLoading = (s: RootState) => s.auth.loading;

// ─── Today ────────────────────────────────────────────────────────────────────

export const selectTodayRoutine = createSelector(
  [(s: RootState) => s.schedule.items, (s: RootState) => s.routines.items],
  (schedule, routines) => {
    const today = new Date().getDay() as DayOfWeek;
    const slot  = schedule[today];
    if (!slot) return null;
    return routines[slot.routineId] ?? null;
  }
);

export const selectNextScheduledDay = createSelector(
  [(s: RootState) => s.schedule.items, (s: RootState) => s.routines.items],
  (schedule, routines) => {
    const today = new Date().getDay();
    // Look forward up to 7 days
    for (let offset = 0; offset < 7; offset++) {
      const day = ((today + offset) % 7) as DayOfWeek;
      const slot = schedule[day];
      if (slot && routines[slot.routineId]) {
        return { day, offset, routine: routines[slot.routineId] };
      }
    }
    return null;
  }
);

// ─── Routines ─────────────────────────────────────────────────────────────────

export const selectRoutineExercisesForRoutine = createSelector(
  [
    (s: RootState) => s.routines.routineExercises,
    (_: RootState, routineId: string) => routineId,
  ],
  (allREs, routineId): RoutineExercise[] =>
    Object.values(allREs)
      .filter(re => re.routineId === routineId)
      .sort((a, b) => a.order - b.order)
);

export const selectExerciseList = createSelector(
  (s: RootState) => s.exercises.items,
  items => Object.values(items).sort((a, b) => a.name.localeCompare(b.name))
);

export const selectRoutineList = createSelector(
  (s: RootState) => s.routines.items,
  items => Object.values(items).sort((a, b) => a.name.localeCompare(b.name))
);

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const selectRecentSessions = createSelector(
  (s: RootState) => s.sessions.items,
  sessions => [...sessions].sort((a, b) => b.date - a.date)
);

// ─── Draft ────────────────────────────────────────────────────────────────────

export const selectDraft          = (s: RootState) => s.workoutDraft.draft;
export const selectDraftEntries   = (s: RootState) => s.workoutDraft.draft?.entries ?? [];
export const selectDraftEntryById = createSelector(
  [(s: RootState) => s.workoutDraft.draft?.entries, (_: RootState, id: string) => id],
  (entries, id) => entries?.find(e => e.id === id) ?? null
);

// ─── UI ───────────────────────────────────────────────────────────────────────

export const selectDarkMode   = (s: RootState) => s.ui.darkMode;
export const selectSnackbar   = (s: RootState) => s.ui.snackbar;
export const selectRestTimer  = (s: RootState) => s.ui.restTimer;
