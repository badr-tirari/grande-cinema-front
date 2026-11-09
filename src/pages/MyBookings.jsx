import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorBanner, Loading } from "../components/ui";
import { api } from "../lib/api";
import { formatDay, formatPrice, formatTime } from "../lib/format";

/** US06 — mes réservations, annulation jusqu'au début de la séance. */
export default function MyBookings() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState(null);

  const load = () => api.myBookings().then(setBookings).catch(setError);
  useEffect(() => {
    void load(); // les erreurs sont déjà capturées par .catch(setError)
  }, []);

  async function cancel(id) {
    setError(null);
    try {
      await api.cancelBooking(id);
      await load();
    } catch (e) {
      setError(e);
    }
  }

  if (!bookings) return error ? <ErrorBanner error={error} /> : <Loading />;
  const upcoming = (b) => new Date(b.starts_at) > new Date();

  return (
    <>
      <h1>Mes billets</h1>
      <ErrorBanner error={error} />
      {bookings.length === 0 && (
        <p className="muted">
          Aucune réservation pour le moment. <Link to="/">Voir les films à l'affiche</Link>
        </p>
      )}
      <div className="list">
        {bookings.map((b) => (
          <article key={b.id} className="row-card">
            <div>
              <p className="eyebrow">
                {b.code} · {b.status === "CANCELLED" ? "annulée" : "confirmée"}
              </p>
              <h3>{b.movie_title}</h3>
              <p className="muted">
                {formatDay(b.starts_at)} à {formatTime(b.starts_at)} · {b.room} ·{" "}
                {b.seats.map((s) => `${s.row_label}${s.number}`).join(", ") || "—"} · {formatPrice(b.total_cents)}
              </p>
            </div>
            <div className="actions">
              <Link to={`/billets/${b.id}`} className="pill">
                Billet
              </Link>
              {b.status === "CONFIRMED" && upcoming(b) && (
                <button type="button" className="ghost" onClick={() => cancel(b.id)}>
                  Annuler
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
