import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, ErrorBanner, Loading } from "../components/ui";
import { api } from "../lib/api";
import { fillLevel, formatDay, formatPrice, formatTime, groupByDay } from "../lib/format";

/** US02 — détail d'un film et toutes ses séances à venir. */
export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.movie(id).then(setMovie).catch(setError);
  }, [id]);

  if (error) return <ErrorBanner error={error} />;
  if (!movie) return <Loading />;

  return (
    <>
      <Link to="/" className="back">
        ← À l'affiche
      </Link>
      <section className="detail-head">
        <p className="eyebrow">
          {movie.genre} · {movie.duration_min} min
        </p>
        <h1>{movie.title}</h1>
        <p className="lead">{movie.description}</p>
      </section>
      {movie.showtimes.length === 0 && <p className="muted">Aucune séance programmée.</p>}
      {groupByDay(movie.showtimes).map(({ day, items }) => (
        <section key={day} className="day-block">
          <h3>{formatDay(items[0].starts_at)}</h3>
          <div className="sessions">
            {items.map((s) => (
              <Link key={s.id} to={`/seances/${s.id}`} className="session">
                <strong>{formatTime(s.starts_at)}</strong>
                <span>
                  {s.room.name} · {formatPrice(s.price_cents)}
                </span>
                <Badge level={fillLevel(s.available_seats, s.room.capacity)} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
