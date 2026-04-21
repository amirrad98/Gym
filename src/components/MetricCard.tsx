type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "light" | "dark";
};

export function MetricCard({ label, value, hint, tone = "dark" }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <p>{hint}</p> : null}
    </article>
  );
}
