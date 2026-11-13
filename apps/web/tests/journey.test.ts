import { describe, expect, it } from "vitest";
import { contactDraft, exportJourney, sourceFreshness } from "../lib/journey";
describe("private contact preparation", () => {
  it("asks for confirmation instead of asserting eligibility or capacity", () => {
    expect(contactDraft("Housing")).toContain("what support may be available");
    expect(contactDraft("Housing")).toContain("another service");
  });
  it("exports only explicitly supplied entries with a privacy notice", () => {
    const entries = [{ id: "example", source: "Example", url: "https://example.org", status: "Contacted", followUp: "2026-11-20", notes: "Synthetic note" }];
    expect(JSON.parse(exportJourney(entries)).entries).toEqual(entries);
    expect(JSON.parse(exportJourney([])).entries).toEqual([]);
  });
  it("requires review for stale, invalid and future checks", () => {
    const now = new Date("2026-11-14T00:00:00Z");
    expect(sourceFreshness("2026-11-14", now)).toBe("recent");
    expect(sourceFreshness("2026-10-15", now)).toBe("recent");
    for (const date of ["2026-10-14", "2026-11-15", "bad"]) expect(sourceFreshness(date, now)).toBe("review");
  });
});
