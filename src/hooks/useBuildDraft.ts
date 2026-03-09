import { useAppDispatch, useAppSelector } from '../store/hooks';
import { startDraft } from '../store/slices/workoutDraftSlice';
import { generateId } from '../utils';
import type { DraftEntry, DraftSet, RoutineExercise } from '../types';

/**
 * Returns a function that builds a WorkoutDraft from a routine + selected exercises
 * and dispatches it. Navigation is the caller's responsibility.
 */
export function useBuildDraft() {
  const dispatch  = useAppDispatch();
  const exercises = useAppSelector(s => s.exercises.items);

  return (routineId: string, routineExercises: RoutineExercise[]) => {
    const sessionId = generateId();
    const entries: DraftEntry[] = routineExercises.map((r, i) => {
      const entryId  = `${sessionId}_entry${i}`;
      const isCardio = exercises[r.exerciseId]?.category === 'cardio';
      const sets: DraftSet[] = Array.from({ length: isCardio ? 1 : r.defaultSets }, (_, si) => ({
        id:              `${entryId}_set${si}`,
        setIndex:        si,
        weight:          0,
        reps:            isCardio ? 0 : r.repMin,
        done:            false,
        ...(isCardio ? { durationMinutes: r.repMin > 0 ? r.repMin : 30 } : {}),
      }));
      return { id: entryId, exerciseId: r.exerciseId, order: i, sets };
    });
    dispatch(startDraft({ sessionId, routineId, startedAt: Date.now(), entries }));
  };
}
