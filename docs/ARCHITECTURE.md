# Architecture

Daybreak starts as a modular monolith: a Next.js web application calls a FastAPI service, with PostgreSQL for persistent application data. This foundation does not yet implement accounts, assistance discovery, financial uploads, analytics or AI. The public help journey and private finance workspace will be separated as they are built. See [ADR 0001](decisions/0001-foundation.md).

## Boundaries

- Web renders the service health response and handles an unavailable API without exposing sensitive details.
- API owns validation and database access. Health indicates process availability; database readiness must be reported separately and never inferred from process health.
- PostgreSQL holds only synthetic baseline data at this stage. Future private records and public analytical data require separated access and governance before collection.
- The [health contract](../packages/contracts/health.md) is the initial cross-service interface. Changes require coordinated consumer and provider tests.

No user financial or hardship information is needed for health checks. Do not put secrets or real personal records into fixtures, logs, URLs or public analytics.
