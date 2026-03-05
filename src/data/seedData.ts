import type { Exercise, Routine, RoutineExercise, ScheduleTemplate } from '../types';

// ─── Predefined Exercise Library ─────────────────────────────────────────────

export const SEED_EXERCISES: Omit<Exercise, 'isCustom'>[] = [
  // Chest
  { id: 'ex_bench_press',        name: 'Barbell Bench Press',      category: 'chest',     equipment: 'barbell' },
  { id: 'ex_incline_bench',      name: 'Incline Bench Press',      category: 'chest',     equipment: 'barbell' },
  { id: 'ex_db_fly',             name: 'Dumbbell Fly',             category: 'chest',     equipment: 'dumbbell' },
  { id: 'ex_cable_fly',          name: 'Cable Fly',                category: 'chest',     equipment: 'cable' },
  { id: 'ex_dips',               name: 'Chest Dips',               category: 'chest',     equipment: 'bodyweight' },
  { id: 'ex_pushup',             name: 'Push-up',                  category: 'chest',     equipment: 'bodyweight' },
  // Shoulders
  { id: 'ex_ohp',                name: 'Overhead Press',           category: 'shoulders', equipment: 'barbell' },
  { id: 'ex_db_shoulder_press',  name: 'DB Shoulder Press',        category: 'shoulders', equipment: 'dumbbell' },
  { id: 'ex_lateral_raise',      name: 'Lateral Raise',            category: 'shoulders', equipment: 'dumbbell' },
  { id: 'ex_front_raise',        name: 'Front Raise',              category: 'shoulders', equipment: 'dumbbell' },
  { id: 'ex_face_pull',          name: 'Face Pull',                category: 'shoulders', equipment: 'cable' },
  // Triceps
  { id: 'ex_tricep_pushdown',    name: 'Tricep Pushdown',          category: 'triceps',   equipment: 'cable' },
  { id: 'ex_skullcrusher',       name: 'Skull Crusher',            category: 'triceps',   equipment: 'barbell' },
  { id: 'ex_overhead_extension', name: 'Overhead Tricep Extension',category: 'triceps',   equipment: 'dumbbell' },
  // Back
  { id: 'ex_deadlift',           name: 'Deadlift',                 category: 'back',      equipment: 'barbell' },
  { id: 'ex_pullup',             name: 'Pull-up',                  category: 'back',      equipment: 'bodyweight' },
  { id: 'ex_bb_row',             name: 'Barbell Row',              category: 'back',      equipment: 'barbell' },
  { id: 'ex_db_row',             name: 'Dumbbell Row',             category: 'back',      equipment: 'dumbbell' },
  { id: 'ex_cable_row',          name: 'Cable Row',                category: 'back',      equipment: 'cable' },
  { id: 'ex_lat_pulldown',       name: 'Lat Pulldown',             category: 'back',      equipment: 'cable' },
  { id: 'ex_pullover',           name: 'Cable Pullover',           category: 'back',      equipment: 'cable' },
  // Biceps
  { id: 'ex_bb_curl',            name: 'Barbell Curl',             category: 'biceps',    equipment: 'barbell' },
  { id: 'ex_db_curl',            name: 'Dumbbell Curl',            category: 'biceps',    equipment: 'dumbbell' },
  { id: 'ex_hammer_curl',        name: 'Hammer Curl',              category: 'biceps',    equipment: 'dumbbell' },
  { id: 'ex_incline_curl',       name: 'Incline Curl',             category: 'biceps',    equipment: 'dumbbell' },
  // Legs
  { id: 'ex_squat',              name: 'Barbell Squat',            category: 'legs',      equipment: 'barbell' },
  { id: 'ex_leg_press',          name: 'Leg Press',                category: 'legs',      equipment: 'machine' },
  { id: 'ex_rdl',                name: 'Romanian Deadlift',        category: 'legs',      equipment: 'barbell' },
  { id: 'ex_leg_curl',           name: 'Lying Leg Curl',           category: 'legs',      equipment: 'machine' },
  { id: 'ex_leg_extension',      name: 'Leg Extension',            category: 'legs',      equipment: 'machine' },
  { id: 'ex_lunge',              name: 'Walking Lunge',            category: 'legs',      equipment: 'dumbbell' },
  { id: 'ex_calf_raise',         name: 'Standing Calf Raise',      category: 'legs',      equipment: 'machine' },
  // Core
  { id: 'ex_plank',              name: 'Plank',                    category: 'core',      equipment: 'bodyweight' },
  { id: 'ex_crunch',             name: 'Crunch',                   category: 'core',      equipment: 'bodyweight' },
  { id: 'ex_cable_crunch',       name: 'Cable Crunch',             category: 'core',      equipment: 'cable' },
  { id: 'ex_ab_wheel',           name: 'Ab Wheel Rollout',         category: 'core',      equipment: 'bodyweight' },
  // Cardio
  { id: 'ex_treadmill',          name: 'Treadmill',                category: 'cardio',    equipment: 'cardio' },
  { id: 'ex_bike',               name: 'Stationary Bike',          category: 'cardio',    equipment: 'cardio' },
  { id: 'ex_elliptical',         name: 'Elliptical',               category: 'cardio',    equipment: 'cardio' },
  { id: 'ex_rowing',             name: 'Rowing Machine',           category: 'cardio',    equipment: 'cardio' },
  { id: 'ex_jump_rope',          name: 'Jump Rope',                category: 'cardio',    equipment: 'bodyweight' },
];

