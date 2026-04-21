import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { PageHeader } from "../components/PageHeader";
import type { CheckinRecord, TrackerBundle } from "../lib/types";
import {
  formatShortDate,
  getDateKey,
  toOptionalNumber,
  toOptionalString,
  toRequiredNumber,
} from "../lib/utils";

type CheckinFormState = {
  bodyWeightKg: string;
  sleepHours: string;
  energy: number;
  mood: number;
  soreness: number;
  hydrationLiters: string;
  completedWorkout: boolean;
  notes: string;
};

const sliders = [
  { key: "energy", label: "Energy", hint: "How sharp you felt walking in." },
  { key: "mood", label: "Mood", hint: "Keep a simple 1-5 signal." },
  { key: "soreness", label: "Soreness", hint: "Useful when volume stacks up." },
] as const;

function defaultForm(): CheckinFormState {
  return {
    bodyWeightKg: "",
    sleepHours: "7.5",
    energy: 3,
    mood: 3,
    soreness: 2,
    hydrationLiters: "",
    completedWorkout: false,
    notes: "",
  };
}

function formFromRecord(record: CheckinRecord | null): CheckinFormState {
  const state = defaultForm();
  if (!record) return state;
  state.bodyWeightKg = record.bodyWeightKg?.toString() ?? "";
  state.sleepHours = record.sleepHours.toString();
  state.energy = record.energy;
  state.mood = record.mood;
  state.soreness = record.soreness;
  state.hydrationLiters = record.hydrationLiters?.toString() ?? "";
  state.completedWorkout = record.completedWorkout;
  state.notes = record.notes ?? "";
  return state;
}

type CheckinsViewProps = {
  tracker: TrackerBundle;
  selectedDateKey: string;
  setSelectedDateKey: Dispatch<SetStateAction<string>>;
};

export function CheckinsView({
  tracker,
  selectedDateKey,
  setSelectedDateKey,
}: CheckinsViewProps) {
  const existing = tracker.dashboard.selectedCheckin;
  const [form, setForm] = useState<CheckinFormState>(() => formFromRecord(existing));
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setForm(formFromRecord(existing));
  }, [existing?._id, selectedDateKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);
    try {
      const bodyWeightKg = toOptionalNumber(form.bodyWeightKg);
      const hydrationLiters = toOptionalNumber(form.hydrationLiters);
      const notes = toOptionalString(form.notes);
      await tracker.actions.saveCheckin({
        dateKey: selectedDateKey,
        sleepHours: toRequiredNumber(form.sleepHours, "Sleep hours"),
        energy: form.energy,
        mood: form.mood,
        soreness: form.soreness,
        completedWorkout: form.completedWorkout,
        ...(bodyWeightKg !== undefined ? { bodyWeightKg } : {}),
        ...(hydrationLiters !== undefined ? { hydrationLiters } : {}),
        ...(notes ? { notes } : {}),
      });
      setStatus("Daily check-in saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Daily check-in"
        title={`Recovery for ${formatShortDate(selectedDateKey)}`}
        description="Capture how you felt walking in, sleep, and hydration."
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
            <p className="eyebrow eyebrow-dark">Recovery + readiness</p>
            <h2>{existing ? "Update entry" : "New entry"}</h2>
          </div>
          <span className="status-text">{status}</span>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Body weight (kg)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                placeholder="77.4"
                value={form.bodyWeightKg}
                onChange={(event) =>
                  setForm((current) => ({ ...current, bodyWeightKg: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Sleep (hours)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                required
                value={form.sleepHours}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sleepHours: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="field-grid slider-grid">
            {sliders.map((slider) => (
              <label className="field slider-field" key={slider.key}>
                <div className="field-row">
                  <span className="field-label">{slider.label}</span>
                  <span className="slider-value">{form[slider.key]}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form[slider.key]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [slider.key]: Number(event.target.value),
                    }))
                  }
                />
                <span className="field-hint">{slider.hint}</span>
              </label>
            ))}
          </div>

          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Water (liters)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                placeholder="2.8"
                value={form.hydrationLiters}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hydrationLiters: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field checkbox-field">
              <span className="field-label">Workout done</span>
              <input
                type="checkbox"
                checked={form.completedWorkout}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    completedWorkout: event.target.checked,
                  }))
                }
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Notes</span>
            <textarea
              rows={4}
              placeholder="Energy was flat until warm-up, knee felt fine, bench moved well."
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </label>

          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save check-in"}
          </button>
        </form>
      </section>

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">History</p>
            <h2>Recent days</h2>
          </div>
        </div>
        <div className="history-list no-top-margin">
          {tracker.dashboard.recentDays.length === 0 ? (
            <div className="empty-state">No past check-ins yet.</div>
          ) : (
            tracker.dashboard.recentDays.map((day) => (
              <button
                className={`history-row${day.dateKey === selectedDateKey ? " is-active" : ""}`}
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedDateKey(day.dateKey)}
              >
                <div>
                  <strong>{formatShortDate(day.dateKey)}</strong>
                  <span>
                    {day.energy !== null ? `Energy ${day.energy}/5` : "No check-in"}
                  </span>
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
    </div>
  );
}
