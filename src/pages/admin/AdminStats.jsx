import { useEffect, useState } from "react";
import { ErrorBanner, Loading } from "../../components/ui";
import { api } from "../../lib/api";
import { formatDay, formatPercent, formatTime } from "../../lib/format";

/** US09 — taux de remplissage par créneau et par séance, repérage des pics. */
export default function AdminStats() {
  const [range, setRange] = useState({ date_from: "", date_to: "" });
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.admin.occupancy(range).then(setReport).catch(setError);
  }, [range]);

  if (!report) return error ? <ErrorBanner error={error} /> : <Loading />;
  const peaks = report.by_showtime.filter((s) => s.peak);

  return (
    <>
      <h1>Taux de remplissage</h1>
      <div className="toolbar">
        <label className="inline">
          Du
          <input type="date" value={range.date_from} onChange={(e) => setRange({ ...range, date_from: e.target.value })} />
        </label>
        <label className="inline">
          Au
          <input type="date" value={range.date_to} onChange={(e) => setRange({ ...range, date_to: e.target.value })} />
        </label>
      </div>
      <ErrorBanner error={error} />

      <div className="kpis">
        <div><strong>{formatPercent(report.global_rate)}</strong><span>remplissage global</span></div>
        <div><strong>{report.by_showtime.length}</strong><span>séances</span></div>
        <div><strong>{peaks.length}</strong><span>séances ≥ {formatPercent(report.peak_threshold)}</span></div>
      </div>

      <h2>Par créneau horaire</h2>
      <div className="bars">
        {report.by_slot.map((s) => (
          <div key={s.slot} className="bar-row">
            <span>{s.slot}</span>
            <div className="bar"><i style={{ width: `${Math.min(100, s.occupancy_rate * 100)}%` }} /></div>
            <strong>{formatPercent(s.occupancy_rate)}</strong>
          </div>
        ))}
      </div>

      <h2>Séances les plus demandées</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Séance</th><th>Film</th><th>Salle</th><th>Réservées</th><th>Taux</th></tr></thead>
        <tbody>
          {[...report.by_showtime]
            .sort((a, b) => b.occupancy_rate - a.occupancy_rate)
            .slice(0, 20)
            .map((s) => (
              <tr key={s.showtime_id} className={s.peak ? "peak" : ""}>
                <td>{formatDay(s.starts_at)} {formatTime(s.starts_at)}</td>
                <td>{s.movie_title}</td>
                <td>{s.room}</td>
                <td>{s.booked} / {s.capacity}</td>
                <td>{formatPercent(s.occupancy_rate)}{s.peak && " · pic"}</td>
              </tr>
            ))}
        </tbody>
      </table></div>
    </>
  );
}
