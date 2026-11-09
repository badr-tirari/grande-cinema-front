import { useEffect, useState } from "react";
import { ErrorBanner, Loading } from "../../components/ui";
import { api } from "../../lib/api";
import { formatDay, formatPrice, formatTime } from "../../lib/format";

const EMPTY_MOVIE = { title: "", genre: "", duration_min: 100, description: "" };

/** US07 — gestion de la programmation : films et séances. */
export default function AdminProgramming() {
  const [movies, setMovies] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [movieForm, setMovieForm] = useState(EMPTY_MOVIE);
  const [stForm, setStForm] = useState({ movie_id: "", room_id: "", starts_at: "", price: "9.90" });
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  const load = () =>
    Promise.all([api.movies(), api.admin.rooms(), api.showtimes()])
      .then(([m, r, s]) => {
        setMovies(m);
        setRooms(r);
        setShowtimes(s);
      })
      .catch(setError);

  useEffect(() => {
    load();
  }, []);

  async function run(action, message) {
    setError(null);
    setNotice("");
    try {
      await action();
      setNotice(message);
      await load();
      return true;
    } catch (e) {
      setError(e);
      return false;
    }
  }

  async function addMovie(e) {
    e.preventDefault();
    const ok = await run(
      () => api.admin.createMovie({ ...movieForm, duration_min: Number(movieForm.duration_min) }),
      "Film ajouté.",
    );
    if (ok) setMovieForm(EMPTY_MOVIE);
  }

  async function addShowtime(e) {
    e.preventDefault();
    await run(
      () =>
        api.admin.createShowtime({
          movie_id: Number(stForm.movie_id),
          room_id: Number(stForm.room_id),
          starts_at: new Date(stForm.starts_at).toISOString(),
          price_cents: Math.round(Number(stForm.price) * 100),
        }),
      "Séance programmée.",
    );
  }

  if (!movies) return error ? <ErrorBanner error={error} /> : <Loading />;
  const movieTitle = (id) => movies.find((m) => m.id === id)?.title ?? `#${id}`;

  return (
    <>
      <h1>Programmation</h1>
      <ErrorBanner error={error} />
      {notice && <p className="notice">{notice}</p>}

      <div className="admin-grid">
        <form className="card form" onSubmit={addMovie}>
          <h2>Ajouter un film</h2>
          <label>
            Titre
            <input required value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} />
          </label>
          <div className="two">
            <label>
              Genre
              <input value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} />
            </label>
            <label>
              Durée (min)
              <input type="number" min="1" max="600" required value={movieForm.duration_min}
                onChange={(e) => setMovieForm({ ...movieForm, duration_min: e.target.value })} />
            </label>
          </div>
          <label>
            Synopsis
            <textarea rows="3" value={movieForm.description}
              onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} />
          </label>
          <button className="primary">Ajouter</button>
        </form>

        <form className="card form" onSubmit={addShowtime}>
          <h2>Programmer une séance</h2>
          <label>
            Film
            <select required value={stForm.movie_id} onChange={(e) => setStForm({ ...stForm, movie_id: e.target.value })}>
              <option value="">Choisir…</option>
              {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </label>
          <label>
            Salle
            <select required value={stForm.room_id} onChange={(e) => setStForm({ ...stForm, room_id: e.target.value })}>
              <option value="">Choisir…</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.capacity} places)</option>)}
            </select>
          </label>
          <div className="two">
            <label>
              Début
              <input type="datetime-local" required value={stForm.starts_at}
                onChange={(e) => setStForm({ ...stForm, starts_at: e.target.value })} />
            </label>
            <label>
              Prix (€)
              <input type="number" step="0.10" min="0" required value={stForm.price}
                onChange={(e) => setStForm({ ...stForm, price: e.target.value })} />
            </label>
          </div>
          <p className="muted small">La fin est calculée (durée du film + 15 min de nettoyage) ; les chevauchements sont refusés.</p>
          <button className="primary">Programmer</button>
        </form>
      </div>

      <h2>Films ({movies.length})</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Titre</th><th>Genre</th><th>Durée</th><th /></tr></thead>
        <tbody>
          {movies.map((m) => (
            <tr key={m.id}>
              <td>{m.title}</td><td>{m.genre}</td><td>{m.duration_min} min</td>
              <td className="right">
                <button type="button" className="ghost"
                  onClick={() => run(() => api.admin.deleteMovie(m.id), "Film supprimé.")}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>

      <h2>Séances à venir ({showtimes.length})</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Date</th><th>Film</th><th>Salle</th><th>Prix</th><th>Libres</th><th /></tr></thead>
        <tbody>
          {showtimes.slice(0, 60).map((s) => (
            <tr key={s.id}>
              <td>{formatDay(s.starts_at)} {formatTime(s.starts_at)}</td>
              <td>{movieTitle(s.movie_id)}</td>
              <td>{s.room.name}</td>
              <td>{formatPrice(s.price_cents)}</td>
              <td>{s.available_seats} / {s.room.capacity}</td>
              <td className="right">
                <button type="button" className="ghost"
                  onClick={() => run(() => api.admin.deleteShowtime(s.id), "Séance supprimée.")}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </>
  );
}