// ─── Default Routines ─────────────────────────────────────────────────────────

export const SEED_ROUTINES: Routine[] = [
  { id: 'routine_push', name: 'Push', description: 'Chest, Shoulders & Triceps', createdAt: 0, updatedAt: 0 },
  { id: 'routine_pull', name: 'Pull', description: 'Back & Biceps',              createdAt: 0, updatedAt: 0 },
  { id: 'routine_legs', name: 'Legs', description: 'Quads, Hamstrings & Calves', createdAt: 0, updatedAt: 0 },
  { id: 'routine_cardio', name: 'Cardio', description: 'Cardiovascular Training', createdAt: 0, updatedAt: 0 },
];

export const SEED_ROUTINE_EXERCISES: Omit<RoutineExercise, 'id'>[] = [
  // Push
  { routineId: 'routine_push', exerciseId: 'ex_bench_press',        order: 0, defaultSets: 4, repMin: 6,  repMax: 10, restSeconds: 120 },
  { routineId: 'routine_push', exerciseId: 'ex_incline_bench',      order: 1, defaultSets: 3, repMin: 8,  repMax: 12, restSeconds: 90  },
  { routineId: 'routine_push', exerciseId: 'ex_ohp',                order: 2, defaultSets: 3, repMin: 8,  repMax: 12, restSeconds: 90  },
  { routineId: 'routine_push', exerciseId: 'ex_lateral_raise',      order: 3, defaultSets: 3, repMin: 12, repMax: 15, restSeconds: 60  },
  { routineId: 'routine_push', exerciseId: 'ex_tricep_pushdown',    order: 4, defaultSets: 3, repMin: 10, repMax: 15, restSeconds: 60  },
  { routineId: 'routine_push', exerciseId: 'ex_overhead_extension', order: 5, defaultSets: 3, repMin: 10, repMax: 15, restSeconds: 60  },
  // Pull
  { routineId: 'routine_pull', exerciseId: 'ex_pullup',             order: 0, defaultSets: 4, repMin: 5,  repMax: 10, restSeconds: 120 },
  { routineId: 'routine_pull', exerciseId: 'ex_bb_row',             order: 1, defaultSets: 4, repMin: 6,  repMax: 10, restSeconds: 90  },
  { routineId: 'routine_pull', exerciseId: 'ex_lat_pulldown',       order: 2, defaultSets: 3, repMin: 8,  repMax: 12, restSeconds: 90  },
  { routineId: 'routine_pull', exerciseId: 'ex_cable_row',          order: 3, defaultSets: 3, repMin: 10, repMax: 15, restSeconds: 60  },
  { routineId: 'routine_pull', exerciseId: 'ex_face_pull',          order: 4, defaultSets: 3, repMin: 12, repMax: 20, restSeconds: 60  },
  { routineId: 'routine_pull', exerciseId: 'ex_bb_curl',            order: 5, defaultSets: 3, repMin: 8,  repMax: 12, restSeconds: 60  },
  { routineId: 'routine_pull', exerciseId: 'ex_hammer_curl',        order: 6, defaultSets: 3, repMin: 10, repMax: 15, restSeconds: 60  },
  // Legs
  { routineId: 'routine_legs', exerciseId: 'ex_squat',              order: 0, defaultSets: 4, repMin: 5,  repMax: 8,  restSeconds: 180 },
  { routineId: 'routine_legs', exerciseId: 'ex_leg_press',          order: 1, defaultSets: 3, repMin: 10, repMax: 15, restSeconds: 120 },
  { routineId: 'routine_legs', exerciseId: 'ex_rdl',                order: 2, defaultSets: 3, repMin: 8,  repMax: 12, restSeconds: 90  },
  { routineId: 'routine_legs', exerciseId: 'ex_leg_curl',           order: 3, defaultSets: 3, repMin: 10, repMax: 15, restSeconds: 60  },
  { routineId: 'routine_legs', exerciseId: 'ex_leg_extension',      order: 4, defaultSets: 3, repMin: 10, repMax: 15, restSeconds: 60  },
  { routineId: 'routine_legs', exerciseId: 'ex_calf_raise',         order: 5, defaultSets: 4, repMin: 15, repMax: 20, restSeconds: 60  },
  // Cardio
  { routineId: 'routine_cardio', exerciseId: 'ex_treadmill',        order: 0, defaultSets: 1, repMin: 20, repMax: 45, restSeconds: 60  },
  { routineId: 'routine_cardio', exerciseId: 'ex_bike',             order: 1, defaultSets: 1, repMin: 15, repMax: 30, restSeconds: 60  },
];

/** Default PPL-ish weekly schedule (Mon=Push, Wed=Pull, Fri=Legs, Sat=Cardio) */
export const SEED_SCHEDULE: Omit<ScheduleTemplate, 'id'>[] = [
  { dayOfWeek: 1, routineId: 'routine_push'  }, // Monday
  { dayOfWeek: 3, routineId: 'routine_pull'  }, // Wednesday
  { dayOfWeek: 5, routineId: 'routine_legs'  }, // Friday
  { dayOfWeek: 6, routineId: 'routine_cardio'}, // Saturday
];
