import { useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import type { GoalCategory, TrackerBundle } from "../lib/types";
import {
  goalCategoryOptions,
  toOptionalNumber,
  toOptionalString,
} from "../lib/utils";

type FormState = {
  title: string;
  category: GoalCategory;
  targetValue: string;
  targetUnit: string;
  currentValue: string;
  dueDate: string;
  notes: string;
};

function defaultForm(): FormState {
  return {
    title: "",
    category: "strength",
    targetValue: "",
    targetUnit: "",
    currentValue: "",
    dueDate: "",
    notes: "",
  };
}

export function GoalsView({ tracker }: { tracker: TrackerBundle }) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);
    try {
      const title = form.title.trim();
      if (!title) throw new Error("Goal title is required.");
      const targetValue = toOptionalNumber(form.targetValue);
      const currentValue = toOptionalNumber(form.currentValue);
      const targetUnit = toOptionalString(form.targetUnit);
      const dueDate = toOptionalString(form.dueDate);
      const notes = toOptionalString(form.notes);
      await tracker.actions.createGoal({
        title,
        category: form.category,
        ...(targetValue !== undefined ? { targetValue } : {}),
        ...(currentValue !== undefined ? { currentValue } : {}),
        ...(targetUnit ? { targetUnit } : {}),
        ...(dueDate ? { dueDate } : {}),
        ...(notes ? { notes } : {}),
      });
      setForm(defaultForm());
      setStatus("Goal saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setPending(false);
    }
  }

  async function handleToggle(id: string, completed: boolean) {
    await tracker.actions.toggleGoal(id, completed);
  }

  async function handleDelete(id: string) {
    await tracker.actions.removeGoal(id);
  }

  const active = tracker.goals.filter((g) => !g.completed);
  const done = tracker.goals.filter((g) => g.completed);

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Goals"
        title="What you&rsquo;re chasing"
        description="Strength targets, weight goals, and habit streaks — one list."
      />

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">New goal</p>
            <h2>Set a target</h2>
          </div>
          <span className="status-text">{status}</span>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Title</span>
            <input
              required
              placeholder="Bench 100 kg for 5 reps"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>

          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Category</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as GoalCategory,
                  }))
                }
              >
                {goalCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dueDate: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="field-grid three-up">
            <label className="field">
              <span className="field-label">Current value</span>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={form.currentValue}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    currentValue: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Target value</span>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={form.targetValue}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    targetValue: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Unit</span>
              <input
                placeholder="kg, reps, days"
                value={form.targetUnit}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    targetUnit: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Notes</span>
            <textarea
              rows={3}
              placeholder="Strategy, milestones, why it matters."
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </label>

          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Saving..." : "Add goal"}
          </button>
        </form>
      </section>

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">Active</p>
            <h2>{active.length} in progress</h2>
          </div>
        </div>
        <div className="log-list no-top-margin">
          {active.length === 0 ? (
            <div className="empty-state">No active goals — set one above.</div>
          ) : (
            active.map((goal) => {
              const pct =
                goal.targetValue && goal.currentValue !== undefined
                  ? Math.min(
                      100,
                      Math.round((goal.currentValue / goal.targetValue) * 100),
                    )
                  : null;
              return (
                <article className="log-row goal-row" key={goal._id}>
                  <div>
                    <div className="log-title-row">
                      <h3>{goal.title}</h3>
                      <span className="effort-pill effort-steady">{goal.category}</span>
                    </div>
                    <p className="log-meta">
                      {goal.currentValue !== undefined
                        ? `${goal.currentValue}${goal.targetUnit ?? ""}`
                        : "--"}
                      {goal.targetValue !== undefined
                        ? ` → ${goal.targetValue}${goal.targetUnit ?? ""}`
                        : ""}
                      {goal.dueDate ? ` · due ${goal.dueDate}` : ""}
                    </p>
                    {pct !== null ? (
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    ) : null}
                    {goal.notes ? <p className="log-notes">{goal.notes}</p> : null}
                  </div>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="secondary-button small"
                      onClick={() => void handleToggle(goal._id, true)}
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => void handleDelete(goal._id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {done.length > 0 ? (
        <section className="tool-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow eyebrow-dark">Completed</p>
              <h2>{done.length} achieved</h2>
            </div>
          </div>
          <div className="log-list no-top-margin">
            {done.map((goal) => (
              <article className="log-row goal-row is-done" key={goal._id}>
                <div>
                  <h3>{goal.title}</h3>
                  <p className="log-meta">
                    {goal.category} · completed
                  </p>
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => void handleToggle(goal._id, false)}
                  >
                    Reopen
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => void handleDelete(goal._id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
