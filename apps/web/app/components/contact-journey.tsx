"use client";
import { useState } from "react";
import { supportLinks } from "../../lib/support-links";
import { contactDraft, exportJourney, type JourneyEntry } from "../../lib/journey";

export function ContactJourney() {
  const [selected, setSelected] = useState<string>(supportLinks[0].id);
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [message, setMessage] = useState("");
  const source = supportLinks.find((link) => link.id === selected)!;
  const field = "mt-2 block w-full rounded border border-slate-500 p-2 text-slate-950 bg-white";
  function update(id: string, patch: Partial<JourneyEntry>) {
    setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  }
  function download() {
    const url = URL.createObjectURL(new Blob([exportJourney(entries)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "daybreak-private-follow-up.json"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Export downloaded. It contains private notes; keep it somewhere safe. Deleting here does not delete downloaded copies.");
  }
  return <section aria-labelledby="journey-heading" className="mt-12 space-y-5 border-t border-slate-300 pt-8">
    <h2 id="journey-heading" className="text-2xl font-bold">Prepare a contact and follow up</h2>
    <p>These starting points may direct you to a provider. Review this draft before using it. Nothing is sent automatically. Your notes stay in page memory and disappear when you leave or reload. No reminders are sent.</p>
    <label className="block font-semibold">Choose a starting point<select className={field} value={selected} onChange={(e) => setSelected(e.target.value)}>{supportLinks.map((link) => <option key={link.id} value={link.id}>{link.title}</option>)}</select></label>
    <p className="rounded border border-teal-300 bg-teal-50 p-4">{contactDraft(source.title)}</p>
    <p>Before sharing documents, confirm the organisation and its secure contact method. Ask which documents are needed; do not put identity or account numbers in these notes.</p>
    <ul className="list-disc pl-6"><li>Ask about current availability, area served and any conditions.</li><li>Ask how to apply, any costs, and the expected response time.</li><li>Agree on a next step and a date to follow up.</li></ul>
    <a className="inline-block text-teal-800 underline" href={source.url}>Open {source.source} to choose a contact method</a>
    <div><button className="rounded bg-teal-800 px-4 py-2 font-semibold text-white" onClick={() => { setEntries([...entries, { id: crypto.randomUUID(), source: source.title, url: source.url, status: "Preparing", followUp: "", notes: "" }]); setMessage("Added a private follow-up entry."); }}>Add to my follow-up list</button></div>
    {entries.map((entry) => <fieldset key={entry.id} className="space-y-3 rounded border border-slate-300 p-4"><legend className="font-semibold">{entry.source}</legend>
      <label className="block">Progress<select className={field} value={entry.status} onChange={(e) => update(entry.id, { status: e.target.value })}>{["Preparing", "Contacted", "Waiting for reply", "Received help", "Not available — try another option", "Closed"].map((status) => <option key={status}>{status}</option>)}</select></label>
      <label className="block">Follow-up date (optional)<input type="date" className={field} value={entry.followUp} onChange={(e) => update(entry.id, { followUp: e.target.value })} /></label>
      <label className="block">Next step or outcome (optional, up to 1000 characters)<textarea autoComplete="off" maxLength={1000} className={field} value={entry.notes} onChange={(e) => update(entry.id, { notes: e.target.value })} /></label>
      <button className="underline" onClick={() => { setEntries(entries.filter((item) => item.id !== entry.id)); setMessage("Entry deleted from this page."); }}>Delete this entry</button>
    </fieldset>)}
    {entries.length > 0 && <div className="flex gap-4"><button className="rounded border border-slate-500 p-2" onClick={download}>Export my private notes</button><button className="rounded border border-slate-500 p-2" onClick={() => { setEntries([]); setMessage("All follow-up entries deleted from this page. Downloaded copies remain on your device."); }}>Delete all notes</button></div>}
    <p role="status">{message}</p>
  </section>;
}
