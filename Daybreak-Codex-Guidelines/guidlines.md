# DAYBREAK — ENGINEERING GUIDELINES & CODEX MASTER INSTRUCTIONS

**Document version:** 1.0  
**Repository:** https://github.com/Anandkripal/Daybreak  
**Brand:** Daybreak — *Real help. One step at a time.*  
**Status:** Product and engineering specification; requirements are not proof of implementation.  
**Document purpose:** Durable instructions for Codex agents working inside the Daybreak repository. This is a living document. Keep requirements stable unless explicitly changed by the project owner; update the implementation checklist and decisions when code changes.

> **Codex startup instruction:** Read this entire file, the root `AGENTS.md`, `README.md`, the current Git status, and any relevant milestone or architectural documents before making changes. If previous documents conflict, treat this file as the product-level requirements, user instructions as highest priority, and current code as evidence of what is implemented. Do not claim something works until verified.

---

## 1. Purpose, outcomes, and non-negotiables

Build an **open-source, production-oriented, Australia-first AI-enabled financial wellbeing and community assistance platform** that serves two equally important purposes:

1. **Real-world social benefit:** Help Australians experiencing hardship find trustworthy assistance (food, housing, energy, debt counselling, employment and related support), prepare to access it, follow up, and make informed decisions. The product must be useful even with AI disabled.
2. **Demonstrable technical depth:** Show advanced Data Analyst and Data Engineering competencies relevant to Australian financial institutions, particularly **advanced SQL, Tableau, advanced Excel, banking/economic datasets, statistical and financial analysis, financial forecasting and explainability, data warehousing, data quality/reconciliation, governance, cloud, stakeholder reporting, and professional engineering discipline**.

Neither goal may be reduced to decorative features. Financial modelling is a substantial core module, **not** a substitute for real charitable functionality; assistance discovery and outcomes must be functional, **not** a generic chatbot or collection of invented sample links.

### Product principles

- **Act before impressing:** Clearly support a real, next useful action; avoid inaccessible dashboards as the primary user experience.
- **Evidence before language:** Source-backed service/program details and explicit freshness/uncertainty; AI never decides eligibility or fabricates records.
- **Financial transparency:** Calculations have definitions, units, periods, sources, reconciliation and uncertainty. Forecasts are estimates, not advice.
- **Privacy by default:** Sensitive finances, hardship circumstances and service-contact logs are private, minimized, protected, deletable, and never placed in public analytics.
- **Accessible and inclusive:** Mobile-first, plain language, keyboard access, screen-reader semantics, low-bandwidth tolerance, language accommodation.
- **Incremental value:** Every milestone ends in an independently demonstrable, tested vertical slice.
- **Costs and local efficiency:** Work comfortably on an Apple Silicon MacBook Air (8 GB RAM). Prefer lightweight dev stacks and cheap/free API tiers that are **actually verified**.

### Non-goals / prohibited claims

- Do not claim to provide crisis dispatch, emergency monitoring, binding government entitlement/eligibility decisions, credit underwriting or personalised financial/investment advice.
- Do not claim food/bed/appointment availability unless a provider-confirmed timely source supports it.
- Do not hallucinate government programs, provider details, service operating hours, payment amounts or financial observations.
- Do not publish user transactions, contact logs, location-linked hardship data or identifiable records to GitHub, Tableau Public, public dashboards, third-party telemetry or an LLM by default.
- Do not build unnecessary microservices, unreviewed autonomous external actions or heavy local infrastructure for their own sake.

---

## 2. Primary users and validated journeys

**Users:** NSW residents and others in Australia who need practical assistance, including those with limited English, low digital literacy or reduced access to services; people seeking to understand finances; support workers/volunteers (future role); analysts reviewing synthetic or aggregated metrics.

**Core journey A — Immediate support:** Choose a need → give coarse location and urgency → see verified options with caveats → choose contact channel → prepare call/message/checklist → mark contacted → set follow-up → record outcome/alternative path.

**Core journey B — Financial wellbeing:** Opt-in private CSV upload or manual budget entry → validate and categorise transactions → show transparent cash-flow measures → model an uncertainty-aware scenario → suggest optional *categories* of potential support → let user choose if/what assistance to explore.

