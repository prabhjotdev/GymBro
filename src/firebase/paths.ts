/** Centralised Firestore path helpers to avoid typos */
export const paths = {
  profile:         (uid: string) => `users/${uid}/profile`,
  exercises:       (uid: string) => `users/${uid}/exercises`,
  exercise:        (uid: string, id: string) => `users/${uid}/exercises/${id}`,
  routines:        (uid: string) => `users/${uid}/routines`,
  routine:         (uid: string, id: string) => `users/${uid}/routines/${id}`,
  routineExercises:(uid: string) => `users/${uid}/routineExercises`,
  routineExercise: (uid: string, id: string) => `users/${uid}/routineExercises/${id}`,
  schedule:        (uid: string) => `users/${uid}/scheduleTemplate`,
  scheduleItem:    (uid: string, id: string) => `users/${uid}/scheduleTemplate/${id}`,
  sessions:        (uid: string) => `users/${uid}/workoutSessions`,
  session:         (uid: string, id: string) => `users/${uid}/workoutSessions/${id}`,
  entries:         (uid: string) => `users/${uid}/workoutEntries`,
  entry:           (uid: string, id: string) => `users/${uid}/workoutEntries/${id}`,
  sets:            (uid: string) => `users/${uid}/setEntries`,
  set:             (uid: string, id: string) => `users/${uid}/setEntries/${id}`,
};
