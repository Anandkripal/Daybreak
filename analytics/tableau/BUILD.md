# Five Tableau views from supplied extracts

These are reproducible manual build instructions with actual CSV inputs, not a verified `.twb` or `.twbx`. Native Tableau creation, opening, refresh, filters/actions and visual review remain **manual verification required**. Use only the supplied synthetic/public files on Tableau Public. Keep financial, assistance and RBA sources separate to avoid row multiplication or false relationships.

## 1. Financial Wellbeing Overview

Connect Text File to `exports/monthly_finance.csv`. Parse month as Date, cent fields as Number, expense_ratio as Decimal. Create `Income AUD = [income_cents] / 100.0`, `Expenses AUD = [expense_cents] / 100.0`, `Net AUD = [net_cents] / 100.0`. Display annual SUM cards and a monthly line of Net AUD. For aggregate expense share use `IF SUM([income_cents]) = 0 THEN NULL ELSE SUM([expense_cents]) / SUM([income_cents]) END`; do not average monthly ratios. Controls: 43,800, 25,380 and 18,420 AUD. Title: Synthetic fictional budget, calendar 2025. Month filter applies to all views using this source.

## 2. Income, Spending and Cash-Flow Patterns

Connect separately to `exports/cashflow.csv`. Create `Amount AUD = [cents] / 100.0`. Category on Rows, SUM(Amount AUD) on Columns, kind filter = expense; sort descending. Month on filter. Create `Category annual expense = { FIXED [category] : SUM(IF [kind] = 'expense' THEN [cents]/100.0 ELSE 0 END) }`. FIXED ignores ordinary month filters: label the field annual, or add Month to context when an intentionally filtered total is required. Expense controls: Housing 14,400, Essentials 7,980, Utilities 3,000. A highlight action on Category may link this view to another sheet using this same source; do not falsely claim cross-source joins. To show running net, use the monthly source and `RUNNING_SUM(SUM([Net AUD]))`, Compute Using Month ascending; final = 18,420.

## 3. Australian Banking & Economic Indicators

Use `exports/rba_rates.csv` separately. Period = Date, rate_percent_pa = Decimal, series_id = Dimension. Plot MIN(rate_percent_pa) by exact month; there is one observation per month. Create `Change pp = MIN([rate_percent_pa]) - LOOKUP(MIN([rate_percent_pa]),-1)` and compute along chronological Period; first result null. Add integer parameter Rolling observations (1–12, default 3) and table calculation `WINDOW_AVG(MIN([rate_percent_pa]), -[Rolling observations]+1, 0)`. Use full chronological data for calculations; a regular date filter changes the window population, so use a table-calculation display filter if retaining previous observations is intended. Label per cent per annum and pp distinctly. Caption the RBA source URL, selected FILRSAVR, June 2015–January 2020 and historical/revised caveat. This is one rate series, not a broad banking dashboard. Do not sum rates or imply current rates.

## 4. Community Assistance Access & Outcomes

Use `exports/assistance.csv`. Month = Date; category = Dimension; counts = Whole Number. Show stacked outcomes by category (received_help, awaiting_reply, not_available) and total contacts. Create `Help share = IF SUM([contacts])=0 THEN NULL ELSE SUM([received_help])/SUM([contacts]) END`. Add Category and Month filters and a highlight action between counts and rate sheets. Controls: contacts 954; received help 414; awaiting reply 288; not available 252. Every title/caption must say synthetic invented counts; these are not unique people, live capacity or measured social impact.

## 5. Data Quality, Governance & Exceptions

Use `exports/quality.csv`, check as Dimension, difference and expected as numbers. Create `Mismatch = [difference] <> [expected]`. Display check, difference, expected and red encoding only for mismatches. All five checks must have difference zero. Add text for source classes and manifest hashes; a zero mismatch count proves only these named checks. Provide a URL action to the RBA source URL as a fixed official destination. Include source retrieval date, range and the missing native-review status. Do not claim privacy review or freshness from a count alone.

## Verification record

After building, open the saved workbook and refresh from the committed CSVs. Compare all controls above and the manifest row counts (48, 12, 36, 56, 5). Exercise empty month filters, category filters, rolling parameter 1/3/12, and reset actions. Confirm first-period change null and ratio denominators correct. Save screenshots, Tableau version and result notes. No native tests have yet been performed; no workbook file is claimed here.
