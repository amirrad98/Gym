import { useEffect, useMemo, useState } from "react";
import type {
  BodyMeasurementRecord,
  CheckinRecord,
  ExerciseRecord,
  GoalRecord,
  ProgramExerciseRecord,
  ProgramRecord,
  ProgramWithExercises,
  SaveCheckinArgs,
  SaveExerciseArgs,
  SaveGoalArgs,
  SaveMeasurementArgs,
  SaveProgramArgs,
  SaveProgramExerciseArgs,
  SaveWorkoutArgs,
  TrackerBundle,
  WorkoutLogRecord,
} from "./types";
import { buildDashboardData } from "./dashboard";
import { createLocalId } from "./utils";

const LOCAL_STORAGE_KEY = "gym-tracker-browser-data-v2";

type LocalStore = {
  checkins: CheckinRecord[];
  workoutLogs: WorkoutLogRecord[];
  exercises: ExerciseRecord[];
  goals: GoalRecord[];
  measurements: BodyMeasurementRecord[];
  programs: ProgramRecord[];
  programExercises: ProgramExerciseRecord[];
};

function emptyStore(): LocalStore {
  return {
    checkins: [],
    workoutLogs: [],
    exercises: [],
    goals: [],
    measurements: [],
    programs: [],
    programExercises: [],
  };
}

function loadStore(): LocalStore {
  if (typeof window === "undefined") return emptyStore();
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    // Migrate old key, if present
    const legacy = window.localStorage.getItem("gym-tracker-browser-data-v1");
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as Partial<LocalStore>;
        return {
          ...emptyStore(),
          checkins: Array.isArray(parsed.checkins) ? parsed.checkins : [],
          workoutLogs: Array.isArray(parsed.workoutLogs) ? parsed.workoutLogs : [],
        };
      } catch {
        return emptyStore();
      }
    }
    return emptyStore();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<LocalStore>;
    return {
      ...emptyStore(),
      ...parsed,
      checkins: Array.isArray(parsed.checkins) ? parsed.checkins : [],
      workoutLogs: Array.isArray(parsed.workoutLogs) ? parsed.workoutLogs : [],
      exercises: Array.isArray(parsed.exercises) ? parsed.exercises : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      measurements: Array.isArray(parsed.measurements) ? parsed.measurements : [],
      programs: Array.isArray(parsed.programs) ? parsed.programs : [],
      programExercises: Array.isArray(parsed.programExercises)
        ? parsed.programExercises
        : [],
    };
  } catch {
    return emptyStore();
  }
}

