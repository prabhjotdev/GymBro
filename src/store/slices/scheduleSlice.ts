import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ScheduleTemplate, DayOfWeek } from '../../types';
import { getSchedule, setScheduleDay, removeScheduleDay } from '../../firebase/dataLayer';

type ScheduleState = {
  items: Record<number, ScheduleTemplate>; // keyed by dayOfWeek
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
};

const initialState: ScheduleState = { items: {}, status: 'idle' };

export const fetchSchedule = createAsyncThunk('schedule/fetch', async (uid: string) => {
  return await getSchedule(uid);
});

export const upsertScheduleDay = createAsyncThunk(
  'schedule/upsertDay',
  async ({ uid, item }: { uid: string; item: ScheduleTemplate }) => {
    await setScheduleDay(uid, item);
    return item;
  }
);

export const deleteScheduleDay = createAsyncThunk(
  'schedule/deleteDay',
  async ({ uid, id, dayOfWeek }: { uid: string; id: string; dayOfWeek: DayOfWeek }) => {
    await removeScheduleDay(uid, id);
    return dayOfWeek;
  }
);

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSchedule.pending,   s => { s.status = 'loading'; })
      .addCase(fetchSchedule.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.items  = Object.fromEntries(a.payload.map(i => [i.dayOfWeek, i]));
      })
      .addCase(fetchSchedule.rejected,  s => { s.status = 'failed'; })
      .addCase(upsertScheduleDay.fulfilled, (s, a) => { s.items[a.payload.dayOfWeek] = a.payload; })
      .addCase(deleteScheduleDay.fulfilled, (s, a) => { delete s.items[a.payload]; });
  },
});

export default scheduleSlice.reducer;
