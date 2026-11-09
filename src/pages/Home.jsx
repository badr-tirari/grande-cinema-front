import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, ErrorBanner, Loading } from "../components/ui";
import { api } from "../lib/api";
import { capitalize, dayKey, fillLevel, formatDay, formatTime } from "../lib/format";

/** US02 — films à l'affiche et prochaines séances du jour choisi. */
export default function Home() {
  const [movies, setMovies] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [search, setSearch] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => api.movies(search).then(setMovies).catch(setError), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    api.showtimes().then(setShowtimes).catch(setError);
  }, []);

  const days = [...new Set(showtimes.map((s) => dayKey(s.starts_at)))].slice(0, 7);
  const activeDay = day || days[0];
  const byMovie = (movieId) =>
    showtimes.filter((s) => s.movie_id === movieId && dayKey(s.starts_at) === activeDay);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Festival de jazz · programmation spéciale</p>
        <h1>Votre place, sans la file d'attente.</h1>
        <p className="lead">
          Consultez les séances, choisissez vos places sur le plan de salle et présentez votre billet
          sur votre téléphone.
        </p>
      </section>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Rechercher un film…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher un film"
        />
        <div className="day-tabs" role="tablist">
          {days.map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={d === activeDay}
              className={d === activeDay ? "active" : ""}
              onClick={() => setDay(d)}
            >
              {capitalize(formatDay(`${d}T12:00:00`))}
            </button>
          ))}
        </div>
      </div>

      <ErrorBanner error={error} />
      {!movies ? (
        <Loading />
      ) : movies.length === 0 ? (
        <p className="muted center">Aucun film ne correspond à votre recherche.</p>
      ) : (
        <div className="movie-grid">
          {movies.map((m) => {
            const sessions = byMovie(m.id);
            return (
              <article key={m.id} className="movie-card">
                <div className="poster" aria-hidden="true">
                  <span>{m.title.slice(0, 1)}</span>
                </div>
                <div className="movie-body">
                  <p className="eyebrow">
                    {m.genre} · {m.duration_min} min
                  </p>
                  <h2>
                    <Link to={`/films/${m.id}`}>{m.title}</Link>
                  </h2>
                  <p className="muted clamp">{m.description}</p>
                  <div className="sessions">
                    {sessions.length === 0 && <span className="muted small">Pas de séance ce jour</span>}
                    {sessions.map((s) => (
                      <Link key={s.id} to={`/seances/${s.id}`} className="session">
                        <strong>{formatTime(s.starts_at)}</strong>
                        <span>{s.room.name}</span>
                        <Badge level={fillLevel(s.available_seats, s.room.capacity)} />
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
