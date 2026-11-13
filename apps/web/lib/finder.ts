import { supportLinks } from "./support-links";

export type Need = "all" | "food" | "housing" | "money" | "savings";
export type Region = "unknown" | "nsw" | "other";

/** These are starting points, not a search of provider inventory. */
export function findStartingPoints(need: Need, region: Region) {
  return supportLinks.filter((link) => {
    const matchesNeed = need === "all" || link.id === (need === "savings" ? "nsw" : need);
    return matchesNeed && (link.id !== "nsw" || region !== "other");
  });
}