**Core journey C — Analyst/portfolio:** Reproduce ingestion of public APRA/RBA/ABS series → analyse lending/deposits/economic indicators → calculate financial KPIs via SQL → reconcile with Excel → publish synthetic/aggregated Tableau reports → inspect lineage, exceptions and business interpretation.

**Accessibility:** Implement WCAG 2.2 AA where reasonably applicable; test keyboard flows, input labels, focus management, contrast, error text and small screens. Never rely solely on AI conversation; provide browsable categories and direct links.

---

## 3. Technical architecture and technology requirements

Use a **modular monolith** and explicit module boundaries initially; start a queue or extra service only when justified by observed load or functionality.

**Frontend:** Next.js, TypeScript (strict), Tailwind CSS, shadcn/ui or accessible equivalent. Responsive and keyboard-operable, semantic HTML, reusable design tokens. Build a public help finder and a clearly separated private finance workspace.

**Backend:** Python 3.12+ (unless the environment needs a supported alternative), FastAPI, Pydantic, SQLAlchemy, Alembic, typed service layers, OpenAPI. Validate at boundary; structured errors; request timeouts; safe retries; appropriate rate limiting.

**Storage:** PostgreSQL for service provenance, private application data and financial warehouse (separated schemas/data access). Use raw/staging/curated layers, fact and dimension tables and versioned migrations. Prefer local file storage for sensitive uploads until appropriate secure storage exists.

**Data:** Python, Pandas, NumPy, SQL, Matplotlib; deterministic, idempotent ETL with source/version metadata. Use lightweight scheduling (CLI + cron/GitHub Actions where appropriate), not Airflow unless justified.

**ML:** Clear forecasting baselines first (naive/seasonal naive/rolling average), then statistical and scikit-learn/XGBoost approaches where justified. Use chronological holdout/rolling-origin evaluation, MAE/RMSE or appropriate domain metrics, error breakdown, SHAP for suitable trained models. Include model cards, data leakage tests and scenario-vs-forecast distinctions.

**AI:** LLM adapter with opt-in provider selection, optional local Ollama when feasible, structured response schemas, retrieved evidence IDs, citation validation, prompt-injection defenses and a deterministic no-AI fallback. Use RAG only when it adds value, not for arithmetic or eligibility rules. Avoid heavyweight local embeddings by default.

**BI:** Tableau Desktop/Public on macOS for analyst dashboards; documented calculated fields, FIXED LOD expressions, table calculations, parameters, filters and drill actions. Produce Tableau-compatible exports/extracts. **Do not claim a `.twb`/`.twbx` exists or works until created and opened/verified.** Tableau Public only uses non-identifying demo/aggregate data.

**Excel:** Actual advanced spreadsheet deliverables: PivotTables, XLOOKUP, SUMIFS, conditional formatting, validation/reconciliation; Power Query where feasible in a supported Excel environment. If tooling cannot author/verify a native feature, mark it as *manual verification required* and supply a reproducible guide; don't misrepresent an ordinary cell table as a PivotTable.

**Infrastructure:** GitHub Actions CI, `.env.example`, dependency lockfiles, low-cost AWS deployment as a later milestone with explicit cost limits and secrets. Don't make AWS a prerequisite for local progress.

### Reference repository layout (adapt to existing code)

```text
Daybreak/
├── AGENTS.md                         # discovery pointer for Codex
├── guidlines.md                      # this complete specification (intentional spelling)
├── README.md
├── apps/
│   ├── web/                          # Next.js, Agent 5
│   └── api/                          # FastAPI, Agent 4
├── packages/contracts/              # shared API contracts, Agent 0
├── data/
│   ├── pipelines/                   # Agent 1
│   ├── warehouse/                   # Agent 1
│   ├── quality/                     # Agents 1 and 7
│   └── samples/                     # synthetic/public only
├── integrations/assistance/          # Agent 3
├── ml/                               # Agent 2
├── analytics/
│   ├── sql/                          # Agent 1
│   ├── tableau/                      # Agent 6
│   └── excel/                        # Agent 6
├── infrastructure/                   # Agent 4
├── tests/                            # Agent 7 + implementers
├── docs/
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md
│   ├── DATA_DICTIONARY.md
│   ├── DATA_GOVERNANCE.md
│   ├── MODEL_EVALUATION.md
│   ├── API_SOURCES.md
│   ├── THREAT_MODEL.md
│   ├── decisions/                     # ADRs
│   └── milestones/                    # evidence & exit reports
└── .github/workflows/
```

