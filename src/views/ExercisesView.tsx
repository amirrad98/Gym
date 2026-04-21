import { useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import type { TrackerBundle } from "../lib/types";
import {
  muscleGroupOptions,
  toOptionalNumber,
  toOptionalString,
} from "../lib/utils";

type FormState = {
  name: string;
  muscleGroup: string;
  equipment: string;
  defaultSets: string;
  defaultReps: string;
  defaultWeightKg: string;
  notes: string;
};

function defaultForm(): FormState {
  return {
    name: "",
    muscleGroup: "Chest",
    equipment: "",
    defaultSets: "",
    defaultReps: "",
    defaultWeightKg: "",
    notes: "",
  };
}

export function ExercisesView({ tracker }: { tracker: TrackerBundle }) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);
    try {
      const name = form.name.trim();
      if (!name) throw new Error("Exercise name is required.");
      const equipment = toOptionalString(form.equipment);
      const defaultSets = toOptionalNumber(form.defaultSets);
      const defaultReps = toOptionalNumber(form.defaultReps);
      const defaultWeightKg = toOptionalNumber(form.defaultWeightKg);
      const notes = toOptionalString(form.notes);
      await tracker.actions.createExercise({
        name,
        muscleGroup: form.muscleGroup,
        ...(equipment ? { equipment } : {}),
        ...(defaultSets !== undefined ? { defaultSets } : {}),
        ...(defaultReps !== undefined ? { defaultReps } : {}),
        ...(defaultWeightKg !== undefined ? { defaultWeightKg } : {}),
        ...(notes ? { notes } : {}),
      });
      setForm((current) => ({ ...defaultForm(), muscleGroup: current.muscleGroup }));
      setStatus("Exercise added to library.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    setStatus(null);
    try {
      await tracker.actions.removeExercise(id);
      setStatus("Exercise removed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to remove.");
    }
  }

  const filtered =
    filter === "all"
      ? tracker.exercises
      : tracker.exercises.filter((ex) => ex.muscleGroup === filter);

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Exercise library"
        title="Your movement catalog"
        description="Save exercises with default volume so they&rsquo;re one tap to log."
      />

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">New exercise</p>
            <h2>Add to library</h2>
          </div>
          <span className="status-text">{status}</span>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Name</span>
              <input
                required
                placeholder="Barbell back squat"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Muscle group</span>
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

          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Equipment</span>
              <input
                placeholder="Barbell, dumbbell, cable..."
                value={form.equipment}
                onChange={(event) =>
                  setForm((current) => ({ ...current, equipment: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Default weight (kg)</span>
              <input
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                placeholder="Optional"
                value={form.defaultWeightKg}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    defaultWeightKg: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Default sets</span>
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="4"
                value={form.defaultSets}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    defaultSets: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Default reps</span>
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="8"
                value={form.defaultReps}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    defaultReps: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Notes</span>
            <textarea
              rows={3}
              placeholder="Cues, tempo, setup reminders."
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </label>

          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Saving..." : "Add exercise"}
          </button>
        </form>
      </section>

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">Library</p>
            <h2>{tracker.exercises.length} saved</h2>
          </div>
          <select
            className="filter-select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All groups</option>
            {muscleGroupOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="log-list no-top-margin">
          {filtered.length === 0 ? (
            <div className="empty-state">
              {tracker.exercises.length === 0
                ? "Add your first exercise to start building the library."
                : "No exercises in this group yet."}
            </div>
          ) : (
            filtered.map((ex) => (
              <article className="log-row" key={ex._id}>
                <div>
                  <div className="log-title-row">
                    <h3>{ex.name}</h3>
                    <span className="effort-pill effort-steady">{ex.muscleGroup}</span>
                  </div>
                  <p className="log-meta">
                    {ex.equipment ?? "Any equipment"}
                    {ex.defaultSets && ex.defaultReps
                      ? ` · ${ex.defaultSets}x${ex.defaultReps}`
                      : ""}
                    {ex.defaultWeightKg ? ` · ${ex.defaultWeightKg} kg` : ""}
                  </p>
                  {ex.notes ? <p className="log-notes">{ex.notes}</p> : null}
                </div>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => void handleDelete(ex._id)}
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
