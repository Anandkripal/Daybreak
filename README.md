# Daybreak

Daybreak is an Australia-first financial wellbeing and community assistance project. The help page links to external assistance starting points. A browser-only budget tool compares user-entered monthly figures without storing or submitting them. Integrated service search, financial advice, accounts and AI are not implemented. See the [roadmap](docs/ROADMAP.md) and [engineering guidelines](guidlines.md).

## Local setup

Prerequisites: Node.js 24, Python 3.12, and PostgreSQL. Create a local PostgreSQL database and role. The example below uses `daybreak` as both the local role and database and `daybreak` as a development-only password; never reuse these credentials outside a disposable local environment. PostgreSQL must already be running. With a local PostgreSQL administrator account, one way to provision these is:

```sh
psql postgres -c "CREATE ROLE daybreak LOGIN PASSWORD 'daybreak';"
createdb -O daybreak daybreak
```

Use your PostgreSQL administrator connection options if needed; skip creation if the role or database already exists.

In one terminal:

```sh
cd apps/api
python3.12 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://daybreak:daybreak@localhost:5432/daybreak'
alembic upgrade head
uvicorn daybreak_api.main:app --reload
```

In another terminal:

```sh
cd apps/web
npm ci
npm run dev
```

Open http://localhost:3000. The help page works without the API. The web server health endpoint is separate; see [web setup](apps/web/README.md) for API configuration. API `/health` reports process health and `/ready` checks the database connection. The example migration contains only synthetic category labels, not real service listings.

## Checks

For API lint, types and tests see [API setup](apps/api/README.md). Its PostgreSQL integration test **downgrades the database** and must only target a disposable empty database. For web lint, types, tests and build see [web setup](apps/web/README.md). CI runs these checks with a disposable PostgreSQL service. Hosted CI passes for the documented commits; manual accessibility verification remains outstanding; consult the [M1 task note](docs/milestones/m1-task.md) for the gate.
