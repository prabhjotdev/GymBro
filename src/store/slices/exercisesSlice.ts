import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Exercise } from '../../types';
import { getExercises, saveExercise, deleteExercise } from '../../firebase/dataLayer';

interface ExercisesState {
  items: Record<string, Exercise>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ExercisesState = { items: {}, status: 'idle' };

export const fetchExercises = createAsyncThunk('exercises/fetchAll', async (uid: string) => {
  return await getExercises(uid);
});

export const upsertExercise = createAsyncThunk(
  'exercises/upsert',
  async ({ uid, exercise }: { uid: string; exercise: Exercise }) => {
    await saveExercise(uid, exercise);
    return exercise;
  }
);

export const removeExercise = createAsyncThunk(
  'exercises/remove',
  async ({ uid, id }: { uid: string; id: string }) => {
    await deleteExercise(uid, id);
    return id;
  }
);

const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchExercises.pending,   s => { s.status = 'loading'; })
      .addCase(fetchExercises.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.items  = Object.fromEntries(a.payload.map(e => [e.id, e]));
      })
      .addCase(fetchExercises.rejected,  s => { s.status = 'failed'; })
      .addCase(upsertExercise.fulfilled, (s, a) => { s.items[a.payload.id] = a.payload; })
      .addCase(removeExercise.fulfilled, (s, a) => { delete s.items[a.payload]; });
  },
});

export default exercisesSlice.reducer;
