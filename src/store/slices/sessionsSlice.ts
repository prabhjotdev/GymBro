import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { WorkoutSession } from '../../types';
import { getSessions } from '../../firebase/dataLayer';

interface SessionsState {
  items: WorkoutSession[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: SessionsState = { items: [], status: 'idle' };

export const fetchSessions = createAsyncThunk('sessions/fetchAll', async (uid: string) => {
  return await getSessions(uid);
});

export const addSession = createAsyncThunk(
  'sessions/add',
  async (session: WorkoutSession) => session
);

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    prependSession(state, action) {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSessions.pending,   s => { s.status = 'loading'; })
      .addCase(fetchSessions.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })
      .addCase(fetchSessions.rejected,  s => { s.status = 'failed'; });
  },
});

export const { prependSession } = sessionsSlice.actions;
export default sessionsSlice.reducer;
