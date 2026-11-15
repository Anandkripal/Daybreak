import { describe, expect, it } from "vitest";
import { monthlyTotals, parseTransactions, summaryCsv } from "../lib/transactions";
const header = "date,kind,amount,currency,recurring\n";
describe("private CSV validation and cash flow", () => {
  it("reconciles cents, recurring expenses and gaps without inventing months", () => {
    const rows = parseTransactions(header + "2026-01-01,income,10.10,AUD,no\n2026-01-02,expense,3.33,AUD,yes\n2026-03-01,expense,2.00,AUD,no");
    const months = monthlyTotals(rows);
    expect(months).toEqual([{ month: "2026-01", income: 1010, expenses: 333, recurring: 333, net: 677, expenseRatio: 333 / 1010 }, { month: "2026-03", income: 0, expenses: 200, recurring: 0, net: -200, expenseRatio: null }]);
    expect(summaryCsv(months)).toContain("2026-01,10.10,3.33,6.77,3.33");
    expect(summaryCsv(months)).not.toContain("2026-02");
  });
  it("accepts BOM, CRLF, leap days and zero", () => {
    expect(parseTransactions("\uFEFF" + header.replace("\n", "\r\n") + "2024-02-29,expense,0,AUD,no\r\n")).toHaveLength(1);
  });
  it.each(["2026-02-30,income,1,AUD,no", "2026-01-01,income,-1,AUD,no", "2026-01-01,income,1.001,AUD,no", "2026-01-01,income,1,USD,no", "2026-01-01,transfer,1,AUD,no", "2026-01-01,income,1,AUD,maybe", '2026-01-01,income,"1",AUD,no', "2026-01-01,income,=1,AUD,no", "2026-01-01,income,1,AUD,no,extra"])("rejects malformed row %s", (row) => expect(() => parseTransactions(header + row)).toThrow("row 2"));
  it("rejects duplicate normalized amounts and empty or oversized input", () => {
    expect(() => parseTransactions(header + "2026-01-01,income,1,AUD,no\n2026-01-01,income,1.00,AUD,no")).toThrow("repeats");
    expect(() => parseTransactions(header)).toThrow();
    expect(() => parseTransactions("x".repeat(1000001))).toThrow("1 MB");
    expect(() => parseTransactions(header + "2026-01-01,income,1,AUD,no\n".repeat(5001))).toThrow("5000");
  });
});
