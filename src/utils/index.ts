import type { UserProfile, CalorieRecommendation, SetEntry } from '../types';

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Fitness calculations ─────────────────────────────────────────────────────

/** Epley formula estimated 1RM */
export function estimated1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/** Best set = highest weight; returns estimated 1RM */
export function calcBestSet(sets: SetEntry[]): { weight: number; reps: number; e1rm: number } | null {
  if (sets.length === 0) return null;
  const best = sets.reduce((a, b) => (b.weight > a.weight ? b : a));
  return { weight: best.weight, reps: best.reps, e1rm: estimated1RM(best.weight, best.reps) };
}

/** Mifflin-St Jeor BMR + activity multiplier → maintenance calories */
const ACTIVITY_MULTIPLIERS = {
  sedentary:  1.2,
  light:      1.375,
  moderate:   1.55,
  active:     1.725,
  veryActive: 1.9,
};

export function calcCalories(profile: Partial<UserProfile>): CalorieRecommendation | null {
  const { age, heightCm, weightKg, activityLevel, goal } = profile;
  if (!age || !heightCm || !weightKg || !activityLevel || !goal) return null;

  // BMR (using average of male/female estimates ±5%)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const mult = ACTIVITY_MULTIPLIERS[activityLevel];
  const maint = bmr * mult;

  const low  = Math.round(maint * 0.97);
  const high = Math.round(maint * 1.03);

  let goalLow: number, goalHigh: number;
  if (goal === 'cut')  { goalLow = low  - 500; goalHigh = high - 300; }
  else if (goal === 'bulk') { goalLow = low + 250; goalHigh = high + 500; }
  else                 { goalLow = low;        goalHigh = high; }

  const proteinLow  = Math.round(weightKg * 1.6);
  const proteinHigh = Math.round(weightKg * 2.2);

  return { maintenanceLow: low, maintenanceHigh: high, goalLow, goalHigh, proteinLow, proteinHigh };
}
