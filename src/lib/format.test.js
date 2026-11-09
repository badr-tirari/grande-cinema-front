import { describe, expect, it } from "vitest";
import { fillLevel, formatPercent, formatPrice, groupByDay, seatRows, toggleSeat } from "./format";

describe("formatPrice", () => {
  it("convertit des centimes en euros", () => {
    expect(formatPrice(990).replace(/\s/g, " ")).toBe("9,90 €");
  });
});

describe("formatPercent", () => {
  it("arrondit le taux", () => expect(formatPercent(0.8333)).toBe("83 %"));
});

describe("groupByDay", () => {
  it("regroupe et trie les séances par jour", () => {
    const groups = groupByDay([
      { id: 2, starts_at: "2026-07-02T18:00:00" },
      { id: 1, starts_at: "2026-07-01T20:00:00" },
      { id: 3, starts_at: "2026-07-01T14:00:00" },
    ]);
    expect(groups.map((g) => g.day)).toEqual(["2026-07-01", "2026-07-02"]);
    expect(groups[0].items.map((s) => s.id)).toEqual([3, 1]);
  });
});

describe("seatRows", () => {
  it("trie rangées et numéros", () => {
    const rows = seatRows([
      { seat_id: 3, row_label: "B", number: 1 },
      { seat_id: 2, row_label: "A", number: 2 },
      { seat_id: 1, row_label: "A", number: 1 },
    ]);
    expect(rows.map((r) => r.label)).toEqual(["A", "B"]);
    expect(rows[0].seats.map((s) => s.seat_id)).toEqual([1, 2]);
  });
});

describe("toggleSeat", () => {
  it("ajoute puis retire une place", () => {
    expect(toggleSeat([], 5)).toEqual([5]);
    expect(toggleSeat([5], 5)).toEqual([]);
  });
  it("respecte le maximum", () => {
    expect(toggleSeat([1, 2], 3, 2)).toEqual([1, 2]);
  });
});

describe("fillLevel", () => {
  it.each([
    [0, 100, "complet"],
    [10, 100, "presque complet"],
    [40, 100, "affluence"],
    [90, 100, "disponible"],
    [0, 0, "complet"],
  ])("%i libres sur %i → %s", (available, capacity, expected) => {
    expect(fillLevel(available, capacity)).toBe(expected);
  });
});
