import { useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { PageHeader } from "../components/PageHeader";
import type { TrackerBundle, WorkoutEffort } from "../lib/types";
import {
  effortOptions,
  formatShortDate,
  formatWeight,
  getDateKey,
  muscleGroupOptions,
  toOptionalNumber,
  toOptionalString,
  toRequiredNumber,
} from "../lib/utils";

type WorkoutFormState = {
  exercise: string;
  muscleGroup: string;
  sets: string;
  reps: string;
  weightKg: string;
  durationMinutes: string;
  effort: WorkoutEffort;
  notes: string;
};

function defaultForm(): WorkoutFormState {
  return {
    exercise: "",
    muscleGroup: "Chest",
    sets: "4",
    reps: "8",
    weightKg: "",
    durationMinutes: "",
    effort: "steady",
    notes: "",
  };
}

type WorkoutsViewProps = {
  tracker: TrackerBundle;
  selectedDateKey: string;
  setSelectedDateKey: Dispatch<SetStateAction<string>>;
};

export function WorkoutsView({
  tracker,
  selectedDateKey,
  setSelectedDateKey,
}: WorkoutsViewProps) {
  const [form, setForm] = useState<WorkoutFormState>(defaultForm);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const logsForDay = tracker.dashboard.selectedLogs;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);
    try {
      const exercise = form.exercise.trim();
      if (!exercise) throw new Error("Exercise is required.");
      const weightKg = toOptionalNumber(form.weightKg);
      const durationMinutes = toOptionalNumber(form.durationMinutes);
      const notes = toOptionalString(form.notes);
      await tracker.actions.createWorkout({
        dateKey: selectedDateKey,
        exercise,
        muscleGroup: form.muscleGroup,
        sets: toRequiredNumber(form.sets, "Sets"),
        reps: toRequiredNumber(form.reps, "Reps"),
        effort: form.effort,
        ...(weightKg !== undefined ? { weightKg } : {}),
        ...(durationMinutes !== undefined ? { durationMinutes } : {}),
        ...(notes ? { notes } : {}),
      });
      setForm((current) => ({
        ...defaultForm(),
        muscleGroup: current.muscleGroup,
        effort: current.effort,
      }));
      setStatus("Workout entry logged.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    setStatus(null);
    try {
      await tracker.actions.removeWorkout(id);
      setStatus("Workout entry removed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to remove.");
    }
  }

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Workout log"
        title={`Exercises for ${formatShortDate(selectedDateKey)}`}
        description="Track each lift with sets, reps, weight, and effort."
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

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">New entry</p>
            <h2>Log a lift</h2>
          </div>
          <span className="status-text">{status}</span>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Exercise</span>
              <input
                list="exercise-library"
                required
                placeholder="Incline dumbbell press"
                value={form.exercise}
                onChange={(event) =>
                  setForm((current) => ({ ...current, exercise: event.target.value }))
                }
              />
              <datalist id="exercise-library">
                {tracker.exercises.map((ex) => (
                  <option key={ex._id} value={ex.name} />
                ))}
              </datalist>
            </label>

            <label className="field">
              <span className="field-label">Focus</span>
              <select
                value={form.muscleGroup}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    muscleGroup: event.target.value,
                  }))
                }
              >
                {muscleGroupOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid three-up">
            <label className="field">
              <span className="field-label">Sets</span>
              <input
                type="number"
                min="1"
                step="1"
                required
                inputMode="numeric"
                value={form.sets}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sets: event.target.value }))
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Reps</span>
              <input
                type="number"
                min="1"
                step="1"
                required
                inputMode="numeric"
                value={form.reps}
                onChange={(event) =>
                  setForm((current) => ({ ...current, reps: event.target.value }))
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Weight (kg)</span>
              <input
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                placeholder="Optional"
                value={form.weightKg}
                onChange={(event) =>
                  setForm((current) => ({ ...current, weightKg: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Duration (minutes)</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="15"
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationMinutes: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Effort</span>
              <select
                value={form.effort}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    effort: event.target.value as WorkoutEffort,
                  }))
                }
              >
                {effortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span className="field-label">Session notes</span>
            <textarea
              rows={4}
              placeholder="Paused reps, straps on final set, left shoulder felt stable."
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </label>

          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Logging..." : "Add workout entry"}
          </button>
        </form>
      </section>

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">Today&rsquo;s log</p>
            <h2>{logsForDay.length} entries</h2>
          </div>
        </div>
        <div className="log-list no-top-margin">
          {logsForDay.length === 0 ? (
            <div className="empty-state">No exercise entries for this date yet.</div>
          ) : (
            logsForDay.map((log) => (
              <article className="log-row" key={log._id}>
                <div>
                  <div className="log-title-row">
                    <h3>{log.exercise}</h3>
                    <span className={`effort-pill effort-${log.effort}`}>
                      {log.effort}
                    </span>
                  </div>
                  <p className="log-meta">
                    {log.muscleGroup} · {log.sets} sets x {log.reps} reps ·{" "}
                    {formatWeight(log.weightKg)}
                    {log.durationMinutes ? ` · ${log.durationMinutes} min` : ""}
                  </p>
                  {log.notes ? <p className="log-notes">{log.notes}</p> : null}
                </div>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => void handleDelete(log._id)}
                >
                  Remove
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
