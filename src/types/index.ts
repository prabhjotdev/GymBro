// ─── Core Domain Types ────────────────────────────────────────────────────────

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export type Goal = 'maintain' | 'cut' | 'bulk';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
export type WorkoutStatus = 'draft' | 'completed';
export type ExerciseCategory = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core' | 'cardio' | 'full_body';
export type Equipment = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell' | 'band' | 'cardio';

// ─── Firestore Document Types ─────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevel;
  goal?: Goal;
  darkMode?: boolean;
  createdAt: number; // epoch ms
  updatedAt: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment?: Equipment;
  isCustom: boolean;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  order: number;
  defaultSets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
}

/** dayOfWeek → routineId; one doc per day slot */
export interface ScheduleTemplate {
  id: string;
  dayOfWeek: DayOfWeek;
  routineId: string;
}

export interface WorkoutSession {
  id: string;
  date: number; // epoch ms
  routineId: string;
  durationSeconds: number;
  status: WorkoutStatus;
  notes?: string;
}

export interface WorkoutEntry {
  id: string;
  sessionId: string;
  exerciseId: string;
  order: number;
}

export interface SetEntry {
  id: string;
  workoutEntryId: string;
  setIndex: number;
  weight: number; // kg
  reps: number;
  isWarmup?: boolean;
  completedAt?: number; // epoch ms
}

// ─── UI / Draft Types ──────────────────────────────────────────────────────────

export interface DraftSet {
  id: string;
  setIndex: number;
  weight: number;
  reps: number;
  isWarmup?: boolean;
  done: boolean;
}

export interface DraftEntry {
  id: string;          // deterministic WorkoutEntry id
  exerciseId: string;
  order: number;
  sets: DraftSet[];
}

export interface WorkoutDraft {
  sessionId: string;
  routineId: string;
  startedAt: number; // epoch ms
  entries: DraftEntry[];
}

// ─── Calculated / UI helpers ──────────────────────────────────────────────────

export interface LastPerformance {
  exerciseId: string;
  sessionDate: number;
  bestWeight: number;
  repsAtBest: number;
  /** Epley estimated 1RM */
  estimated1RM: number;
}

export interface CalorieRecommendation {
  maintenanceLow: number;
  maintenanceHigh: number;
  goalLow: number;
  goalHigh: number;
  proteinLow: number;  // g/day
  proteinHigh: number; // g/day
}
