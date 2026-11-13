export type JourneyEntry = { id: string; source: string; url: string; status: string; followUp: string; notes: string };
export function sourceFreshness(checked: string, now: Date): "recent" | "review" {
  const timestamp = Date.parse(`${checked}T00:00:00Z`);
  const age = now.getTime() - timestamp;
  return Number.isFinite(age) && age >= 0 && age <= 30 * 86400000 ? "recent" : "review";
}
export function contactDraft(topic: string): string {
  return `Hello, I am looking for help with ${topic.toLowerCase()}. Could you tell me what support may be available, what area you cover, and how to apply? Do I need an appointment or any documents? Is an interpreter or another contact method available? If you cannot help, could you suggest another service?`;
}
export function exportJourney(entries: JourneyEntry[]): string {
  return JSON.stringify({ version: 1, privacy: "Private contact notes. Store securely and delete when no longer needed.", entries }, null, 2);
}
