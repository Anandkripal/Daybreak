# Private browser workspace: implemented boundaries

No account or server persistence exists for the contact tracker, budget or transaction CSV workspace. Personal input stays in page memory; no external model, analytics, fetch call, cookie, local/session storage or URL carries it. The web server serves public application assets. An explicit external-source link navigates to another organisation whose privacy practices apply.

Browser extensions, compromised devices, shoulder surfing and browser history/session restoration can expose page state. Explicit delete controls clear the current app state, not operating-system memory, browser internals, source CSVs or downloaded exports. Do not promise secure forensic erasure. Export is user-triggered and contains private data; users control subsequent storage and deletion. No user-level data is sent to public BI.

CSV parsing is capped at 1 MB/5000 rows, validates exact dates and bounded non-negative decimal amounts, rejects unknown currencies and duplicate normalized rows, and renders only React text. Monthly export values are generated from validated dates and numbers, not arbitrary spreadsheet formulas. Async import generation guards prevent late results from undoing deletion. The contact export uses JSON rather than spreadsheet execution semantics.

Validation uses synthetic fixtures only. The browser suite checks a sentinel is absent from request URLs/bodies, browser storage is empty, exported notes are correct, controls work by keyboard, focus recovers after deletion and narrow screens have no page overflow. These checks are scoped evidence, not a guarantee against malicious browsers/extensions or a manual screen-reader audit.

Dependency audit on 2026-11-15: seven moderate dev-tool findings trace to minimatch in typescript-eslint (GHSA-g3hv-75wg-m249). A compatible `npm audit fix --dry-run` selected zero changes and retained all findings. No forced major override was applied. These concern lint tooling; monitor upstream compatible releases. No high/critical findings were reported in this audit.
