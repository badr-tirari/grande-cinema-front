import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, getToken, setToken } from "./api";

function mockFetch(status, body) {
  const fn = vi.fn(async () => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  const store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("jeton", () => {
  it("enregistre, relit puis supprime le jeton", () => {
    setToken("abc");
    expect(getToken()).toBe("abc");
    setToken(null);
    expect(getToken()).toBeNull();
  });

  it("ne plante pas si le stockage est indisponible", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("bloqué");
      },
      setItem: () => {
        throw new Error("bloqué");
      },
    });
    expect(getToken()).toBeNull();
    expect(() => setToken("x")).not.toThrow();
  });
});

describe("requêtes", () => {
  it("envoie le jeton et les paramètres de recherche", async () => {
    setToken("jwt");
    const fetch = mockFetch(200, [{ id: 1 }]);
    await expect(api.movies("jazz")).resolves.toEqual([{ id: 1 }]);
    const [url, options] = fetch.mock.calls[0];
    expect(String(url)).toContain("/api/movies?search=jazz");
    expect(options.headers.Authorization).toBe("Bearer jwt");
  });

  it("envoie la réservation en JSON", async () => {
    const fetch = mockFetch(201, { id: 9 });
    await api.book(3, [10, 11]);
    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({ showtime_id: 3, seat_ids: [10, 11] });
  });

  it("envoie la connexion en formulaire OAuth2", async () => {
    const fetch = mockFetch(200, { access_token: "t" });
    await api.login("a@b.fr", "secret-123");
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("username")).toBe("a@b.fr");
  });

  it("transforme une erreur 409 en ApiError lisible", async () => {
    mockFetch(409, { detail: "Une ou plusieurs places viennent d'être réservées" });
    const err = await api.book(1, [1]).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
    expect(err.message).toMatch(/réservées/);
  });

  it("agrège les erreurs de validation 422", async () => {
    mockFetch(422, { detail: [{ msg: "champ requis" }, { msg: "trop court" }] });
    await expect(api.register({})).rejects.toThrow("champ requis ; trop court");
  });

  it("efface un jeton expiré sur 401", async () => {
    setToken("expiré");
    mockFetch(401, { detail: "Identifiants invalides ou session expirée" });
    await expect(api.me()).rejects.toThrow(/session expirée/);
    expect(getToken()).toBeNull();
  });

  it("renvoie null sur 204 (suppression)", async () => {
    mockFetch(204, null);
    await expect(api.admin.deleteMovie(4)).resolves.toBeNull();
  });
});
