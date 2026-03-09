/**
 * Firebase Data Layer
 * Wraps all Firestore CRUD, queries, and batch operations.
 */
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  query, where, orderBy, limit,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';

import { db } from './config';
import { paths } from './paths';
import type {
  UserProfile, Exercise, Routine, RoutineExercise,
  ScheduleTemplate, WorkoutSession, WorkoutEntry, SetEntry,
  WorkoutDraft,
} from '../types';
import { SEED_EXERCISES, SEED_ROUTINES, SEED_ROUTINE_EXERCISES, SEED_SCHEDULE } from '../data/seedData';

export interface GymBroExport {
  version: 1;
  exportedAt: number;
  data: {
    profile: UserProfile;
    exercises: Exercise[];
    routines: Routine[];
    routineExercises: RoutineExercise[];
    schedule: ScheduleTemplate[];
    sessions: WorkoutSession[];
    entries: WorkoutEntry[];
    sets: SetEntry[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

async function colDocs<T>(path: string, ...constraints: QueryConstraint[]): Promise<T[]> {
  const q = constraints.length
    ? query(collection(db, path), ...constraints)
    : query(collection(db, path));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
}

// ─── Seeding ─────────────────────────────────────────────────────────────────

export async function seedUserData(uid: string): Promise<void> {
  const now = Date.now();
  const batch = writeBatch(db);

  // Profile placeholder
  const profileRef = doc(db, paths.profile(uid));
  batch.set(profileRef, { uid, createdAt: now, updatedAt: now });

  // Exercises
  for (const ex of SEED_EXERCISES) {
    const ref = doc(db, paths.exercise(uid, ex.id));
    batch.set(ref, { ...ex, isCustom: false });
  }

  // Routines
  for (const r of SEED_ROUTINES) {
    const ref = doc(db, paths.routine(uid, r.id));
    batch.set(ref, { ...r, createdAt: now, updatedAt: now });
  }

  // Routine Exercises
  for (const re of SEED_ROUTINE_EXERCISES) {
    const id = `${re.routineId}_${re.exerciseId}`;
    const ref = doc(db, paths.routineExercise(uid, id));
    batch.set(ref, { ...re, id });
  }

  // Schedule
  for (const s of SEED_SCHEDULE) {
    const id = `day_${s.dayOfWeek}`;
    const ref = doc(db, paths.scheduleItem(uid, id));
    batch.set(ref, { ...s, id });
  }

  await batch.commit();
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, paths.profile(uid)));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function saveProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, paths.profile(uid));
  await setDoc(ref, { ...stripUndefined(data), updatedAt: Date.now() }, { merge: true });
}

// ─── Exercises ────────────────────────────────────────────────────────────────

export async function getExercises(uid: string): Promise<Exercise[]> {
  return colDocs<Exercise>(paths.exercises(uid));
}

export async function saveExercise(uid: string, exercise: Exercise): Promise<void> {
  await setDoc(doc(db, paths.exercise(uid, exercise.id)), exercise);
}

export async function deleteExercise(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, paths.exercise(uid, id)));
}

// ─── Routines ─────────────────────────────────────────────────────────────────

export async function getRoutines(uid: string): Promise<Routine[]> {
  return colDocs<Routine>(paths.routines(uid));
}

export async function saveRoutine(uid: string, routine: Routine): Promise<void> {
  await setDoc(doc(db, paths.routine(uid, routine.id)), routine);
}

export async function deleteRoutine(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, paths.routine(uid, id)));
}

// ─── Routine Exercises ────────────────────────────────────────────────────────

export async function getRoutineExercises(uid: string, routineId?: string): Promise<RoutineExercise[]> {
  const constraints: QueryConstraint[] = routineId
    ? [where('routineId', '==', routineId), orderBy('order')]
    : [orderBy('order')];
  return colDocs<RoutineExercise>(paths.routineExercises(uid), ...constraints);
}

