import { useEffect, useState } from "react";
import { ErrorBanner, Loading } from "../../components/ui";
import { api } from "../../lib/api";
import { formatDay, formatPrice, formatTime } from "../../lib/format";

/** US08 — suivi des réservations. */
export default function AdminBookings() {
  const [filters, setFilters] = useState({ day: "", status: "" });
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.admin.bookings(filters).then(setBookings).catch(setError);
  }, [filters]);

  const seats = bookings?.reduce((n, b) => n + b.seats.length, 0) ?? 0;
  const revenue = bookings?.filter((b) => b.status === "CONFIRMED").reduce((n, b) => n + b.total_cents, 0) ?? 0;

  return (
    <>
      <h1>Réservations</h1>
      <div className="toolbar">
        <label className="inline">
          Jour
          <input type="date" value={filters.day} onChange={(e) => setFilters({ ...filters, day: e.target.value })} />
        </label>
        <label className="inline">
          Statut
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Tous</option>
            <option value="CONFIRMED">Confirmées</option>
            <option value="CANCELLED">Annulées</option>
          </select>
        </label>
      </div>
      <ErrorBanner error={error} />
      {!bookings ? (
        <Loading />
      ) : (
        <>
          <div className="kpis">
            <div><strong>{bookings.length}</strong><span>réservations</span></div>
            <div><strong>{seats}</strong><span>places occupées</span></div>
            <div><strong>{formatPrice(revenue)}</strong><span>chiffre d'affaires</span></div>
          </div>
          <div className="table-wrap"><table>
            <thead><tr><th>Code</th><th>Client</th><th>Film</th><th>Séance</th><th>Places</th><th>Statut</th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td><code>{b.code}</code></td>
                  <td>{b.customer_email}</td>
                  <td>{b.movie_title}</td>
                  <td>{formatDay(b.starts_at)} {formatTime(b.starts_at)} · {b.room}</td>
                  <td>{b.seats.map((s) => `${s.row_label}${s.number}`).join(", ") || "—"}</td>
                  <td>{b.status === "CONFIRMED" ? "Confirmée" : "Annulée"}</td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="6" className="muted center">Aucune réservation.</td></tr>}
            </tbody>
          </table></div>
        </>
      )}
    </>
  );
}
