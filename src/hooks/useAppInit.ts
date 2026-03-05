/**
 * Initializes Firebase Auth (anonymous sign-in) and seeds data on first run.
 */
import { useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getProfile, seedUserData } from '../firebase/dataLayer';
import { setUser } from '../store/slices/authSlice';
import { fetchProfile } from '../store/slices/profileSlice';
import { fetchExercises } from '../store/slices/exercisesSlice';
import { fetchRoutines } from '../store/slices/routinesSlice';
import { fetchSchedule } from '../store/slices/scheduleSlice';
import { fetchSessions } from '../store/slices/sessionsSlice';
import { useAppDispatch } from '../store/hooks';

export function useAppInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Kick off anonymous sign-in
    signInAnonymously(auth).catch(console.error);

    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) {
        dispatch(setUser(null));
        return;
      }

      dispatch(setUser(user.uid));

      // Check if first run for this user
      const profile = await getProfile(user.uid);
      if (!profile) {
        await seedUserData(user.uid);
      }

      // Load all data in parallel
      await Promise.all([
        dispatch(fetchProfile(user.uid)),
        dispatch(fetchExercises(user.uid)),
        dispatch(fetchRoutines(user.uid)),
        dispatch(fetchSchedule(user.uid)),
        dispatch(fetchSessions(user.uid)),
      ]);
    });

    return () => unsub();
  }, [dispatch]);
}
