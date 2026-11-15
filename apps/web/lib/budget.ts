/** Parse a non-negative AUD amount exactly into cents. */
export function parseAmount(value: string): number | null {
  const text = value.trim();
  if (!/^(?:0|[1-9]\d{0,6})(?:\.\d{1,2})?$/.test(text)) return null;
  const [dollars, decimal = ""] = text.split(".");
  return Number(dollars) * 100 + Number(decimal.padEnd(2, "0"));
}

export type BudgetResult = { netCents: number; expenseRatio: number | null };

/** Inputs and net are cents per month; ratio is expenses divided by net income. */
export function calculateBudget(incomeCents: number, expenseCents: number): BudgetResult {
  return {
    netCents: incomeCents - expenseCents,
    expenseRatio: incomeCents === 0 ? null : expenseCents / incomeCents,
  };
}
