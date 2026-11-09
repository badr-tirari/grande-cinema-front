import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import Login from "./pages/Login";
import Register from "./pages/Register";

function RequireAuth({ admin = false, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <p className="muted center">Chargement…</p>;
  if (!user) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  if (admin && user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => {
    logout();
    navigate("/", { replace: true });
  };
  return (
    <header className="site-header">
      <NavLink to="/" className="brand">
        <span className="brand-mark">GC</span>
        <span>
          La Grande Cinéma
          <small>Réservation en ligne</small>
        </span>
      </NavLink>
      <nav>
        {user ? (
          <button type="button" className="link-button" onClick={signOut} title={user.email}>
            Déconnexion
          </button>
        ) : (
          <NavLink to="/connexion" className="pill">
            Se connecter
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        La Grande Cinéma — 10 salles, 1 700 places · Projet Bachelor Développeur d'application Python
      </footer>
    </>
  );
}
