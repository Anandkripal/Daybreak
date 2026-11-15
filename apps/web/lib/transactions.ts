import { parseAmount } from "./budget";
export type Transaction = { date: string; kind: "income" | "expense"; cents: number; recurring: boolean };
export type Month = { month: string; income: number; expenses: number; recurring: number; net: number; expenseRatio: number | null };
/** Deliberately narrow CSV contract: no descriptions, identifiers, quoted cells or inferred categories. */
export function parseTransactions(text: string): Transaction[] {
  if (text.length > 1_000_000) throw new Error("Use a CSV smaller than 1 MB.");
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines[0] !== "date,kind,amount,currency,recurring") throw new Error("Use the exact header: date,kind,amount,currency,recurring");
  if (lines.length < 2 || lines.length > 5001) throw new Error("Include between 1 and 5000 transaction rows.");
  const seen = new Set<string>();
  return lines.slice(1).map((line, index) => {
    const fields = line.split(",").map((value) => value.trim());
    const [date, kind, amount, currency, recurring] = fields;
    const cents = parseAmount(amount ?? "");
    const timestamp = Date.parse(`${date}T00:00:00Z`);
    if (fields.length !== 5 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date || cents === null || !["income", "expense"].includes(kind) || currency !== "AUD" || !["yes", "no"].includes(recurring)) throw new Error(`Check row ${index + 2}: use a real YYYY-MM-DD date, income or expense, a positive AUD amount (or zero), AUD, and yes or no.`);
    const key = [date, kind, cents, currency, recurring].join("|");
    if (seen.has(key)) throw new Error(`Row ${index + 2} repeats a transaction. Review duplicates before importing; no rows were imported.`);
    seen.add(key);
    return { date, kind: kind as Transaction["kind"], cents, recurring: recurring === "yes" };
  });
}
export function monthlyTotals(rows: Transaction[]): Month[] {
  const months = new Map<string, Month>();
  for (const row of rows) {
    const key = row.date.slice(0, 7);
    const month = months.get(key) ?? { month: key, income: 0, expenses: 0, recurring: 0, net: 0, expenseRatio: null };
    if (row.kind === "income") month.income += row.cents;
    else { month.expenses += row.cents; if (row.recurring) month.recurring += row.cents; }
    month.net = month.income - month.expenses;
    month.expenseRatio = month.income === 0 ? null : month.expenses / month.income;
    months.set(key, month);
  }
  return [...months.values()].sort((a, b) => a.month.localeCompare(b.month));
}
export function summaryCsv(months: Month[]): string {
  return ["month,income_AUD,expenses_AUD,net_AUD,recurring_expenses_AUD", ...months.map((m) => [m.month, ...[m.income, m.expenses, m.net, m.recurring].map((n) => (n / 100).toFixed(2))].join(","))].join("\n");
}
