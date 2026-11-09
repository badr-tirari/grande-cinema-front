export function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <p className="alert" role="alert">
      {error.message || String(error)}
    </p>
  );
}

export function Loading({ label = "Chargement…" }) {
  return <p className="muted center">{label}</p>;
}

export function Badge({ level }) {
  return <span className={`badge badge-${level.replace(/\s/g, "-")}`}>{level}</span>;
}
