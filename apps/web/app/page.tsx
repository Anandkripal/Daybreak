import { getApiHealth } from "../lib/api-health";

export const dynamic = "force-dynamic";

export default async function Home() {
  const health = await getApiHealth(process.env.API_BASE_URL ?? "http://localhost:8000");
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-wider text-teal-800">Daybreak</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Real help. One step at a time.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">Daybreak is being built to help people find support and understand their finances. This early foundation does not yet provide assistance or financial tools.</p>
      <section aria-labelledby="status-heading" className="mt-10 rounded-xl border border-slate-300 bg-white p-6">
        <h2 id="status-heading" className="text-xl font-semibold text-slate-950">Service connection</h2>
        <p className="mt-2 text-slate-700">{health.available ? "The Daybreak API is responding." : "The Daybreak API is currently unavailable. Please try again later."}</p>
      </section>
    </main>
  );
}
