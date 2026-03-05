import { configureStore } from '@reduxjs/toolkit';
import authReducer        from './slices/authSlice';
import profileReducer     from './slices/profileSlice';
import exercisesReducer   from './slices/exercisesSlice';
import routinesReducer    from './slices/routinesSlice';
import scheduleReducer    from './slices/scheduleSlice';
import sessionsReducer    from './slices/sessionsSlice';
import workoutDraftReducer from './slices/workoutDraftSlice';
import uiReducer          from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    profile:      profileReducer,
    exercises:    exercisesReducer,
    routines:     routinesReducer,
    schedule:     scheduleReducer,
    sessions:     sessionsReducer,
    workoutDraft: workoutDraftReducer,
    ui:           uiReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
