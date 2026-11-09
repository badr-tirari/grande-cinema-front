/** Client HTTP de l'API La Grande Cinéma (jeton JWT en en-tête Authorization). */

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const TOKEN_KEY = "gc_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* stockage indisponible (navigation privée) : session non persistée */
  }
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function messageFrom(body, status) {
  if (!body) return `Erreur ${status}`;
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) return body.detail.map((d) => d.msg).join(" ; ");
  return `Erreur ${status}`;
}

async function request(path, { method = "GET", json, form, params } = {}) {
  const url = new URL(API_URL + path);
  Object.entries(params || {}).forEach(([k, v]) => v !== undefined && v !== "" && url.searchParams.set(k, v));
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = new URLSearchParams(form);
  }
  const res = await fetch(url, { method, headers, body });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) setToken(null);
    throw new ApiError(res.status, messageFrom(data, res.status));
  }
  return data;
}

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", json: payload }),
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", form: { username: email, password } }),
  me: () => request("/api/auth/me"),

  movies: (search) => request("/api/movies", { params: { search } }),
  movie: (id) => request(`/api/movies/${id}`),
  showtimes: (params) => request("/api/showtimes", { params }),
  seatMap: (showtimeId) => request(`/api/showtimes/${showtimeId}/seats`),

  book: (showtimeId, seatIds) =>
    request("/api/bookings", { method: "POST", json: { showtime_id: showtimeId, seat_ids: seatIds } }),
  myBookings: () => request("/api/bookings/me"),
  booking: (id) => request(`/api/bookings/${id}`),
  cancelBooking: (id) => request(`/api/bookings/${id}/cancel`, { method: "POST" }),

  admin: {
    rooms: () => request("/api/admin/rooms"),
    createMovie: (payload) => request("/api/admin/movies", { method: "POST", json: payload }),
    updateMovie: (id, payload) => request(`/api/admin/movies/${id}`, { method: "PATCH", json: payload }),
    deleteMovie: (id) => request(`/api/admin/movies/${id}`, { method: "DELETE" }),
    createShowtime: (payload) => request("/api/admin/showtimes", { method: "POST", json: payload }),
    deleteShowtime: (id) => request(`/api/admin/showtimes/${id}`, { method: "DELETE" }),
    bookings: (params) => request("/api/admin/bookings", { params }),
    occupancy: (params) => request("/api/admin/stats/occupancy", { params }),
  },
};
