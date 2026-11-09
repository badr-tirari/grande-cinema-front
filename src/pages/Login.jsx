import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { ErrorBanner } from "../components/ui";

/** US01 — connexion. */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email, password);
      const fallback = user.role === "ADMIN" ? "/admin/programmation" : "/";
      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h1>Connexion</h1>
      <ErrorBanner error={error} />
      <label>
        Email
        <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Mot de passe
        <input type="password" autoComplete="current-password" required value={password}
          onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit" className="primary" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
      <p className="muted small">
        Pas encore de compte ? <Link to="/inscription" state={location.state}>Créer un compte</Link>
      </p>
    </form>
  );
}
