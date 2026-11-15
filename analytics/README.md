# Reproducible analyst package

Run `python3 analytics/export_bi.py` from the repository root. This uses Python's standard library and SQLite, writes five CSV datasets plus a SHA-256/row-count manifest and workbook input JSON under `analytics/exports`, and fails if synthetic source totals do not reconcile with SQL. Run `python3 -m unittest discover -s analytics/tests -v` for independent known-answer and reproducibility checks. No private user data or credentials are accepted.

The financial and assistance samples are entirely invented. The financial example represents one fictional budget, not an Australian population estimate. The RBA extract is a frozen selected historical public series, separately labelled. Never join the 2025 synthetic cash flows to 2015–2020 rates to imply an observed relationship.

The workbook builder is `analytics/excel/build.mjs`. It requires the bundled `@oai/artifact-tool` Node runtime located by Codex's workspace dependency tool. Run it with an optional output directory argument after generating exports. It writes one workbook, verification evidence and preview images. The checked-in workbook is the reviewed output; desktop Excel recalculation and native features remain unverified. See the [Excel guide](excel/README.md), [Tableau guide](tableau/BUILD.md) and [dictionary](DATA_DICTIONARY.md).

`analytics/sql/monthly_finance.sql` demonstrates CTEs, conditional aggregation, LAG, cumulative and rolling windows. The prior API revision audit demonstrates ranked snapshots and full outer joins. These examples are deliberately separate from production migrations. SQLite is a lightweight export engine, not a claim of a production PostgreSQL star warehouse.

`PSQL=/path/to/psql DATABASE_BENCH_URL=postgres python3 analytics/benchmark.py` measures a PostgreSQL selective aggregate on 200,000 synthetic temporary rows, before and after an index. Only session-local temporary objects are created and removed on disconnect. `analytics/evidence/query-plan.json` contains actual timings and EXPLAIN (ANALYZE, BUFFERS) plans; reruns update this machine-dependent evidence. It does not justify an index on the tiny RBA source table.
