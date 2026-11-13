"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateBudget, parseAmount, type BudgetResult } from "../../lib/budget";

const currency = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

type Results = { current: BudgetResult; scenario: BudgetResult };

export default function BudgetPage() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [scenarioIncome, setScenarioIncome] = useState("");
  const [scenarioExpenses, setScenarioExpenses] = useState("");
  const [result, setResult] = useState<Results | null>(null);
  const [error, setError] = useState("");

  function submit() {
    const amounts = [income, expenses, scenarioIncome, scenarioExpenses].map(parseAmount);
    if (amounts.some((amount) => amount === null)) {
      setResult(null);
      setError("Enter all four amounts in dollars, using up to two decimal places. Use 0 if an amount is zero.");
      return;
    }
    const [currentIncome, currentExpenses, nextIncome, nextExpenses] = amounts as number[];
    setError("");
    setResult({ current: calculateBudget(currentIncome, currentExpenses), scenario: calculateBudget(nextIncome, nextExpenses) });
  }

  function clear() {
    setIncome(""); setExpenses(""); setScenarioIncome(""); setScenarioExpenses(""); setResult(null); setError("");
  }

  const fieldClass = "mt-2 w-full rounded border border-slate-500 bg-white px-3 py-2 text-slate-950";
  return <main className="mx-auto max-w-3xl px-6 py-10 sm:py-16">
    <Link href="/" className="text-teal-800 underline">← Back to help</Link>
    <h1 className="mt-6 text-4xl font-bold text-slate-950">Explore your monthly budget</h1>
    <p className="mt-4 leading-7 text-slate-700">Compare your current monthly figures with a possible change. This is a simple estimate, not financial advice or a prediction.</p>
    <p className="mt-3 leading-7 text-slate-700">Your entries stay in this page’s memory and are cleared when you leave or reload. They are not sent to Daybreak’s server. Do not use a shared device if others can see your screen.</p>
    <noscript><p>JavaScript is required to calculate in your browser.</p></noscript>
    <div className="mt-8 space-y-8">
      <fieldset className="space-y-4"><legend className="text-xl font-semibold">Current month</legend>
        <label className="block">Monthly take-home income (AUD)<input className={fieldClass} type="text" inputMode="decimal" value={income} onChange={(e) => { setIncome(e.target.value); setResult(null); }} autoComplete="off" /></label>
        <label className="block">Monthly expenses (AUD)<input className={fieldClass} type="text" inputMode="decimal" value={expenses} onChange={(e) => { setExpenses(e.target.value); setResult(null); }} autoComplete="off" /></label>
      </fieldset>
      <fieldset className="space-y-4"><legend className="text-xl font-semibold">What if things change?</legend>
        <p className="text-slate-700">Enter your possible new totals, not the change amount. You can repeat the current amounts if only one changes.</p>
        <label className="block">Possible monthly take-home income (AUD)<input className={fieldClass} type="text" inputMode="decimal" value={scenarioIncome} onChange={(e) => { setScenarioIncome(e.target.value); setResult(null); }} autoComplete="off" /></label>
        <label className="block">Possible monthly expenses (AUD)<input className={fieldClass} type="text" inputMode="decimal" value={scenarioExpenses} onChange={(e) => { setScenarioExpenses(e.target.value); setResult(null); }} autoComplete="off" /></label>
      </fieldset>
      {error && <p role="alert" className="rounded border border-red-700 bg-red-50 p-3 text-red-900">{error}</p>}
      <div className="flex flex-wrap gap-3"><button className="rounded bg-teal-800 px-5 py-3 font-semibold text-white" type="button" onClick={submit}>Compare amounts</button><button className="rounded border border-slate-600 px-5 py-3 text-slate-950" type="button" onClick={clear}>Clear entries</button></div>
    </div>
    {result && <section aria-labelledby="results-heading" aria-live="polite" className="mt-10 rounded-xl border border-slate-300 bg-white p-6">
      <h2 id="results-heading" className="text-2xl font-semibold">Your comparison</h2>
      <p className="mt-3 text-slate-700">Monthly net cash flow is take-home income minus expenses. A negative amount means expenses exceed income.</p>
      <dl className="mt-5 space-y-4">
        <div><dt className="font-semibold">Current net cash flow</dt><dd>{currency.format(result.current.netCents / 100)} per month</dd></div>
        <div><dt className="font-semibold">Possible net cash flow</dt><dd>{currency.format(result.scenario.netCents / 100)} per month</dd></div>
        <div><dt className="font-semibold">Change in net cash flow</dt><dd>{currency.format((result.scenario.netCents - result.current.netCents) / 100)} per month</dd></div>
        <div><dt className="font-semibold">Current expenses as a share of income</dt><dd>{result.current.expenseRatio === null ? "Not available when income is zero." : `${(result.current.expenseRatio * 100).toFixed(1)}%`}</dd></div>
      </dl>
      <p className="mt-5 leading-7 text-slate-700">Results depend on the amounts you enter and do not include future changes, debts or costs unless you included them. They do not determine eligibility for support.</p>
      <Link className="mt-4 inline-block text-teal-800 underline" href="/">Explore support options</Link>
    </section>}
  </main>;
}
