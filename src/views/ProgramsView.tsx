import { useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import type { TrackerBundle } from "../lib/types";
import {
  muscleGroupOptions,
  toOptionalNumber,
  toOptionalString,
  toRequiredNumber,
} from "../lib/utils";

const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type ProgramFormState = {
  name: string;
  description: string;
  dayOfWeek: string;
};

type ExerciseFormState = {
  exercise: string;
  muscleGroup: string;
  sets: string;
  reps: string;
  weightKg: string;
  notes: string;
};

function defaultProgramForm(): ProgramFormState {
  return { name: "", description: "", dayOfWeek: "" };
}

function defaultExerciseForm(): ExerciseFormState {
  return {
    exercise: "",
    muscleGroup: "Chest",
    sets: "4",
    reps: "8",
    weightKg: "",
    notes: "",
  };
}

export function ProgramsView({ tracker }: { tracker: TrackerBundle }) {
  const [programForm, setProgramForm] = useState<ProgramFormState>(defaultProgramForm);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [exerciseForms, setExerciseForms] = useState<
    Record<string, ExerciseFormState>
  >({});

  function updateExerciseForm(
    programId: string,
    updater: (current: ExerciseFormState) => ExerciseFormState,
  ) {
    setExerciseForms((current) => ({
      ...current,
      [programId]: updater(current[programId] ?? defaultExerciseForm()),
    }));
  }

  async function handleProgramSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);
    try {
      const name = programForm.name.trim();
      if (!name) throw new Error("Program name is required.");
      const description = toOptionalString(programForm.description);
      const dayOfWeek = toOptionalString(programForm.dayOfWeek);
      await tracker.actions.createProgram({
        name,
        ...(description ? { description } : {}),
        ...(dayOfWeek ? { dayOfWeek } : {}),
      });
      setProgramForm(defaultProgramForm());
      setStatus("Program created.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setPending(false);
    }
  }

  async function handleExerciseSubmit(
    event: FormEvent<HTMLFormElement>,
    programId: string,
  ) {
    event.preventDefault();
    setStatus(null);
    try {
      const form = exerciseForms[programId] ?? defaultExerciseForm();
      const exercise = form.exercise.trim();
      if (!exercise) throw new Error("Exercise is required.");
      const weightKg = toOptionalNumber(form.weightKg);
      const notes = toOptionalString(form.notes);
      await tracker.actions.addProgramExercise({
        programId,
        exercise,
        muscleGroup: form.muscleGroup,
        sets: toRequiredNumber(form.sets, "Sets"),
        reps: toRequiredNumber(form.reps, "Reps"),
        ...(weightKg !== undefined ? { weightKg } : {}),
        ...(notes ? { notes } : {}),
      });
      setExerciseForms((current) => ({
        ...current,
        [programId]: defaultExerciseForm(),
      }));
      setStatus("Exercise added to program.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save.");
    }
  }

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Programs"
        title="Reusable training templates"
        description="Build routines once, pull them up whenever you repeat a day."
      />

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">New program</p>
            <h2>Create a routine</h2>
          </div>
          <span className="status-text">{status}</span>
        </div>

        <form className="stacked-form" onSubmit={handleProgramSubmit}>
          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Name</span>
              <input
                required
                placeholder="Push day"
                value={programForm.name}
                onChange={(event) =>
                  setProgramForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Scheduled day</span>
              <select
                value={programForm.dayOfWeek}
                onChange={(event) =>
                  setProgramForm((current) => ({
                    ...current,
                    dayOfWeek: event.target.value,
                  }))
                }
              >
                <option value="">Unscheduled</option>
                {dayOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              rows={3}
              placeholder="Focus, notes, warm-up routine."
              value={programForm.description}
              onChange={(event) =>
                setProgramForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>

          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create program"}
          </button>
        </form>
      </section>

      {tracker.programs.length === 0 ? (
        <section className="tool-panel">
          <div className="empty-state">No programs yet. Create one above.</div>
        </section>
      ) : (
        tracker.programs.map(({ program, exercises }) => {
          const exForm = exerciseForms[program._id] ?? defaultExerciseForm();
          return (
            <section className="tool-panel" key={program._id}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow eyebrow-dark">
                    {program.dayOfWeek ?? "Unscheduled"}
                  </p>
                  <h2>{program.name}</h2>
                  {program.description ? (
                    <p className="log-notes">{program.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => void tracker.actions.removeProgram(program._id)}
                >
                  Delete program
                </button>
              </div>

              <div className="log-list no-top-margin">
                {exercises.length === 0 ? (
                  <div className="empty-state">
                    No exercises yet — add your first below.
                  </div>
                ) : (
                  exercises.map((ex) => (
                    <article className="log-row" key={ex._id}>
                      <div>
                        <div className="log-title-row">
                          <h3>{ex.exercise}</h3>
                          <span className="effort-pill effort-steady">
                            {ex.muscleGroup}
                          </span>
                        </div>
                        <p className="log-meta">
                          {ex.sets}x{ex.reps}
                          {ex.weightKg ? ` · ${ex.weightKg} kg` : ""}
                        </p>
                        {ex.notes ? <p className="log-notes">{ex.notes}</p> : null}
                      </div>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() =>
                          void tracker.actions.removeProgramExercise(ex._id)
                        }
                      >
                        Remove
                      </button>
                    </article>
                  ))
                )}
              </div>

              <form
                className="stacked-form program-add-form"
                onSubmit={(event) => void handleExerciseSubmit(event, program._id)}
              >
                <div className="field-grid two-up">
                  <label className="field">
                    <span className="field-label">Exercise</span>
                    <input
                      list={`program-ex-library-${program._id}`}
                      required
                      placeholder="Bench press"
                      value={exForm.exercise}
                      onChange={(event) =>
                        updateExerciseForm(program._id, (c) => ({
                          ...c,
                          exercise: event.target.value,
                        }))
                      }
                    />
                    <datalist id={`program-ex-library-${program._id}`}>
                      {tracker.exercises.map((ex) => (
                        <option key={ex._id} value={ex.name} />
                      ))}
                    </datalist>
                  </label>
                  <label className="field">
                    <span className="field-label">Focus</span>
                    <select
                      value={exForm.muscleGroup}
                      onChange={(event) =>
                        updateExerciseForm(program._id, (c) => ({
                          ...c,
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
                      value={exForm.sets}
                      onChange={(event) =>
                        updateExerciseForm(program._id, (c) => ({
                          ...c,
                          sets: event.target.value,
                        }))
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
                      value={exForm.reps}
                      onChange={(event) =>
                        updateExerciseForm(program._id, (c) => ({
                          ...c,
                          reps: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Weight (kg)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Optional"
                      value={exForm.weightKg}
                      onChange={(event) =>
                        updateExerciseForm(program._id, (c) => ({
                          ...c,
                          weightKg: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
                <button className="secondary-button" type="submit">
                  Add exercise to program
                </button>
              </form>
            </section>
          );
        })
      )}
    </div>
  );
}
