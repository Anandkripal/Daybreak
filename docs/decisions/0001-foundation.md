# ADR 0001: Modular foundation and explicit health contract

Status: accepted for M1.

A Next.js frontend and FastAPI backend communicate over HTTP, with PostgreSQL and versioned Alembic migrations. A simple process health endpoint allows a useful cross-service integration without collecting personal information. Database readiness is a separate concern: a running process is not proof that PostgreSQL is reachable. The architecture avoids separate services for future analytics and AI until real needs justify them.

Consequences: API changes require contract and consumer verification. Local development needs Node, Python and PostgreSQL; container-based database setup is optional where available. Authentication, privacy-sensitive storage and production deployment are not implied by this baseline.
