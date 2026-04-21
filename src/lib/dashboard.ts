import type {
  CheckinRecord,
  DailySummary,
  DashboardData,
  ExerciseHighlight,
  WorkoutLogRecord,
} from "./types";
import { shiftDateKey } from "./utils";

function volumeForLog(log: {
  sets: number;
  reps: number;
  weightKg?: number;
}) {
  return log.weightKg ? log.weightKg * log.sets * log.reps : 0;
}

function ensureSummary(map: Map<string, DailySummary>, dateKey: string) {
  const existing = map.get(dateKey);
  if (existing) return existing;
  const next: DailySummary = {
    dateKey,
    totalSets: 0,
    totalReps: 0,
    totalVolume: 0,
    totalMinutes: 0,
    workoutCount: 0,
    completedWorkout: false,
    energy: null,
    mood: null,
    bodyWeightKg: null,
  };
  map.set(dateKey, next);
  return next;
}

export function buildDashboardData(
  selectedDateKey: string,
  checkins: CheckinRecord[],
  workoutLogs: WorkoutLogRecord[],
): DashboardData {
  const selectedLogs = workoutLogs
    .filter((log) => log.dateKey === selectedDateKey)
    .sort((left, right) => right.createdAt - left.createdAt);

  const selectedCheckin =
    checkins.find((checkin) => checkin.dateKey === selectedDateKey) ?? null;

  const summaryByDate = new Map<string, DailySummary>();

  for (const checkin of checkins) {
    const summary = ensureSummary(summaryByDate, checkin.dateKey);
    summary.completedWorkout = summary.completedWorkout || checkin.completedWorkout;
    summary.energy = checkin.energy;
    summary.mood = checkin.mood;
    summary.bodyWeightKg = checkin.bodyWeightKg ?? null;
  }

  for (const log of workoutLogs) {
    const summary = ensureSummary(summaryByDate, log.dateKey);
    summary.totalSets += log.sets;
    summary.totalReps += log.sets * log.reps;
    summary.totalVolume += volumeForLog(log);
    summary.totalMinutes += log.durationMinutes ?? 0;
    summary.workoutCount += 1;
    summary.completedWorkout = true;
  }

  const recentDays = [...summaryByDate.values()]
    .sort((left, right) => right.dateKey.localeCompare(left.dateKey))
    .slice(0, 8);

  const weekKeys = Array.from({ length: 7 }, (_, offset) =>
    shiftDateKey(selectedDateKey, -offset),
  );

  const weeklySummary = weekKeys.reduce(
    (summary, dateKey) => {
      const day = summaryByDate.get(dateKey);
      if (!day) return summary;
      return {
        activeDays:
          summary.activeDays + (day.completedWorkout || day.totalSets > 0 ? 1 : 0),
        totalSets: summary.totalSets + day.totalSets,
        totalVolume: summary.totalVolume + day.totalVolume,
        totalMinutes: summary.totalMinutes + day.totalMinutes,
      };
    },
    { activeDays: 0, totalSets: 0, totalVolume: 0, totalMinutes: 0 },
  );

  const activeDates = new Set(
    [...summaryByDate.values()]
      .filter((day) => day.completedWorkout || day.totalSets > 0)
      .map((day) => day.dateKey),
  );

  let streak = 0;
  for (
    let cursor = selectedDateKey;
    activeDates.has(cursor);
    cursor = shiftDateKey(cursor, -1)
  ) {
    streak += 1;
  }

  const recentWindowKeys = new Set(
    Array.from({ length: 14 }, (_, offset) => shiftDateKey(selectedDateKey, -offset)),
  );
  const muscleGroupMap = new Map<string, number>();
  const highlightMap = new Map<string, ExerciseHighlight>();

  for (const log of workoutLogs) {
    if (recentWindowKeys.has(log.dateKey)) {
      muscleGroupMap.set(
        log.muscleGroup,
        (muscleGroupMap.get(log.muscleGroup) ?? 0) + 1,
      );
    }

    const existing = highlightMap.get(log.exercise);
    if (existing) {
      existing.bestWeightKg =
        Math.max(existing.bestWeightKg ?? 0, log.weightKg ?? 0) || null;
      existing.totalSets += log.sets;
      existing.totalVolume += volumeForLog(log);
      existing.lastLoggedAt = Math.max(existing.lastLoggedAt, log.createdAt);
    } else {
      highlightMap.set(log.exercise, {
        exercise: log.exercise,
        muscleGroup: log.muscleGroup,
        bestWeightKg: log.weightKg ?? null,
        totalSets: log.sets,
        totalVolume: volumeForLog(log),
        lastLoggedAt: log.createdAt,
      });
    }
  }

  const muscleGroupBreakdown = [...muscleGroupMap.entries()]
    .map(([muscleGroup, workoutCount]) => ({ muscleGroup, workoutCount }))
    .sort((left, right) => right.workoutCount - left.workoutCount)
    .slice(0, 6);

  const exerciseHighlights = [...highlightMap.values()]
    .sort((left, right) => right.lastLoggedAt - left.lastLoggedAt)
    .slice(0, 6);

  return {
    selectedDateKey,
    selectedCheckin,
    selectedLogs,
    streak,
    recentDays,
    weeklySummary,
    muscleGroupBreakdown,
    exerciseHighlights,
  };
}