---

## 4. Multi-agent organisation and ownership

**Agent 0 — Orchestrator / Technical Lead (one integrator):** Owns scope, architecture, contracts, issue breakdown, dependency graph, ADRs, release decisions, roadmap, PR integration. Must inspect current branch and changes; never assume another agent has succeeded.

**Agent 1 — Data Engineer / Advanced SQL:** Owns `data/pipelines`, `data/warehouse`, `analytics/sql`, ingestion, dimensional model, ETL, transformations, lineage, indexing, query plans, reconciliation. Works with Agent 4 on migrations/contracts.

**Agent 2 — Financial Analytics / ML:** Owns `ml/`, model experiments, cash-flow definitions, scenario logic, baselines, forecasting evaluation, anomaly detection, SHAP and model cards. Cannot invent user outcomes from macro datasets.

**Agent 3 — Assistance Integration:** Owns `integrations/assistance`, official source adapters, license review, program/source metadata, freshness and capacity disclaimers, provider fallbacks, deterministic source-aware matching.

**Agent 4 — Backend / Infrastructure / Security:** Owns `apps/api`, API auth, data isolation, storage, migrations coordination, secrets, cloud, threat model, operational resilience.

**Agent 5 — Frontend / UX / Accessibility:** Owns `apps/web`, plain-language flows, responsive views, help finder, local/private tracker, finance workspace, keyboard/AT tests.

**Agent 6 — BI / Stakeholder Reporting:** Owns `analytics/tableau`, `analytics/excel`, dashboards, analytical definitions, stakeholder summaries and SQL/Excel/Tableau reconciliation proof.

**Agent 7 — QA / Reliability / Independent Reviewer:** Owns testing strategy and integration/e2e regression; independently tests data correctness, failure paths, injection, accessibility, performance and no sensitive leaks. Test ownership is shared: implementers write unit tests; QA verifies.

### Delegation rules

- Roles are **logical specialisations**, not a claim that eight autonomous Codex processes can run. Use actual supported Codex subagent capabilities only if available; otherwise run role-specific tasks sequentially.
- On an 8 GB Mac, default to one active heavy process; at most two concurrent coding worktrees for independent tasks with stable interfaces.
- Every delegated task must define: objective, milestone/issue, owner, inputs, owned paths, interfaces, dependencies, acceptance criteria, tests, security/data concerns, branch and output report.
- No uncoordinated edits to shared contracts, migrations, secrets, CI or root dependencies. Agent 0 approves contract/schema changes first.
- Agents work on feature branches or isolated worktrees. Never concurrently edit one working tree. Merge only after independent tests and conflict resolution.
- Stop delegation if tests fail or repository state is dirty/uncertain; diagnose before creating more changes.

---

## 5. Authoritative data sources and integration policy

### Charity and assistance integrations

