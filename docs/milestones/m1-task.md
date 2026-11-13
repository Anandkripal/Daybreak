# M1 task note

Issue: https://github.com/Anandkripal/Daybreak/issues/1

Agent 0 owns contracts, root documentation, CI and integration. Agent 4 owns `apps/api`; Agent 5 owns `apps/web`. Their independent branches use the v1 health contract and must not edit shared files. Agent 7 independently reviews the integrated result. PostgreSQL and the web-to-API call depend on the provider contract; M2 is planning only until M1 exits.

Acceptance evidence must include actual lint, type, unit and integration results, migrations against PostgreSQL, a web-to-API request, keyboard/accessibility checks, secrets review, fresh-clone setup, CI and independent review. Record unavailable checks as pending, not passed. Synthetic data only; no live provider or financial claims.
