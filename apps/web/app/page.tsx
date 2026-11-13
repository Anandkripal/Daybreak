import Link from "next/link";
import { supportLinks } from "../lib/support-links";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-teal-800">Daybreak</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Real help. One step at a time.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">Choose what you need help with. These trusted starting points can help you explore your options.</p>
      <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-slate-950">
        <p>If someone is in immediate danger, call <a className="font-semibold underline" href="tel:000">Triple Zero (000)</a> for police, fire or ambulance.</p>
      </div>
      <section aria-labelledby="help-heading" className="mt-12">
        <h2 id="help-heading" className="text-2xl font-bold text-slate-950">What do you need help with?</h2>
        <p className="mt-3 text-slate-700">You can search by location on the linked service. Daybreak does not collect your location here.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {supportLinks.map((link) => (
            <li key={link.id} className="rounded-xl border border-slate-300 bg-white p-6">
              <h3 className="text-xl font-semibold text-slate-950"><a href={link.url} className="underline decoration-teal-700 underline-offset-4">{link.title}</a></h3>
              <p className="mt-3 leading-7 text-slate-700">{link.description}</p>
              <p className="mt-4 text-sm text-slate-600">{link.source} · {link.scope} · Link checked {link.checked}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm leading-6 text-slate-700">These links take you to other organisations. Eligibility, opening hours and availability must be confirmed with them; Daybreak does not check live capacity. Their privacy policies apply.</p>
      </section>
      <section aria-labelledby="budget-heading" className="mt-12 rounded-xl border border-teal-200 bg-teal-50 p-6">
        <h2 id="budget-heading" className="text-2xl font-bold text-slate-950">Understand your budget</h2>
        <p className="mt-3 leading-7 text-slate-700">Compare your monthly income and expenses with a possible change. Your entries stay in your browser.</p>
        <Link href="/budget" className="mt-4 inline-block font-semibold text-teal-800 underline">Open the budget tool</Link>
      </section>
      <section aria-labelledby="next-heading" className="mt-12 border-t border-slate-300 pt-8">
        <h2 id="next-heading" className="text-2xl font-bold text-slate-950">Before you contact a service</h2>
        <p className="mt-3 leading-7 text-slate-700">You can ask what help is available, whether you need an appointment and if an interpreter is available. You don’t need to share financial documents with Daybreak to use these links.</p>
      </section>
    </main>
  );
}
