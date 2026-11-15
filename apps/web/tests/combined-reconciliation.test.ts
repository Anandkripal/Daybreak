import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { monthlyTotals, parseTransactions } from "../lib/transactions";

it("matches each monthly SQL control using the browser CSV workflow", () => {
  const data = JSON.parse(readFileSync("../../analytics/exports/workbook-data.json", "utf8"));
  const csv = ["date,kind,amount,currency,recurring", ...data.cashflow.map(
    (row: { month: string; kind: string; cents: number; recurring: number }, index: number) =>
      [row.month.slice(0, 8) + String((index % 4) + 1).padStart(2, "0"), row.kind,
        (row.cents / 100).toFixed(2), "AUD", row.recurring ? "yes" : "no"].join(","),
  )].join("\n");
  const browser = monthlyTotals(parseTransactions(csv));
  expect(browser).toHaveLength(12);
  for (const [i, month] of browser.entries()) {
    const sql = data.monthly_finance[i];
    expect(month.month).toBe(sql.month.slice(0, 7));
    expect([month.income, month.expenses, month.recurring, month.net, month.expenseRatio]).toEqual(
      [sql.income_cents, sql.expense_cents, sql.recurring_cents, sql.net_cents, sql.expense_ratio],
    );
  }
});
