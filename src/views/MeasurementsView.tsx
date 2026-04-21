import { useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import type { TrackerBundle } from "../lib/types";
import {
  formatShortDate,
  getDateKey,
  toOptionalNumber,
  toOptionalString,
} from "../lib/utils";

type FormState = {
  dateKey: string;
  bodyWeightKg: string;
  bodyFatPercent: string;
  waistCm: string;
  chestCm: string;
  hipsCm: string;
  leftArmCm: string;
  rightArmCm: string;
  leftThighCm: string;
  rightThighCm: string;
  notes: string;
};

function defaultForm(): FormState {
  return {
    dateKey: getDateKey(),
    bodyWeightKg: "",
    bodyFatPercent: "",
    waistCm: "",
    chestCm: "",
    hipsCm: "",
    leftArmCm: "",
    rightArmCm: "",
    leftThighCm: "",
    rightThighCm: "",
    notes: "",
  };
}

export function MeasurementsView({ tracker }: { tracker: TrackerBundle }) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);
    try {
      const notes = toOptionalString(form.notes);
      const optionalKeys = [
        "bodyWeightKg",
        "bodyFatPercent",
        "waistCm",
        "chestCm",
        "hipsCm",
        "leftArmCm",
        "rightArmCm",
        "leftThighCm",
        "rightThighCm",
      ] as const;
      const payload: Record<string, number | string | undefined> = {
        dateKey: form.dateKey,
      };
      for (const key of optionalKeys) {
        const parsed = toOptionalNumber(form[key]);
        if (parsed !== undefined) payload[key] = parsed;
      }
      if (notes) payload.notes = notes;
      await tracker.actions.createMeasurement(payload as never);
      setForm(defaultForm());
      setStatus("Measurement saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    setStatus(null);
    try {
      await tracker.actions.removeMeasurement(id);
      setStatus("Measurement removed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to remove.");
    }
  }

  const latest = tracker.measurements[0];

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Body measurements"
        title="Trend your body over time"
        description="Weekly or monthly snapshots work best — pick a cadence and stick to it."
      />

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">New measurement</p>
            <h2>Log a snapshot</h2>
          </div>
          <span className="status-text">{status}</span>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Date</span>
              <input
                type="date"
                value={form.dateKey}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dateKey: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Body weight (kg)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.bodyWeightKg}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bodyWeightKg: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="field-grid three-up">
            <label className="field">
              <span className="field-label">Body fat (%)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.bodyFatPercent}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bodyFatPercent: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Waist (cm)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.waistCm}
                onChange={(event) =>
                  setForm((current) => ({ ...current, waistCm: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Chest (cm)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.chestCm}
                onChange={(event) =>
                  setForm((current) => ({ ...current, chestCm: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="field-grid three-up">
            <label className="field">
              <span className="field-label">Hips (cm)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.hipsCm}
                onChange={(event) =>
                  setForm((current) => ({ ...current, hipsCm: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Left arm (cm)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.leftArmCm}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    leftArmCm: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Right arm (cm)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.rightArmCm}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rightArmCm: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="field-grid two-up">
            <label className="field">
              <span className="field-label">Left thigh (cm)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.leftThighCm}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    leftThighCm: event.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Right thigh (cm)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.rightThighCm}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rightThighCm: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Notes</span>
            <textarea
              rows={3}
              placeholder="Measured after shower, before breakfast."
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </label>

          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save measurement"}
          </button>
        </form>
      </section>

      {latest ? (
        <section className="tool-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow eyebrow-dark">Latest snapshot</p>
              <h2>{formatShortDate(latest.dateKey)}</h2>
            </div>
          </div>
          <dl className="summary-list">
            {latest.bodyWeightKg !== undefined ? (
              <Row label="Body weight" value={`${latest.bodyWeightKg} kg`} />
            ) : null}
            {latest.bodyFatPercent !== undefined ? (
              <Row label="Body fat" value={`${latest.bodyFatPercent}%`} />
            ) : null}
            {latest.waistCm !== undefined ? (
              <Row label="Waist" value={`${latest.waistCm} cm`} />
            ) : null}
            {latest.chestCm !== undefined ? (
              <Row label="Chest" value={`${latest.chestCm} cm`} />
            ) : null}
            {latest.hipsCm !== undefined ? (
              <Row label="Hips" value={`${latest.hipsCm} cm`} />
            ) : null}
            {latest.leftArmCm !== undefined || latest.rightArmCm !== undefined ? (
              <Row
                label="Arms (L/R)"
                value={`${latest.leftArmCm ?? "--"} / ${latest.rightArmCm ?? "--"} cm`}
              />
            ) : null}
            {latest.leftThighCm !== undefined || latest.rightThighCm !== undefined ? (
              <Row
                label="Thighs (L/R)"
                value={`${latest.leftThighCm ?? "--"} / ${latest.rightThighCm ?? "--"} cm`}
              />
            ) : null}
          </dl>
        </section>
      ) : null}

      <section className="tool-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow eyebrow-dark">History</p>
            <h2>{tracker.measurements.length} snapshots</h2>
          </div>
        </div>
        <div className="log-list no-top-margin">
          {tracker.measurements.length === 0 ? (
            <div className="empty-state">No measurements logged yet.</div>
          ) : (
            tracker.measurements.map((row) => (
              <article className="log-row" key={row._id}>
                <div>
                  <h3>{formatShortDate(row.dateKey)}</h3>
                  <p className="log-meta">
                    {[
                      row.bodyWeightKg !== undefined ? `${row.bodyWeightKg} kg` : null,
                      row.bodyFatPercent !== undefined
                        ? `${row.bodyFatPercent}% BF`
                        : null,
                      row.waistCm !== undefined ? `Waist ${row.waistCm} cm` : null,
                      row.chestCm !== undefined ? `Chest ${row.chestCm} cm` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No metrics"}
                  </p>
                  {row.notes ? <p className="log-notes">{row.notes}</p> : null}
                </div>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => void handleDelete(row._id)}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
