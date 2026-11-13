import { describe, expect, it } from "vitest";
import { findStartingPoints } from "../lib/finder";

describe("assistance starting point filters", () => {
  it("shows all starting points without a location", () => {
    expect(findStartingPoints("all", "unknown").map((x) => x.id)).toEqual(["food", "housing", "money", "nsw"]);
  });
  it("matches a need and retains nationwide options in each region", () => {
    for (const region of ["unknown", "nsw", "other"] as const) {
      expect(findStartingPoints("housing", region).map((x) => x.id)).toEqual(["housing"]);
    }
  });
  it("does not present the NSW-specific link as a match outside NSW", () => {
    expect(findStartingPoints("savings", "other")).toEqual([]);
    expect(findStartingPoints("savings", "nsw").map((x) => x.id)).toEqual(["nsw"]);
    expect(findStartingPoints("savings", "unknown").map((x) => x.id)).toEqual(["nsw"]);
  });
});
