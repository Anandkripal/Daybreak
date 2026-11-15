import { supportLinks } from "./support-links";
import { sourceFreshness } from "./journey";

export type Citation = { evidenceId: string; url: string };
export type GroundedExplanation = { text: string; citation: Citation; needsReview: boolean };

/** Only exact maintained registry IDs and URLs are citations. External prose is never evidence. */
export function validCitation(candidate: unknown): candidate is Citation {
  if (typeof candidate !== "object" || candidate === null) return false;
  const citation = candidate as Record<string, unknown>;
  return typeof citation.evidenceId === "string" && typeof citation.url === "string" &&
    supportLinks.some((source) => source.id === citation.evidenceId && source.url === citation.url);
}

/** Deterministic no-AI explanation. Selection is an exact ID, not a free-text instruction. */
export function explainStartingPoint(evidenceId: unknown, now: Date | null): GroundedExplanation | null {
  if (typeof evidenceId !== "string") return null;
  const source = supportLinks.find((item) => item.id === evidenceId);
  if (!source) return null;
  const citation = { evidenceId: source.id, url: source.url };
  if (!validCitation(citation)) return null;
  const needsReview = !now || sourceFreshness(source.checked, now) !== "recent";
  return {
    text: needsReview
      ? "The recorded source check needs review. Open the official source to confirm current details before acting."
      : `${source.source} is a starting point for ${source.title.toLowerCase()}. This is a link to information, not a confirmed match to your circumstances. Ask the organisation about current support, conditions and next steps.`,
    citation,
    needsReview,
  };
}
