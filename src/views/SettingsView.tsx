import { PageHeader } from "../components/PageHeader";
import type { TrackerBundle } from "../lib/types";

export function SettingsView({ tracker }: { tracker: TrackerBundle }) {
  const totals = {
    checkins: tracker.checkins.length,
    workouts: tracker.workoutLogs.length,
    exercises: tracker.exercises.length,
    measurements: tracker.measurements.length,
    goals: tracker.goals.length,
    programs: tracker.programs.length,
  };

  function handleExport() {
    const payload = {
      exportedAt: new Date().toISOString(),
      mode: tracker.mode,
      checkins: tracker.checkins,
      workoutLogs: tracker.workoutLogs,
      exercises: tracker.exercises,
      goals: tracker.goals,
      measurements: tracker.measurements,
      programs: tracker.programs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gym-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Settings"
        title="Data + environment"
        description="Check how your data is stored and export a backup snapshot."
      />

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">Storage mode</p>
            <h2>{tracker.mode === "convex" ? "Convex live sync" : "Browser storage"}</h2>
          </div>
        </div>
        <p className="log-notes">
          {tracker.mode === "convex"
            ? "Changes write to your configured Convex backend and stay in sync across devices signed into the same deployment."
            : "This deployment has no VITE_CONVEX_URL set, so all data lives in this browser. Clearing site data will wipe your log."}
        </p>
      </section>

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">Data footprint</p>
            <h2>Totals</h2>
          </div>
        </div>
        <dl className="summary-list">
          <Row label="Check-ins" value={totals.checkins.toString()} />
          <Row label="Workout log entries" value={totals.workouts.toString()} />
          <Row label="Exercise library" value={totals.exercises.toString()} />
          <Row label="Measurements" value={totals.measurements.toString()} />
          <Row label="Goals" value={totals.goals.toString()} />
          <Row label="Programs" value={totals.programs.toString()} />
        </dl>
      </section>

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">Export</p>
            <h2>Download a JSON backup</h2>
          </div>
        </div>
        <p className="log-notes">
          Grabs the current view of every table. Useful when switching between
          browser and Convex modes, or for archiving at the end of a cycle.
        </p>
        <button type="button" className="primary-button" onClick={handleExport}>
          Export data as JSON
        </button>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
