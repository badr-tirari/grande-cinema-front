/** Fonctions pures de mise en forme (testées unitairement avec Vitest). */

const priceFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const timeFormatter = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export const formatPrice = (cents) => priceFormatter.format(cents / 100);
export const formatDay = (iso) => dateFormatter.format(new Date(iso));
export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
export const formatTime = (iso) => timeFormatter.format(new Date(iso));
export const formatPercent = (rate) => `${Math.round(rate * 100)} %`;

/** Clé AAAA-MM-JJ dans le fuseau du navigateur, pour regrouper les séances par jour. */
export function dayKey(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Regroupe une liste de séances par jour, dans l'ordre chronologique. */
export function groupByDay(showtimes) {
  const groups = new Map();
  for (const s of [...showtimes].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))) {
    const key = dayKey(s.starts_at);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.entries()].map(([day, items]) => ({ day, items }));
}

/** Transforme la liste plate des places en rangées triées pour dessiner le plan de salle. */
export function seatRows(seats) {
  const rows = new Map();
  for (const seat of seats) {
    if (!rows.has(seat.row_label)) rows.set(seat.row_label, []);
    rows.get(seat.row_label).push(seat);
  }
  return [...rows.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, list]) => ({ label, seats: list.sort((a, b) => a.number - b.number) }));
}

/** Ajoute ou retire une place de la sélection, dans la limite autorisée. */
export function toggleSeat(selected, seatId, max = 10) {
  if (selected.includes(seatId)) return selected.filter((id) => id !== seatId);
  if (selected.length >= max) return selected;
  return [...selected, seatId];
}

/** Niveau d'affluence affiché à côté d'une séance. */
export function fillLevel(available, capacity) {
  if (capacity === 0 || available === 0) return "complet";
  const rate = 1 - available / capacity;
  if (rate >= 0.8) return "presque complet";
  if (rate >= 0.5) return "affluence";
  return "disponible";
}