export function useLocalTracker(selectedDateKey: string): TrackerBundle {
  const [store, setStore] = useState<LocalStore>(loadStore);

  useEffect(() => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const dashboard = useMemo(
    () => buildDashboardData(selectedDateKey, store.checkins, store.workoutLogs),
    [selectedDateKey, store.checkins, store.workoutLogs],
  );

  const programs = useMemo<ProgramWithExercises[]>(() => {
    return store.programs
      .map((program) => ({
        program,
        exercises: store.programExercises
          .filter((ex) => ex.programId === program._id)
          .sort((a, b) => a.order - b.order),
      }))
      .sort((a, b) => a.program.name.localeCompare(b.program.name));
  }, [store.programs, store.programExercises]);

  async function saveCheckin(args: SaveCheckinArgs) {
    setStore((current) => {
      const existing = current.checkins.find((c) => c.dateKey === args.dateKey);
      const now = Date.now();
      const nextRecord: CheckinRecord = {
        _id: existing?._id ?? createLocalId("checkin"),
        dateKey: args.dateKey,
        sleepHours: args.sleepHours,
        energy: args.energy,
        mood: args.mood,
        soreness: args.soreness,
        completedWorkout: args.completedWorkout,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        ...(args.bodyWeightKg !== undefined ? { bodyWeightKg: args.bodyWeightKg } : {}),
        ...(args.hydrationLiters !== undefined
          ? { hydrationLiters: args.hydrationLiters }
          : {}),
        ...(args.notes ? { notes: args.notes } : {}),
      };
      return {
        ...current,
        checkins: existing
          ? current.checkins.map((c) => (c.dateKey === args.dateKey ? nextRecord : c))
          : [...current.checkins, nextRecord],
      };
    });
    return null;
  }

  async function createWorkout(args: SaveWorkoutArgs) {
    const record: WorkoutLogRecord = {
      _id: createLocalId("log"),
      createdAt: Date.now(),
      ...args,
    };
    setStore((current) => ({
      ...current,
      workoutLogs: [...current.workoutLogs, record],
    }));
    return null;
  }

  async function removeWorkout(id: string) {
    setStore((current) => ({
      ...current,
      workoutLogs: current.workoutLogs.filter((log) => log._id !== id),
    }));
  }

  async function createExercise(args: SaveExerciseArgs) {
    const record: ExerciseRecord = {
      _id: createLocalId("exercise"),
      createdAt: Date.now(),
      ...args,
    };
    setStore((current) => ({ ...current, exercises: [...current.exercises, record] }));
    return null;
  }

  async function removeExercise(id: string) {
    setStore((current) => ({
      ...current,
      exercises: current.exercises.filter((ex) => ex._id !== id),
    }));
  }

  async function createGoal(args: SaveGoalArgs) {
    const now = Date.now();
    const record: GoalRecord = {
      _id: createLocalId("goal"),
      completed: false,
      createdAt: now,
      updatedAt: now,
      ...args,
    };
    setStore((current) => ({ ...current, goals: [...current.goals, record] }));
    return null;
  }

  async function toggleGoal(id: string, completed: boolean) {
    setStore((current) => ({
      ...current,
      goals: current.goals.map((g) =>
        g._id === id ? { ...g, completed, updatedAt: Date.now() } : g,
      ),
    }));
  }

  async function removeGoal(id: string) {
    setStore((current) => ({
      ...current,
      goals: current.goals.filter((g) => g._id !== id),
    }));
  }

  async function createMeasurement(args: SaveMeasurementArgs) {
    const record: BodyMeasurementRecord = {
      _id: createLocalId("measurement"),
      createdAt: Date.now(),
      ...args,
    };
    setStore((current) => ({
      ...current,
      measurements: [...current.measurements, record],
    }));
    return null;
  }

  async function removeMeasurement(id: string) {
    setStore((current) => ({
      ...current,
      measurements: current.measurements.filter((m) => m._id !== id),
    }));
  }

  async function createProgram(args: SaveProgramArgs) {
    const record: ProgramRecord = {
      _id: createLocalId("program"),
      createdAt: Date.now(),
      ...args,
    };
    setStore((current) => ({ ...current, programs: [...current.programs, record] }));
    return null;
  }

  async function removeProgram(id: string) {
    setStore((current) => ({
      ...current,
      programs: current.programs.filter((p) => p._id !== id),
      programExercises: current.programExercises.filter((ex) => ex.programId !== id),
    }));
  }

  async function addProgramExercise(args: SaveProgramExerciseArgs) {
    setStore((current) => {
      const existing = current.programExercises.filter(
        (ex) => ex.programId === args.programId,
      );
      const record: ProgramExerciseRecord = {
        _id: createLocalId("program-ex"),
        order: existing.length,
        ...args,
      };
      return {
        ...current,
        programExercises: [...current.programExercises, record],
      };
    });
    return null;
  }

  async function removeProgramExercise(id: string) {
    setStore((current) => ({
      ...current,
      programExercises: current.programExercises.filter((ex) => ex._id !== id),
    }));
  }

  return {
    mode: "browser",
    dashboard,
    checkins: store.checkins,
    workoutLogs: store.workoutLogs,
    exercises: [...store.exercises].sort((a, b) => a.name.localeCompare(b.name)),
    goals: [...store.goals].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt - a.createdAt;
    }),
    measurements: [...store.measurements].sort((a, b) =>
      b.dateKey.localeCompare(a.dateKey),
    ),
    programs,
    actions: {
      saveCheckin,
      createWorkout,
      removeWorkout,
      createExercise,
      removeExercise,
      createGoal,
      toggleGoal,
      removeGoal,
      createMeasurement,
      removeMeasurement,
      createProgram,
      removeProgram,
      addProgramExercise,
      removeProgramExercise,
    },
  };
}
