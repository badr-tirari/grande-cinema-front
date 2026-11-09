import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { ErrorBanner } from "../components/ui";
import { api } from "../lib/api";

/** US01 — inscription puis connexion automatique. */
export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.register(form);
      await login(form.email, form.password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h1>Créer un compte</h1>
      <ErrorBanner error={error} />
      <label>
        Nom complet
        <input required minLength={2} value={form.full_name} onChange={update("full_name")} />
      </label>
      <label>
        Email
        <input type="email" required autoComplete="email" value={form.email} onChange={update("email")} />
      </label>
      <label>
        Mot de passe <span className="muted small">(8 caractères minimum)</span>
        <input type="password" required minLength={8} autoComplete="new-password" value={form.password}
          onChange={update("password")} />
      </label>
      <button type="submit" className="primary" disabled={busy}>{busy ? "Création…" : "Créer mon compte"}</button>
      <p className="muted small">
        Déjà inscrit ? <Link to="/connexion" state={location.state}>Se connecter</Link>
      </p>
    </form>
  );
}