export async function saveRoutineExercise(uid: string, re: RoutineExercise): Promise<void> {
  await setDoc(doc(db, paths.routineExercise(uid, re.id)), re);
}

export async function deleteRoutineExercise(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, paths.routineExercise(uid, id)));
}

/** Replace all exercises for a routine atomically */
export async function replaceRoutineExercises(
  uid: string,
  routineId: string,
  exercises: RoutineExercise[]
): Promise<void> {
  const batch = writeBatch(db);
  // Delete existing
  const existing = await getRoutineExercises(uid, routineId);
  for (const re of existing) {
    batch.delete(doc(db, paths.routineExercise(uid, re.id)));
  }
  // Write new
  for (const re of exercises) {
    batch.set(doc(db, paths.routineExercise(uid, re.id)), re);
  }
  await batch.commit();
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export async function getSchedule(uid: string): Promise<ScheduleTemplate[]> {
  return colDocs<ScheduleTemplate>(paths.schedule(uid));
}

export async function setScheduleDay(uid: string, item: ScheduleTemplate): Promise<void> {
  await setDoc(doc(db, paths.scheduleItem(uid, item.id)), item);
}

export async function removeScheduleDay(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, paths.scheduleItem(uid, id)));
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

export async function getSessions(uid: string, limitCount = 50): Promise<WorkoutSession[]> {
  return colDocs<WorkoutSession>(
    paths.sessions(uid),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
}

export async function getSession(uid: string, id: string): Promise<WorkoutSession | null> {
  const snap = await getDoc(doc(db, paths.session(uid, id)));
  return snap.exists() ? (snap.data() as WorkoutSession) : null;
}

// ─── Workout Entries + Sets ───────────────────────────────────────────────────

export async function getEntriesForSession(uid: string, sessionId: string): Promise<WorkoutEntry[]> {
  return colDocs<WorkoutEntry>(paths.entries(uid), where('sessionId', '==', sessionId), orderBy('order'));
}

export async function getSetsForEntry(uid: string, entryId: string): Promise<SetEntry[]> {
  return colDocs<SetEntry>(paths.sets(uid), where('workoutEntryId', '==', entryId), orderBy('setIndex'));
}

export async function getSetsForSession(uid: string, sessionId: string): Promise<SetEntry[]> {
  // Get all entries first, then query sets in one pass
  const entries = await getEntriesForSession(uid, sessionId);
  const entryIds = entries.map(e => e.id);
  if (entryIds.length === 0) return [];
  // Firestore 'in' supports up to 30 items; good enough for MVP
  return colDocs<SetEntry>(paths.sets(uid), where('workoutEntryId', 'in', entryIds));
}

// ─── Last Performance ─────────────────────────────────────────────────────────

export async function getLastPerformanceForExercise(
  uid: string,
  exerciseId: string
): Promise<{ sessionDate: number; sets: SetEntry[] } | null> {
  // Find the most recent session that contains an entry for this exercise
  const allEntries = await colDocs<WorkoutEntry>(
    paths.entries(uid),
    where('exerciseId', '==', exerciseId)
  );
  if (allEntries.length === 0) return null;

  const sessionIds = [...new Set(allEntries.map(e => e.sessionId))];
  // Fetch sessions and pick most recent completed
  const sessions = await Promise.all(
    sessionIds.map(id => getSession(uid, id))
  );
  const completed = sessions
    .filter((s): s is WorkoutSession => s?.status === 'completed')
    .sort((a, b) => b.date - a.date);

  if (completed.length === 0) return null;
  const latestSession = completed[0];
  const entry = allEntries.find(e => e.sessionId === latestSession.id);
  if (!entry) return null;

  const sets = await getSetsForEntry(uid, entry.id);
  return { sessionDate: latestSession.date, sets };
}

// ─── Atomic Finish Workout ────────────────────────────────────────────────────

export async function commitWorkout(
  uid: string,
  draft: WorkoutDraft,
  durationSeconds: number,
  notes?: string
): Promise<void> {
  const batch = writeBatch(db);
  const now = Date.now();

  // WorkoutSession
  const sessionRef = doc(db, paths.session(uid, draft.sessionId));
  batch.set(sessionRef, {
    id: draft.sessionId,
    date: draft.startedAt,
    routineId: draft.routineId,
    durationSeconds,
    status: 'completed',
    notes: notes ?? '',
  } satisfies WorkoutSession);

  for (const entry of draft.entries) {
    // WorkoutEntry
    const entryRef = doc(db, paths.entry(uid, entry.id));
    batch.set(entryRef, {
      id: entry.id,
      sessionId: draft.sessionId,
      exerciseId: entry.exerciseId,
      order: entry.order,
    } satisfies WorkoutEntry);

    // SetEntries (only completed sets)
    const doneSets = entry.sets.filter(s => s.done);
    for (const s of doneSets) {
      const setId = `${entry.id}_set${s.setIndex}`;
      const setRef = doc(db, paths.set(uid, setId));
      batch.set(setRef, {
        id: setId,
        workoutEntryId: entry.id,
        setIndex: s.setIndex,
        weight: s.weight,
        reps: s.reps,
        isWarmup: s.isWarmup ?? false,
        completedAt: now,
      } satisfies SetEntry);
    }
  }

  await batch.commit();
}

// ─── Data Management ──────────────────────────────────────────────────────────

async function deleteCollection(colPath: string): Promise<void> {
  const snap = await getDocs(collection(db, colPath));
  for (let i = 0; i < snap.docs.length; i += 450) {
    const b = writeBatch(db);
    snap.docs.slice(i, i + 450).forEach(d => b.delete(d.ref));
    await b.commit();
  }
}

export async function exportUserData(uid: string): Promise<GymBroExport> {
  const [profile, exercises, routines, routineExercises, schedule] = await Promise.all([
    getProfile(uid),
    getExercises(uid),
    getRoutines(uid),
    getRoutineExercises(uid),
    getSchedule(uid),
  ]);
  const [sessions, entries, sets] = await Promise.all([
    colDocs<WorkoutSession>(paths.sessions(uid)),
    colDocs<WorkoutEntry>(paths.entries(uid)),
    colDocs<SetEntry>(paths.sets(uid)),
  ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    data: { profile: profile!, exercises, routines, routineExercises, schedule, sessions, entries, sets },
  };
}

export async function deleteAllUserData(uid: string): Promise<void> {
  await Promise.all([
    paths.exercises(uid), paths.routines(uid), paths.routineExercises(uid),
    paths.schedule(uid), paths.sessions(uid), paths.entries(uid), paths.sets(uid),
  ].map(deleteCollection));
  await deleteDoc(doc(db, paths.profile(uid)));
  await seedUserData(uid);
}

export async function importUserData(uid: string, exported: GymBroExport): Promise<void> {
  await deleteAllUserData(uid);
  const { data } = exported;
  const allWrites: Array<[string, object]> = [
    [paths.profile(uid), { ...data.profile, uid }],
    ...data.exercises.map(e => [paths.exercise(uid, e.id), e] as [string, object]),
    ...data.routines.map(r => [paths.routine(uid, r.id), r] as [string, object]),
    ...data.routineExercises.map(re => [paths.routineExercise(uid, re.id), re] as [string, object]),
    ...data.schedule.map(s => [paths.scheduleItem(uid, s.id), s] as [string, object]),
    ...data.sessions.map(s => [paths.session(uid, s.id), s] as [string, object]),
    ...data.entries.map(e => [paths.entry(uid, e.id), e] as [string, object]),
    ...data.sets.map(s => [paths.set(uid, s.id), s] as [string, object]),
  ];
  for (let i = 0; i < allWrites.length; i += 450) {
    const b = writeBatch(db);
    allWrites.slice(i, i + 450).forEach(([p, d]) => b.set(doc(db, p), d));
    await b.commit();
  }
}
