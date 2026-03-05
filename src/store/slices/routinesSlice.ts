import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Routine, RoutineExercise } from '../../types';
import {
  getRoutines, saveRoutine, deleteRoutine,
  getRoutineExercises, replaceRoutineExercises,
} from '../../firebase/dataLayer';

interface RoutinesState {
  items: Record<string, Routine>;
  routineExercises: Record<string, RoutineExercise>; // by id
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: RoutinesState = { items: {}, routineExercises: {}, status: 'idle' };

export const fetchRoutines = createAsyncThunk('routines/fetchAll', async (uid: string) => {
  const [routines, exercises] = await Promise.all([
    getRoutines(uid),
    getRoutineExercises(uid),
  ]);
  return { routines, exercises };
});

export const upsertRoutine = createAsyncThunk(
  'routines/upsert',
  async ({ uid, routine }: { uid: string; routine: Routine }) => {
    await saveRoutine(uid, routine);
    return routine;
  }
);

export const removeRoutine = createAsyncThunk(
  'routines/remove',
  async ({ uid, id }: { uid: string; id: string }) => {
    await deleteRoutine(uid, id);
    return id;
  }
);

export const saveRoutineExercises = createAsyncThunk(
  'routines/saveExercises',
  async ({ uid, routineId, exercises }: { uid: string; routineId: string; exercises: RoutineExercise[] }) => {
    await replaceRoutineExercises(uid, routineId, exercises);
    return { routineId, exercises };
  }
);

const routinesSlice = createSlice({
  name: 'routines',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchRoutines.pending,   s => { s.status = 'loading'; })
      .addCase(fetchRoutines.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.items  = Object.fromEntries(a.payload.routines.map(r => [r.id, r]));
        s.routineExercises = Object.fromEntries(a.payload.exercises.map(re => [re.id, re]));
      })
      .addCase(fetchRoutines.rejected,  s => { s.status = 'failed'; })
      .addCase(upsertRoutine.fulfilled, (s, a) => { s.items[a.payload.id] = a.payload; })
      .addCase(removeRoutine.fulfilled, (s, a) => { delete s.items[a.payload]; })
      .addCase(saveRoutineExercises.fulfilled, (s, a) => {
        // Remove old entries for this routine
        for (const id of Object.keys(s.routineExercises)) {
          if (s.routineExercises[id].routineId === a.payload.routineId) {
            delete s.routineExercises[id];
          }
        }
        // Add new
        for (const re of a.payload.exercises) {
          s.routineExercises[re.id] = re;
        }
      });
  },
});

export default routinesSlice.reducer;
