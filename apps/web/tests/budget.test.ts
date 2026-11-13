import { describe, expect, it } from "vitest";
import { calculateBudget, parseAmount } from "../lib/budget";

describe("monthly budget", () => {
  it.each([["0", 0], ["12.3", 1230], ["12.34", 1234], ["9999999.99", 999999999]])("parses %s as cents", (input, expected) => expect(parseAmount(input)).toBe(expected));
  it.each(["", "-1", "1.234", "1e3", "NaN", "10000000", "1,000"])('rejects invalid amount "%s"', (input) => expect(parseAmount(input)).toBeNull());
  it("computes a deficit and expense ratio using cents", () => expect(calculateBudget(200000, 250000)).toEqual({ netCents: -50000, expenseRatio: 1.25 }));
  it("does not divide by zero", () => expect(calculateBudget(0, 100)).toEqual({ netCents: -100, expenseRatio: null }));
});