**Investigate** (don't assume API access):

- **Infoxchange Service Directory / Ask Izzy:** best candidate for real community service coverage. API/widget may need approval, commercial terms or explicit licence. If unavailable, show a clearly labelled official link-out rather than scraping against terms.
- **Services Australia**, **Service NSW**, and relevant Australian/NSW departments: authoritative program and assistance pages. Confirm official link, current conditions, and whether a public machine-readable API exists.
- **OpenStreetMap / Overpass:** may locate mapped community resources; volunteer maintained, incomplete and **not** proof of open-now, active operations, available food or vacancies. Follow rate limits and attribution/licensing.
- **data.gov.au / state open-data portals:** datasets and catalogues, not a live assistance eligibility API.
- **Third-party program search APIs:** assess ownership, maintenance, docs, terms, coverage and accuracy; verify each surfaced program using its actual official source. Never silently substitute a third-party source for governmental authority.

### Financial/economic public datasets

- APRA public aggregate banking statistics (loans, deposits, institution level as available).
- RBA published statistical series and releases.
- ABS published statistical series and data APIs.
- Explicitly label currency, unit, date convention, revisions, granularity, frequency, and scope of every series. Avoid mixing stocks and flows or assigning group-level statistics to individuals.
- Keep real public observations, user-provided financial records, and synthetic samples in separate namespaces/tables and UI indicators.

### Provider integration contract

Every integration must expose a normalized typed schema with `provider_id`, `source_url`, `retrieved_at`, `source_updated_at` if known, `license/attribution`, `jurisdiction`, `coverage`, `status`, `confidence_provenance` (evidence, not an invented AI probability), and structured response errors. Service records separately include `last_verified_at`, `eligibility_status`, `capacity_status`, supported languages/accessibility fields if evidenced, and explicit missingness.

- `source_verified` means the referenced source was checked; it **does not** imply user eligibility or provider capacity.
- `eligibility_requires_confirmation` is default for complex/incomplete rules.
- `capacity_unknown` is default unless supported by a provider-confirmed, timely feed.
- If a source becomes stale or materially changes, block unsupported specific claims and flag human review.
- Graceful error state, link to official source, and honest timestamp for all failures.

---

## 6. Financial analytics and modelling — required depth

Implement a well-defined financial data pipeline and reproducible analytics **as a real core capability**, with an optional private user financial-health module.

### 6.1 Warehouse

Use raw → staging → curated/marts. At minimum:

- Dimensions: time, institution, financial indicator/series, data source, assistance category, region (only if aggregated), and relevant record/version metadata.
- Facts: public bank/indicator observations, model forecasts/scenarios (separately), quality checks, de-identified aggregate assistance outcomes.
- Private user budget/transaction domain is isolated from public warehouse; never expose granular user events to public BI.
- Versioned source revisions, row counts and ingestion logs; idempotent upserts and partitioning/indexes only where justified.

### 6.2 SQL demonstrables

Produce **working**, documented examples of joins, anti-joins, subqueries, multi-CTE queries, `ROW_NUMBER`, `LAG`, rolling windows, cohort/period comparisons, reconciliation joins, materialized views when justified, `EXPLAIN (ANALYZE, BUFFERS)` analysis and at least one measured optimisation with before/after results on reproducible data. Do not invent performance numbers.

### 6.3 Financial metrics

Define formulas with unit tests: monthly net cash flow, expense-to-income ratio, recurring expenditure, runway/emergency buffer (with assumptions), budget variances, lending/deposit growth, contribution/share and rolling measures. Distinguish gross/net income and nominal/real when used. Avoid suggesting a person's budget reveals objective eligibility.

### 6.4 Forecasts and scenarios

- Separate deterministic **what-if simulations** (user-adjusted rent, income, energy, rates) from predictive model forecasts.
- Backtest on time-ordered data; naive and seasonal naive baselines required; compare ML only if sufficient sample and demonstrable gain.
- Report MAE/RMSE (as appropriate), sample size, horizon, intervals or scenario ranges, assumptions and known limitations.
- No leakage, random train/test split for time series, claiming point forecasts are facts, or presenting uncalibrated confidence percentages.
- Reproducible seeds/versioned configurations and model cards. A non-ML baseline can be the honest production choice.

### 6.5 AI analytical assistant

Can explain **validated** SQL results, perform grounded report summarization, and translate technical KPIs into plain English with source/period references. Cannot fabricate rows, run unrestricted SQL, or silently change financial calculations. If text-to-SQL is implemented, use allowlisted read-only views, query limits, parsing/validation, row caps and query timeouts.

---

## 7. Tableau, Excel, and communication deliverables

### Tableau

Build and manually verify **five analyst-facing views**:

1. Financial Wellbeing Overview (synthetic/aggregated demo data only)
2. Income, Spending and Cash-Flow Patterns
3. Australian Banking & Economic Indicators
4. Community Assistance Access & Outcomes (opt-in aggregated/synthetic only)
5. Data Quality, Governance & Exceptions

Show calculated fields, FIXED LOD, table calculations, parameters, filters/actions, clear denominators, date range and sourced KPI definitions. Provide data extracts, documented formulas and screenshots/real workbook when practical. Don't promise programmatic Tableau workbook creation if tooling lacks it. **No real user-level data in Tableau Public.**

### Excel

Create a verified workbook demonstrating PivotTables, XLOOKUP, SUMIFS, date/formula logic, data quality/reconciliation and exceptions. Document Power Query steps and verify in desktop Excel if supported. Data source must align with SQL extracts. Provide cell-level tests or independently calculated expected totals; mark any untested features explicitly.

### Stakeholder output

One-page monthly executive insight template with KPI movements, anomalies, explanation, action, evidence, caveats and validation status. Separate observed data from projections and impact claims.

---

## 8. Safety, privacy, and reliability engineering

### User protections

- Do not require financial statements or full address for basic help discovery; coarse location should suffice.
- No personal data to external model APIs by default; consent must be explicit, granular and revocable if implemented.
- Do not expose user hardship details via logs, errors, analytics, URL query strings or public caches.
- Allow export/delete of private trackers and uploaded financial records; define retention policies and secure storage.
- Secure authentication/authorization if accounts are added; enforce tenant-level access checks in queries and tests.
- Use synthetic or suitably aggregated, privacy-reviewed analytics only in public outputs.
- Provide clear emergency referral and professional financial counselling routes without implying Daybreak provides those services.

### AI guardrails

- Separate deterministic program/financial calculations from LLM prose.
- Retrieve source records from allowlisted providers and attach source IDs to every service claim.
- Validate generated record references; reject new fabricated program IDs, payment amounts, invented contacts or unverifiable eligibility statements.
- Treat retrieved content as untrusted; test prompt injection, tool-output manipulation and multilingual adversarial cases.
- Human-reviewed communication drafts; never automatically contact providers or submit forms unless explicitly authorised by the user in the actual UI.
- Provide a no-AI fallback and explain uncertainty transparently.

### Failure scenarios to test

API unavailable; empty search; stale results; changed rule; wrong region; bad CSV encoding/format; transaction duplicates; inconsistent currencies; missing months; SQL migration failure; forecast insufficient data; LLM error/timeouts; source prompt injection; auth bypass attempt; privacy export/delete; offline/restricted bandwidth; accessibility/keyboard regressions.

### Security and operations

Use lockfiles and dependency checks, `.env.example` with fake values, secrets in environment/secret manager, HTTPS in deployment, least privilege DB roles, safe migrations, rate limiting and timeouts. No production credentials in samples. Maintain `docs/THREAT_MODEL.md` with threat actors, trust boundaries, mitigations and residual risks. Monitor errors without leaking sensitive content.

---

## 9. Milestones, dependencies, and exit criteria

**Milestone completion requires tested functionality, relevant documentation, independent review, and a verified Git commit.** File creation alone never counts. Each milestone has a deliverable, test gate and linked issues.

### M1 — Foundation & contracts

**Owner:** Agent 0; Agents 4, 5, 7.  
Deliver: monorepo, web/API health checks, PostgreSQL connection, migration baseline, CI (lint/tests/typecheck), env examples, documented core schemas, accessibility baseline, seed synthetic demo.  
**Exit:** fresh clone setup works; tests and CI pass; no secrets; two communicating services; architecture and ADRs recorded.

### M2 — Real data & advanced SQL warehouse

**Owner:** Agent 1; QA 7.  
Deliver: reproducible ingestion of selected real APRA/RBA/ABS source series; raw/staging/marts; documented star schema; CTE/windows queries; data dictionary, provenance, reconciliation and exception reports.  
**Exit:** repeated ETL is idempotent; known expected aggregates reconcile; errors handled; advanced SQL tests pass; real source links and dates recorded.

### M3 — Financial KPIs & scenario engine

**Owner:** Agents 1, 2, 6.  
Deliver: verified KPIs, budget inputs/synthetic transactions, private financial overview, deterministic what-if calculator, model-independent interpretation.  
**Exit:** KPI unit tests pass across edge cases; SQL/Python figures reconcile; data isolation tested; users can interpret scenario assumptions.

### M4 — Charitable service integration & first useful user journey

**Owner:** Agents 3, 4, 5; QA 7.  
Deliver: source registry and verified/link-out integration; accessible search, categories, location/urgency, service detail/next action; no-source state.  
**Exit:** one real permitted source integration or clearly labelled authorised link-out works; provenance and unknown-capacity labels correct; error/empty/staleness tests pass; first useful action demonstrable.

### M5 — Tableau, advanced Excel & analyst reporting

**Owner:** Agent 6; Agents 1, 7.  
Deliver: verified Tableau workbook/views or documented manual build with reproducible extracts; real advanced Excel/Pivot/XLOOKUP exercises and SQL reconciliation; executive reporting.  
**Exit:** documented workbook opens and computes correct figures; independent SQL/Excel/Tableau totals agree; no identifiable user data in public outputs; BI skills demonstrable.

### M6 — Financial ML & explainability

**Owner:** Agent 2; QA 7.  
Deliver: baselines, time-series backtest, appropriate ML candidate, anomaly detection, SHAP where appropriate, model cards and repeatable notebooks/scripts.  
**Exit:** leakage checks pass, baselines reported, justified modelling choice, errors/limitations visible; no invented accuracy metrics.

### M7 — Grounded AI & action workflows

**Owner:** Agents 2, 3, 4, 5; QA 7.  
Deliver: evidence-grounded assistance/finance explanations, citation validators, user-reviewed drafts, document checklist, private journey tracker, optional multilingual UI.  
**Exit:** hallucination/eligibility and prompt-injection cases pass target evaluation; users can complete contact and follow-up journey; AI outage does not break service discovery.

### M8 — Security, accessibility & deployment

**Owner:** Agents 4, 5, 7.  
Deliver: auth/privacy hardening, observability, performance profiles, WCAG checks, AWS deployment or honest reproducible deployment plan, cost controls and disaster recovery.  
**Exit:** e2e, security, authorization, accessibility and failure-mode suites pass; secrets safe; runbook and rollback tested.

### M9 — Human pilot, social impact validation & portfolio

**Owner:** Agent 0; Agents 5, 6, 7.  
Deliver: realistic usability study (consenting participants or synthetic moderated tests as appropriate), feedback, opt-in anonymous outcomes, demo, architecture presentation, reproducible analyst portfolio artifacts.  
**Exit:** real test results and limitations documented; impact claims not inflated; installation and demo reproducible from clean environment.

### Milestone critical path

`M1 → M2 → M3 → M5`, `M1 → M4 → M7`, and `M3 → M6 → M7`; `M8` requires functional product flows; `M9` requires M8. Frontend visual work and data ingestion may run in parallel only after API contracts are stable.

### Portfolio skill-to-evidence map

| Resume gap / target | Concrete evidence |
|---|---|
| Tableau | Real workbook, calculations, LOD, parameters, screenshots and data extracts |
| Excel | Verified PivotTables, XLOOKUP, reconciliation and documented Power Query |
| Advanced SQL | CTE/window queries, tests, EXPLAIN plans, optimisation measurements |
| Financial modelling | Metric dictionary, scenarios, chronological backtests and model cards |
| Banking domain | APRA/RBA/ABS trends with verified units, periods, assumptions |
| Warehousing | Star schema, ingestion, transformations, documented lineage |
| Data quality/governance | Reconciliation reports, QA checks, exception dashboard, access controls |
| Stakeholder communication | Executive insight report and accessible product narratives |
| Cloud and Agile | AWS deployment documentation, GitHub issues/PRs, CI evidence |
| Responsible AI | Citations, source validation, prompt-injection tests, grounded summaries |

---

## 10. GitHub delivery protocol (mandatory)

Remote: `https://github.com/Anandkripal/Daybreak`.

1. **Before editing:** `git status`, branch, remotes; inspect existing structure, tests and docs. Do not overwrite unrelated work.
2. **Planning:** create milestone issues and small task issues; describe requirements and done conditions, plus assigned logical agent role.
3. **Branching:** feature branches (`feat/m2-apra-ingest`, `fix/source-freshness`); isolated worktrees for parallel work; avoid two agents editing same files.
4. **Build:** small vertical slices; add unit/integration tests; update documentation and provenance.
5. **Verify:** run available format, lint, type check, unit, integration, data quality, privacy/security and accessibility checks as applicable. Save real logs/results.
6. **Commit:** atomic conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`); exclude secrets/real personal data; confirm `git diff --cached`.
7. **Push:** **push to remote after each completed tested slice** if authenticated. Prefer PRs for substantive changes. Do not force push or auto-merge without explicit project owner direction. Never say pushed unless command/API confirms.
8. **Review:** QA independently tests; verify contracts, evidence, data privacy and PR status. Only merge after gate passes and authorisation/policy permits.
9. **Update:** `docs/ROADMAP.md`, changelog if present, decision records, setup commands and milestone status.
10. **Report:** branch, commit SHA, PR URL if any, tests with results, data/AI limitations, deployment impact, user value, next issue.

If GitHub push is not permitted, do **not** bypass permissions. Leave clean local changes and clearly tell the owner what permission/authentication or commands are needed. GitHub updates only occur during active agent execution with valid access; no unattended recurring pushes are implied.

---

## 11. Mandatory quality gates and release standards

### For every PR

- [ ] Meets issue acceptance criteria and improves a demonstrable user or analyst workflow.
- [ ] Type checking, linting, unit tests and applicable integration tests pass (actual output recorded).
- [ ] Error handling, empty states, validation and source attribution tested.
- [ ] No keys, PII or sensitive transaction data in source, fixtures, exports, screenshots, logs or public dashboards.
- [ ] API/schema changes documented, versioned and contract-tested.
- [ ] Data transformations, formulas and forecasts have automated correctness checks.
- [ ] Accessibility: keyboard traversal, labels, contrast, responsive layout.
- [ ] Threat model reviewed if trust boundary or data collection changed.
- [ ] Documentation, README and roadmap reflect actual status.
- [ ] Independent QA review for significant features.

### Quantitative targets (engineering goals, not achieved claims)

- 100% of specific assistance recommendations must link to a genuine documented source.
- Zero fabricated providers or payment amounts in curated evaluation cases.
- Zero unsupported definitive eligibility or live-capacity claims in evaluation cases.
- 100% of published financial KPI metrics must have documented definition, unit and source/period.
- SQL and Excel/Tableau aggregate reconciliation must match specified numerical tolerances on frozen fixtures.
- Zero sensitive personal rows in public BI exports.
- Key end-to-end support journey works without an LLM.

Avoid claiming statistical guarantees based only on small test samples. Record test cases, timestamps and observed rates.

---

## 12. Start-of-session and end-of-task instructions for Codex

### At the start of every session

1. Read `AGENTS.md`, **this entire `guidlines.md`**, `README.md`, `docs/ROADMAP.md` and relevant module docs.
2. Inspect `git status`, current branch, remote and recent commits; confirm repository permissions before planning pushes.
3. Identify the highest-priority unblocked task based on milestone critical path.
4. State task owner role(s), owned files, dependencies, implementation plan and test criteria in a brief task note.
5. Implement the smallest valuable working slice rather than creating many empty files.

### At completion of each task

Report exactly:

```text
Milestone / issue:
Agent role(s):
User or analyst outcome delivered:
Files and API/schema changes:
Tests run (commands and results):
Source/data provenance and privacy checks:
Known limitations or pending human verification:
Branch / commit SHA / PR:
Remote push status (verified or blocked):
Next recommended task:
```

### First execution prompt (M1)

> Inspect the Daybreak repository and read `guidlines.md` in full. Act as Agent 0 and coordinate logical Agents 4, 5 and 7 to execute M1 only. Preserve any existing work, create `AGENTS.md` pointing to `guidlines.md` if absent, and create architecture/roadmap/ADR documents. Scaffold a minimal but functioning Next.js + FastAPI + PostgreSQL baseline with health checks, one cross-service API call, typed contracts, first migration, CI and tests. Use synthetic sample data and avoid speculative live integrations. Run checks, commit tested increments, push to GitHub when access permits, and report verified outcomes. Do not mark M1 done unless a fresh clone can run using documented commands. Prepare the M2 issue plan; don't claim M2 is implemented.

---

## 13. Change control and conflicts

- The project owner can revise scope; if instructions conflict, explain the contradiction briefly and follow the latest explicit instruction.
- Do not quietly delete social-impact functionality to strengthen modelling, or quietly omit financial/BI deliverables to rush the charity UI.
- Prefer documented trade-offs to overengineering. If data is unavailable or permissions are blocked, implement a truthful fallback and record the limitation.
- Never convert an unverified plan into a claim of released functionality.

**Bottom line:** Daybreak must become a *genuinely helpful product* with a *reproducible banking-grade analytics backbone*. Prioritise proven correctness, clear evidence, and completed user outcomes over feature count.
