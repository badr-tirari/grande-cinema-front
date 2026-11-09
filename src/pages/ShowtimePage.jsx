import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth";
import { ErrorBanner, Loading } from "../components/ui";
import { api } from "../lib/api";
import { formatDay, formatPrice, formatTime, seatRows, toggleSeat } from "../lib/format";

const MAX_SEATS = 10;
const REFRESH_MS = 15000;

/** US03 — plan de salle en temps réel ; US04 — réservation des places choisies. */
export default function ShowtimePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(
    () =>
      api
        .seatMap(id)
        .then((m) => {
          setMap(m);
          // Retire de la sélection les places prises entre-temps par d'autres spectateurs.
          const free = new Set(m.seats.filter((s) => s.available).map((s) => s.seat_id));
          setSelected((sel) => sel.filter((seatId) => free.has(seatId)));
        })
        .catch(setError),
    [id],
  );

  useEffect(() => {
    refresh();
    api
      .showtimes()
      .then((list) => setShowtime(list.find((s) => String(s.id) === id) || null))
      .catch(() => {});
    const timer = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timer);
  }, [id, refresh]);

  async function book() {
    if (!user) {
      navigate("/connexion", { state: { from: `/seances/${id}` } });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const booking = await api.book(Number(id), selected);
      navigate(`/billets/${booking.id}`);
    } catch (e) {
      setError(e);
      setSelected([]);
      refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!map) return error ? <ErrorBanner error={error} /> : <Loading />;
  const price = showtime?.price_cents ?? 0;

  return (
    <>
      <Link to={showtime ? `/films/${showtime.movie_id}` : "/"} className="back">
        ← Retour
      </Link>
      <section className="detail-head">
        <p className="eyebrow">
          {map.room}
          {showtime && ` · ${formatDay(showtime.starts_at)} à ${formatTime(showtime.starts_at)}`}
        </p>
        <h1>Choisissez vos places</h1>
        <p className="muted">
          {map.available_count} place{map.available_count > 1 ? "s" : ""} libre
          {map.available_count > 1 ? "s" : ""} sur {map.capacity} · mise à jour automatique
        </p>
      </section>

      <ErrorBanner error={error} />

      <div className="seat-layout">
        <div className="screen">Écran</div>
        <div className="seat-map" role="group" aria-label="Plan de salle">
          {seatRows(map.seats).map((row) => (
            <div key={row.label} className="seat-row">
              <span className="row-label">{row.label}</span>
              {row.seats.map((seat) => {
                const isSelected = selected.includes(seat.seat_id);
                return (
                  <button
                    key={seat.seat_id}
                    type="button"
                    className={`seat ${seat.available ? "" : "taken"} ${isSelected ? "selected" : ""}`}
                    disabled={!seat.available}
                    aria-pressed={isSelected}
                    aria-label={`Rangée ${row.label} place ${seat.number}${seat.available ? "" : " (occupée)"}`}
                    onClick={() => setSelected((sel) => toggleSeat(sel, seat.seat_id, MAX_SEATS))}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="legend">
          <span><i className="seat" /> Libre</span>
          <span><i className="seat selected" /> Votre choix</span>
          <span><i className="seat taken" /> Occupée</span>
        </div>
      </div>

      <div className="checkout">
        <div>
          <strong>
            {selected.length} place{selected.length > 1 ? "s" : ""}
          </strong>
          <span className="muted"> · {formatPrice(price * selected.length)}</span>
          {selected.length >= MAX_SEATS && <p className="muted small">Maximum {MAX_SEATS} places.</p>}
        </div>
        <button type="button" className="primary" disabled={!selected.length || busy} onClick={book}>
          {busy ? "Réservation…" : user ? "Réserver" : "Se connecter pour réserver"}
        </button>
      </div>
    </>
  );
}
