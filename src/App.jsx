import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MovieDetail from "./pages/MovieDetail";
import MyBookings from "./pages/MyBookings";
import Register from "./pages/Register";
import ShowtimePage from "./pages/ShowtimePage";
import Ticket from "./pages/Ticket";
import AdminProgramming from "./pages/admin/AdminProgramming";

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
        <NavLink to="/" end>
          À l'affiche
        </NavLink>
        {user && <NavLink to="/mes-reservations">Mes billets</NavLink>}
        {user?.role === "ADMIN" && (
          <>
            <NavLink to="/admin/programmation">Programmation</NavLink>
          </>
        )}
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
          <Route path="/" element={<Home />} />
          <Route path="/films/:id" element={<MovieDetail />} />
          <Route path="/seances/:id" element={<ShowtimePage />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/mes-reservations" element={<RequireAuth><MyBookings /></RequireAuth>} />
          <Route path="/billets/:id" element={<RequireAuth><Ticket /></RequireAuth>} />
          <Route path="/admin/programmation" element={<RequireAuth admin><AdminProgramming /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        La Grande Cinéma — 10 salles, 1 700 places · Projet Bachelor Développeur d'application Python
      </footer>
    </>
  );
}
