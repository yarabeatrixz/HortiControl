export function SummaryCard({ label, value, icon: Icon }) {
  return (
    <article className="summary-card">
      <span>
        <Icon size={19} aria-hidden="true" />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
