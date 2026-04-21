export type TrackerMode = "convex" | "browser";
export type WorkoutEffort = "light" | "steady" | "hard";
export type GoalCategory =
  | "strength"
  | "weight"
  | "habit"
  | "endurance"
  | "other";

export type CheckinRecord = {
  _id: string;
  dateKey: string;
  bodyWeightKg?: number;
  sleepHours: number;
  energy: number;
  mood: number;
  soreness: number;
  hydrationLiters?: number;
  completedWorkout: boolean;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
};

export type WorkoutLogRecord = {
  _id: string;
  dateKey: string;
  exercise: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weightKg?: number;
  durationMinutes?: number;
  effort: WorkoutEffort;
  notes?: string;
  createdAt: number;
};

export type ExerciseRecord = {
  _id: string;
  name: string;
  muscleGroup: string;
  equipment?: string;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeightKg?: number;
  notes?: string;
  createdAt: number;
};

export type GoalRecord = {
  _id: string;
  title: string;
  category: GoalCategory;
  targetValue?: number;
  targetUnit?: string;
  currentValue?: number;
  dueDate?: string;
  completed: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

export type BodyMeasurementRecord = {
  _id: string;
  dateKey: string;
  bodyWeightKg?: number;
  bodyFatPercent?: number;
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  leftArmCm?: number;
  rightArmCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  notes?: string;
  createdAt: number;
};

export type ProgramRecord = {
  _id: string;
  name: string;
  description?: string;
  dayOfWeek?: string;
  createdAt: number;
};

export type ProgramExerciseRecord = {
  _id: string;
  programId: string;
  exercise: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weightKg?: number;
  order: number;
  notes?: string;
};

export type ProgramWithExercises = {
  program: ProgramRecord;
  exercises: ProgramExerciseRecord[];
};

export type DailySummary = {
  dateKey: string;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  totalMinutes: number;
  workoutCount: number;
  completedWorkout: boolean;
  energy: number | null;
  mood: number | null;
  bodyWeightKg: number | null;
};

export type ExerciseHighlight = {
  exercise: string;
  muscleGroup: string;
  bestWeightKg: number | null;
  totalSets: number;
  totalVolume: number;
  lastLoggedAt: number;
};

export type MuscleGroupStat = {
  muscleGroup: string;
  workoutCount: number;
};

export type DashboardData = {
  selectedDateKey: string;
  selectedCheckin: CheckinRecord | null;
  selectedLogs: WorkoutLogRecord[];
  streak: number;
  recentDays: DailySummary[];
  weeklySummary: {
    activeDays: number;
    totalSets: number;
    totalVolume: number;
    totalMinutes: number;
  };
  muscleGroupBreakdown: MuscleGroupStat[];
  exerciseHighlights: ExerciseHighlight[];
};

export type SaveCheckinArgs = {
  dateKey: string;
  sleepHours: number;
  energy: number;
  mood: number;
  soreness: number;
  completedWorkout: boolean;
  bodyWeightKg?: number;
  hydrationLiters?: number;
  notes?: string;
};

export type SaveWorkoutArgs = {
  dateKey: string;
  exercise: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  effort: WorkoutEffort;
  weightKg?: number;
  durationMinutes?: number;
  notes?: string;
};

export type SaveExerciseArgs = {
  name: string;
  muscleGroup: string;
  equipment?: string;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeightKg?: number;
  notes?: string;
};

export type SaveGoalArgs = {
  title: string;
  category: GoalCategory;
  targetValue?: number;
  targetUnit?: string;
  currentValue?: number;
  dueDate?: string;
  notes?: string;
};

export type SaveMeasurementArgs = {
  dateKey: string;
  bodyWeightKg?: number;
  bodyFatPercent?: number;
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  leftArmCm?: number;
  rightArmCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  notes?: string;
};

export type SaveProgramArgs = {
  name: string;
  description?: string;
  dayOfWeek?: string;
};

export type SaveProgramExerciseArgs = {
  programId: string;
  exercise: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weightKg?: number;
  notes?: string;
};

export type ViewKey =
  | "dashboard"
  | "workouts"
  | "checkins"
  | "exercises"
  | "measurements"
  | "goals"
  | "programs"
  | "settings";

export type DataActions = {
  saveCheckin: (args: SaveCheckinArgs) => Promise<unknown>;
  createWorkout: (args: SaveWorkoutArgs) => Promise<unknown>;
  removeWorkout: (id: string) => Promise<void>;
  createExercise: (args: SaveExerciseArgs) => Promise<unknown>;
  removeExercise: (id: string) => Promise<void>;
  createGoal: (args: SaveGoalArgs) => Promise<unknown>;
  toggleGoal: (id: string, completed: boolean) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  createMeasurement: (args: SaveMeasurementArgs) => Promise<unknown>;
  removeMeasurement: (id: string) => Promise<void>;
  createProgram: (args: SaveProgramArgs) => Promise<unknown>;
  removeProgram: (id: string) => Promise<void>;
  addProgramExercise: (args: SaveProgramExerciseArgs) => Promise<unknown>;
  removeProgramExercise: (id: string) => Promise<void>;
};

export type TrackerBundle = {
  mode: TrackerMode;
  dashboard: DashboardData;
  checkins: CheckinRecord[];
  workoutLogs: WorkoutLogRecord[];
  exercises: ExerciseRecord[];
  goals: GoalRecord[];
  measurements: BodyMeasurementRecord[];
  programs: ProgramWithExercises[];
  actions: DataActions;
};
