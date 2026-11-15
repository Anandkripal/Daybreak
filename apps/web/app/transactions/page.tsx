"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { monthlyTotals, parseTransactions, summaryCsv, type Month } from "../../lib/transactions";
const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
export default function TransactionsPage() {
  const [months, setMonths] = useState<Month[]>([]);
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  async function importFile(file?: File) {
    const request = ++generation.current;
    setMonths([]); setMessage("");
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error("Use a CSV smaller than 1 MB.");
      const bytes = await file.arrayBuffer();
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      const rows = parseTransactions(text);
      if (request !== generation.current) return;
      setMonths(monthlyTotals(rows)); setMessage(`Imported ${rows.length} rows into page memory. Check that each month is complete.`);
    } catch (error) { if (request === generation.current) setMessage(error instanceof Error && error.name !== "TypeError" ? error.message : "Could not read this file. Save it as UTF-8 CSV and try again."); }
    finally { if (request === generation.current && input.current) input.current.value = ""; }
  }
  function clear() { generation.current++; setMonths([]); setMessage("All imported figures deleted from this page. Your original file and downloaded copies remain on your device."); if (input.current) input.current.value = ""; }
  function download() {
    const url = URL.createObjectURL(new Blob([summaryCsv(months)], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "daybreak-private-monthly-summary.csv"; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main className="mx-auto max-w-4xl space-y-6 px-6 py-10 text-slate-950">
    <Link className="text-teal-800 underline" href="/budget">← Back to budget</Link>
    <h1 className="text-3xl font-bold">Review a private transaction CSV</h1>
    <p>Your file is read in your browser and is not uploaded. Figures are kept only in this page session. Browser history may restore the session; use Delete imported figures to clear it. Exported summaries are private financial information: store them securely.</p>
    <p>Prepare a UTF-8 CSV with this exact header and five columns. Amounts are non-negative AUD dollars, with up to two decimal places. Set kind to income or expense, and recurring to yes or no. Remove account numbers and descriptions. This narrow format does not accept bank exports directly or quoted cells.</p>
    <pre tabIndex={0} aria-label="Example CSV format" className="overflow-x-auto rounded bg-slate-100 p-4">{"date,kind,amount,currency,recurring\n2026-10-01,income,3000.00,AUD,no\n2026-10-02,expense,1200.00,AUD,yes"}</pre>
    <p>Review repeated transactions before importing. Identical date, kind, amount and recurring values are rejected as possible duplicates, including legitimate repeats. Combine legitimate repeats into one row after checking totals. Income should be take-home income; exclude transfers between your own accounts. Mark recurring expenses yourself; Daybreak does not infer them.</p>
    <label className="block font-semibold">Choose CSV (maximum 1 MB, 5000 rows)<input ref={input} className="mt-2 block w-full rounded border border-slate-500 p-3" type="file" accept=".csv,text/csv" onChange={(e) => void importFile(e.target.files?.[0])} /></label>
    <p role="status">{message}</p>
    <button className="rounded border border-slate-500 p-3" onClick={clear}>Delete imported figures</button>
    {months.length > 0 && <section className="space-y-4" aria-labelledby="summary-heading"><h2 id="summary-heading" className="text-2xl font-semibold">Monthly cash flow</h2>
      <p>Only months with rows are shown. Missing months are unknown, not zero. Partial months are not annualised. Net = income − expenses. Expense share = expenses ÷ income. Recurring expenses sum rows you marked yes. All figures are nominal AUD, from your file; no inflation adjustment or eligibility decision is made.</p>
      <div tabIndex={0} role="region" aria-label="Monthly totals, scroll horizontally for all columns" className="overflow-x-auto"><table className="w-full text-left"><caption className="sr-only">Monthly totals from your imported rows</caption><thead><tr>{["Month", "Income", "Expenses", "Net", "Expense share", "Recurring expenses"].map((label) => <th className="p-2" scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{months.map((m) => <tr key={m.month}><th scope="row" className="p-2">{m.month}</th>{[m.income, m.expenses, m.net].map((n, i) => <td className="p-2" key={i}>{money.format(n / 100)}</td>)}<td className="p-2">{m.expenseRatio === null ? "No income — undefined" : `${(m.expenseRatio * 100).toFixed(1)}%`}</td><td className="p-2">{money.format(m.recurring / 100)}</td></tr>)}</tbody></table></div>
      <button className="rounded bg-teal-800 p-3 font-semibold text-white" onClick={download}>Export private monthly summary</button>
      <p>You can enter a month’s totals in the budget tool to explore a what-if change. These calculations describe your rows and do not predict future spending.</p>
    </section>}
  </main>;
}
