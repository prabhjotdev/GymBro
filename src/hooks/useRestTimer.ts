import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectRestTimer } from '../store/selectors';
import { tickRestTimer, stopRestTimer } from '../store/slices/uiSlice';

export function useRestTimer() {
  const dispatch  = useAppDispatch();
  const timer     = useAppSelector(selectRestTimer);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timer.active) {
      intervalRef.current = setInterval(() => {
        dispatch(tickRestTimer());
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer.active, dispatch]);

  // Alert when done
  useEffect(() => {
    if (timer.active && timer.remaining === 0) {
      // Vibration API
      if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
      dispatch(stopRestTimer());
    }
  }, [timer.remaining, timer.active, dispatch]);

  return timer;
}
