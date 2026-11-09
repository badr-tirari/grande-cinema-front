import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorBanner, Loading } from "../components/ui";
import { api } from "../lib/api";
import { formatDay, formatPrice, formatTime } from "../lib/format";

/** US05 — billet dématérialisé avec QR code. */
export default function Ticket() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.booking(id).then(setBooking).catch(setError);
  }, [id]);

  if (error) return <ErrorBanner error={error} />;
  if (!booking) return <Loading />;
  const cancelled = booking.status === "CANCELLED";

  return (
    <>
      <Link to="/mes-reservations" className="back">
        ← Mes billets
      </Link>
      <article className={`ticket ${cancelled ? "cancelled" : ""}`}>
        <div className="ticket-main">
          <p className="eyebrow">La Grande Cinéma · {booking.room}</p>
          <h1>{booking.movie_title}</h1>
          <p className="lead">
            {formatDay(booking.starts_at)} à {formatTime(booking.starts_at)}
          </p>
          <p>
            Places :{" "}
            <strong>{booking.seats.map((s) => `${s.row_label}${s.number}`).join(", ") || "—"}</strong>
          </p>
          <p className="muted">Total {formatPrice(booking.total_cents)}</p>
          {cancelled && <p className="alert">Réservation annulée</p>}
        </div>
        <div className="ticket-stub">
          {!cancelled && <QRCodeSVG value={booking.code} size={148} bgColor="#fffaf0" fgColor="#14110f" />}
          <code>{booking.code}</code>
          <span className="muted small">À présenter à l'entrée de la salle</span>
        </div>
      </article>
    </>
  );
}
