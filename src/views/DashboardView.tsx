import type { Dispatch, SetStateAction } from "react";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import type { DailySummary, TrackerBundle, ViewKey } from "../lib/types";
import {
  formatLongDate,
  formatMetricValue,
  formatShortDate,
  formatWeight,
  getDateKey,
  numberFormatter,
} from "../lib/utils";

type DashboardViewProps = {
  tracker: TrackerBundle;
  selectedDateKey: string;
  setSelectedDateKey: Dispatch<SetStateAction<string>>;
  goToView: (view: ViewKey) => void;
};

function emptySummary(dateKey: string): DailySummary {
  return {
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
}

export function DashboardView({
  tracker,
  selectedDateKey,
  setSelectedDateKey,
  goToView,
}: DashboardViewProps) {
  const { dashboard } = tracker;
  const selectedSummary =
    dashboard.recentDays.find((day) => day.dateKey === dashboard.selectedDateKey) ??
    emptySummary(dashboard.selectedDateKey);

  const toneMessage =
    selectedSummary.totalSets > 0
      ? "Training volume is on the board."
      : "No workout logged yet for this day.";

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Overview"
        title={formatLongDate(selectedDateKey)}
        description={`${toneMessage} Pick a view from the sidebar to dig deeper.`}
        actions={
          <>
            <label className="field inline-field">
              <span className="field-label">Date</span>
              <input
                className="date-picker"
                type="date"
                value={selectedDateKey}
                onChange={(event) => setSelectedDateKey(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setSelectedDateKey(getDateKey())}
            >
              Today
            </button>
          </>
        }
      />

      <div className="stat-grid">
        <MetricCard
          label="Current streak"
          value={`${dashboard.streak} day${dashboard.streak === 1 ? "" : "s"}`}
          hint="Consecutive logged training days"
          tone="light"
        />
        <MetricCard
          label="Sets today"
          value={numberFormatter.format(selectedSummary.totalSets)}
          hint={`${selectedSummary.workoutCount} exercise entries`}
          tone="light"
        />
        <MetricCard
          label="7-day volume"
          value={formatMetricValue(dashboard.weeklySummary.totalVolume, " kg")}
          hint={`${dashboard.weeklySummary.activeDays} active day${dashboard.weeklySummary.activeDays === 1 ? "" : "s"}`}
          tone="light"
        />
        <MetricCard
          label="Body weight"
          value={formatMetricValue(selectedSummary.bodyWeightKg, " kg")}
          hint="Optional daily weigh-in"
          tone="light"
        />
      </div>

      <div className="dashboard-grid">
        <section className="insight-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow eyebrow-dark">Day summary</p>
              <h2>Snapshot</h2>
            </div>
            <button
              type="button"
              className="link-button"
              onClick={() => goToView("workouts")}
            >
              Log workout →
            </button>
          </div>
          <dl className="summary-list">
            <SummaryRow
              label="Total reps"
              value={numberFormatter.format(selectedSummary.totalReps)}
            />
            <SummaryRow
              label="Session volume"
              value={formatMetricValue(selectedSummary.totalVolume, " kg")}
            />
            <SummaryRow
              label="Tracked minutes"
              value={formatMetricValue(selectedSummary.totalMinutes, " min")}
            />
            <SummaryRow
              label="Energy"
              value={
                selectedSummary.energy === null ? "--" : `${selectedSummary.energy}/5`
              }
            />
            <SummaryRow
              label="Mood"
              value={selectedSummary.mood === null ? "--" : `${selectedSummary.mood}/5`}
            />
          </dl>
        </section>

        <section className="insight-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow eyebrow-dark">Recent days</p>
              <h2>Consistency</h2>
            </div>
          </div>
          <div className="history-list">
            {dashboard.recentDays.length === 0 ? (
              <div className="empty-state">
                Your first logged day will show up here.
              </div>
            ) : (
              dashboard.recentDays.map((day) => (
                <button
                  className={`history-row${
                    day.dateKey === selectedDateKey ? " is-active" : ""
                  }`}
                  key={day.dateKey}
                  type="button"
                  onClick={() => setSelectedDateKey(day.dateKey)}
                >
                  <div>
                    <strong>{formatShortDate(day.dateKey)}</strong>
                    <span>{day.workoutCount} entries</span>
                  </div>
                  <div className="history-metrics">
                    <span>{day.totalSets} sets</span>
                    <span>
                      {day.bodyWeightKg === null ? "--" : `${day.bodyWeightKg} kg`}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="insight-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow eyebrow-dark">Focus split</p>
              <h2>Last 2 weeks</h2>
            </div>
          </div>
          <div className="breakdown-list">
            {dashboard.muscleGroupBreakdown.length === 0 ? (
              <div className="empty-state">
                Log a few workouts to see your split.
              </div>
            ) : (
              dashboard.muscleGroupBreakdown.map((item) => (
                <div className="breakdown-row" key={item.muscleGroup}>
                  <span>{item.muscleGroup}</span>
                  <strong>{item.workoutCount}</strong>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="insight-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow eyebrow-dark">Exercise board</p>
              <h2>Highlights</h2>
            </div>
            <button
              type="button"
              className="link-button"
              onClick={() => goToView("exercises")}
            >
              Library →
            </button>
          </div>
          <div className="highlight-list">
            {dashboard.exerciseHighlights.length === 0 ? (
              <div className="empty-state">
                Personal bests will build as you log sets.
              </div>
            ) : (
              dashboard.exerciseHighlights.map((item) => (
                <article className="highlight-row" key={item.exercise}>
                  <div>
                    <h3>{item.exercise}</h3>
                    <p>{item.muscleGroup}</p>
                  </div>
                  <div className="highlight-metrics">
                    <strong>{formatWeight(item.bestWeightKg)}</strong>
                    <span>{item.totalSets} sets total</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
