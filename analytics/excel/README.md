# Excel review and native-feature verification

`daybreak-analyst-review.xlsx` contains formula-based monthly financial summaries, SUMIFS, exact-match XLOOKUP, zero-income handling, a category selector with validation, a live chart, conditional reconciliation warnings, source data, historical RBA rates and clearly synthetic assistance counts. The Audit sheet compares all twelve months against independently exported SQL controls. The builder tests annual controls, all 36 differences, category changes and zero income, restores test inputs, recalculates, scans formula errors and renders every sheet.

The artifact runtime documents unreliable PivotTable XLSX export. No native PivotTable or Power Query connection is claimed in this workbook. Formula summaries are not labelled PivotTables. Desktop Excel opening/recalculation, PivotTable refresh, Power Query and visual accessibility are **manual verification required**.

To complete native Excel evidence in a working copy:

1. Open in current desktop Excel, allow local calculation, confirm Summary annual income 43,800.00, expenses 25,380.00 and net 18,420.00 AUD; all Audit differences zero. Change category to Essentials: actual 7,980.00, budget 8,400.00, variance −420.00. Restore Housing.
2. Insert a native PivotTable from `SyntheticCashflow` onto a new worksheet. Rows = Category; Columns = Kind; Values = Sum of Amount AUD; filter Month. Expected all-month expenses: Housing 14,400.00, Essentials 7,980.00, Utilities 3,000.00. Income = 43,800.00. Confirm no Count substitution; refresh after an input change, reconcile, then restore and refresh.
3. Verify the exact-match lookup resolves each category and that an unknown key shows Unmapped rather than selecting a nearby match. The selector restricts normal inputs. Test January income zero: expense share must display n.a.; Audit should flag the input change. Restore income 3,100.00.
4. Where Power Query is supported, Data → Get Data → Text/CSV → choose `exports/cashflow.csv`. Set Month to Date, cents to Whole Number, category/kind/data_class to Text, recurring to Whole Number. Add AUD = cents / 100. Group by month and kind using Sum, refresh from the unchanged local file and reconcile to SQL controls. Do not use real private files. Mac/version support varies; record actual version and whether refresh works.
5. Record version, date, screenshots, checks and any formula compatibility warnings. Do not mark the milestone complete until verified. Save the validated copy and provenance separately without overwriting evidence silently.
