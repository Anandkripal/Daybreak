"use client";

import { useState } from "react";
import { findStartingPoints, type Need, type Region } from "../../lib/finder";

export function HelpFinder() {
  const [need, setNeed] = useState<Need>("all");
  const [region, setRegion] = useState<Region>("unknown");
  const results = findStartingPoints(need, region);
  const field = "mt-2 block w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-950";
  return <>
    <p className="mt-3 text-slate-700">Choose a need and an optional broad location to narrow these starting points. Your choices stay on this page and are cleared on reload; no address is needed.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="font-semibold">What do you need help with?
        <select className={field} value={need} onChange={(e) => setNeed(e.target.value as Need)}>
          <option value="all">All starting points</option><option value="food">Food and essentials</option><option value="housing">Housing</option><option value="money">Debt and money</option><option value="savings">Rebates and savings</option>
        </select>
      </label>
      <label className="font-semibold">Where are you? (optional)
        <select className={field} value={region} onChange={(e) => setRegion(e.target.value as Region)}>
          <option value="unknown">Prefer not to say</option><option value="nsw">New South Wales</option><option value="other">Another Australian state or territory</option>
        </select>
      </label>
    </div>
    <div aria-live="polite" aria-atomic="true" className="mt-6">
      <p className="text-slate-700">{results.length === 0 ? "No matching starting points in this small list." : `${results.length} starting ${results.length === 1 ? "point" : "points"} shown.`}</p>
      {results.length === 0 && <p className="mt-2 text-slate-700">Try another need or visit <a className="underline" href="https://askizzy.org.au/">Ask Izzy</a> to search for support across Australia. You can check other states’ government websites for local rebates.</p>}
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {results.map((link) => <li key={link.id} className="rounded-xl border border-slate-300 bg-white p-6">
          <h3 className="text-xl font-semibold text-slate-950"><a href={link.url} className="underline decoration-teal-700 underline-offset-4">{link.title}</a></h3>
          <p className="mt-3 leading-7 text-slate-700">{link.description}</p>
          <p className="mt-4 text-sm text-slate-600">{link.source} · {link.scope} · Link checked {link.checked}</p>
        </li>)}
      </ul>
    </div>
    <noscript><p className="mt-4">The filters need JavaScript. You can use the starting points listed above without filtering.</p></noscript>
  </>;
}
