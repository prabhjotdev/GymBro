import type { ActivityLevel, Goal } from '../types';

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary',  label: 'Sedentary (desk job, no exercise)' },
  { value: 'light',      label: 'Light (1–3 days/week)' },
  { value: 'moderate',   label: 'Moderate (3–5 days/week)' },
  { value: 'active',     label: 'Active (6–7 days/week)' },
  { value: 'veryActive', label: 'Very Active (athlete / hard labor)' },
];

export const GOAL_OPTIONS: { value: Goal; label: string; color: 'error' | 'success' | 'info' }[] = [
  { value: 'cut',      label: 'Cut (lose fat)',      color: 'error'   },
  { value: 'maintain', label: 'Maintain weight',     color: 'info'    },
  { value: 'bulk',     label: 'Bulk (build muscle)', color: 'success' },
];
