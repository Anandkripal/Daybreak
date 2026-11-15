# M3 budget scenario: first slice

The browser-only monthly calculator accepts manually entered non-negative AUD amounts with at most two decimal places. It stores no records; values remain in page memory and disappear on navigation or reload. No form submits the entries to the server. JavaScript is required. No analytics, LLM, database or CSV upload is involved.

Current and scenario net cash flow = monthly take-home income minus monthly expenses, in AUD. Change = scenario net minus current net. Current expense-to-income ratio = current expenses / current take-home income, expressed as a percentage; it is unavailable when income is zero. Values are entered and calculated in integer cents, with a limit of AUD 9,999,999.99 per input. The scenario uses user-entered totals, not a forecast; it ignores unentered costs and is not financial advice or an eligibility decision.

M3 remains in progress: private transactions, richer KPI definitions, SQL/Python reconciliation, data isolation for persisted records, independent review and manual accessibility evidence are not implemented or verified. The M2 data and M1 acceptance gates remain open.

Local verification: web lint and typecheck passed, 22 unit tests passed, and the production build succeeded. Headless Chrome at 320px calculated sample values, reported zero axe violations and no horizontal overflow, observed no non-GET requests during the check, and cleared inputs on reload. This is limited automation, not a complete privacy or accessibility audit.
