# Daybreak API

Python 3.12 and PostgreSQL are required. From this directory:

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://daybreak:daybreak@localhost:5432/daybreak'
alembic upgrade head
uvicorn daybreak_api.main:app --reload
```

The database and role must already exist. Replace the example local-only credentials as appropriate. `GET /health` is a database-independent liveness endpoint returning `{"status":"ok"}`; `GET /ready` checks a database connection and returns HTTP 503 with a generic error if unavailable. OpenAPI is available at `/docs`. The baseline migration contains only two labelled synthetic example categories; they are not real providers or assistance offers. No user information is collected.

Run `pytest -q` for unit tests. To also exercise migration, seed idempotency and readiness against PostgreSQL, set `DATABASE_TEST_URL` to a **disposable empty database** using the same driver URL format before running tests. The integration test migrates and then downgrades that database; never point it at a database containing data. Run `ruff check .` and `mypy daybreak_api` for static checks. The lockfile is generated with pip-tools from `requirements.in`; regenerate using `pip-compile requirements.in` when changing dependencies.

The optional public RBA F5 historical-series ingestion is documented in [the M2 source note](../../docs/milestones/m2-rba.md). It requires the migrations and a PostgreSQL database; it does not ingest private financial records.
