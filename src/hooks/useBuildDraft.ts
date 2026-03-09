import { useAppDispatch } from '../store/hooks';
import { startDraft } from '../store/slices/workoutDraftSlice';
import { generateId } from '../utils';
import type { DraftEntry, DraftSet, RoutineExercise } from '../types';

/**
 * Returns a function that builds a WorkoutDraft from a routine + selected exercises
 * and dispatches it. Navigation is the caller's responsibility.
 */
export function useBuildDraft() {
  const dispatch = useAppDispatch();

  return (routineId: string, routineExercises: RoutineExercise[]) => {
    const sessionId = generateId();
    const entries: DraftEntry[] = routineExercises.map((r, i) => {
      const entryId = `${sessionId}_entry${i}`;
      const sets: DraftSet[] = Array.from({ length: r.defaultSets }, (_, si) => ({
        id:       `${entryId}_set${si}`,
        setIndex: si,
        weight:   0,
        reps:     r.repMin,
        done:     false,
      }));
      return { id: entryId, exerciseId: r.exerciseId, order: i, sets };
    });
    dispatch(startDraft({ sessionId, routineId, startedAt: Date.now(), entries }));
  };
}
