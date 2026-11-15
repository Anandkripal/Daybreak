import Link from "next/link";
import { ContactJourney } from "./components/contact-journey";
import { HelpFinder } from "./components/help-finder";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-teal-800">Daybreak</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Real help. One step at a time.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">Choose what you need help with. These trusted starting points can help you explore your options.</p>
      <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-slate-950">
        <p>If someone is in immediate danger, call <a className="font-semibold underline" href="tel:000">Triple Zero (000)</a> for police, fire or ambulance.</p>
      </div>
      <section aria-labelledby="urgent-housing" className="mt-8 rounded-xl border border-slate-300 bg-white p-5">
        <h2 id="urgent-housing" className="text-xl font-semibold text-slate-950">Need somewhere to stay tonight?</h2>
        <p className="mt-2 leading-7 text-slate-700">
          In NSW, call Link2home on <a className="font-semibold text-teal-800 underline" href="tel:1800152152">1800 152 152</a> for homelessness information and help with next steps.
          The service can explain when it can make referrals. Ask about current options when you call.
        </p>
        <p className="mt-2 leading-7 text-slate-700">
          <a className="text-teal-800 underline" href="https://www.nsw.gov.au/housing-and-construction/social-affordable/emergency-housing/homelessness">Check NSW Government contact and referral details</a>
          {" · "}
          <a className="text-teal-800 underline" href="https://askizzy.org.au/">Find housing support elsewhere in Australia through Ask Izzy</a>
        </p>
      </section>
      <section aria-labelledby="help-heading" className="mt-12">
        <h2 id="help-heading" className="text-2xl font-bold text-slate-950">What do you need help with?</h2>
        <HelpFinder />
        <p className="mt-5 text-sm leading-6 text-slate-700">These links take you to other organisations. Eligibility, opening hours and availability must be confirmed with them; Daybreak does not check live capacity. Their privacy policies apply.</p>
      </section>
      <section aria-labelledby="budget-heading" className="mt-12 rounded-xl border border-teal-200 bg-teal-50 p-6">
        <h2 id="budget-heading" className="text-2xl font-bold text-slate-950">Understand your budget</h2>
        <p className="mt-3 leading-7 text-slate-700">Compare your monthly income and expenses with a possible change. Your entries stay in your browser.</p>
        <Link href="/budget" className="mt-4 inline-block font-semibold text-teal-800 underline">Open the budget tool</Link>
      </section>
      <ContactJourney />
      <section aria-labelledby="next-heading" className="mt-12 border-t border-slate-300 pt-8">
        <h2 id="next-heading" className="text-2xl font-bold text-slate-950">Before you contact a service</h2>
        <p className="mt-3 leading-7 text-slate-700">You can ask what help is available, whether you need an appointment and if an interpreter is available. You don’t need to share financial documents with Daybreak to use these links.</p>
      </section>
    </main>
  );
}
