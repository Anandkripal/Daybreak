"""Integration tests require a disposable PostgreSQL database in DATABASE_TEST_URL."""

import os
import subprocess
from pathlib import Path

import pytest
from sqlalchemy import create_engine, text

API_ROOT = Path(__file__).resolve().parents[1]


@pytest.mark.skipif(not os.environ.get("DATABASE_TEST_URL"), reason="DATABASE_TEST_URL not set")
def test_migration_and_readiness(monkeypatch) -> None:
    from fastapi.testclient import TestClient
    from daybreak_api.database import get_engine
    from daybreak_api.main import app

    url = os.environ["DATABASE_TEST_URL"]
    env = {**os.environ, "DATABASE_URL": url}
    subprocess.run(["alembic", "upgrade", "head"], cwd=API_ROOT, env=env, check=True)
    engine = create_engine(url)
    try:
        with engine.connect() as connection:
            assert connection.execute(text("SELECT count(*) FROM synthetic_demo_category")).scalar_one() == 2
        # Repeated upgrades must not duplicate seed data.
        subprocess.run(["alembic", "upgrade", "head"], cwd=API_ROOT, env=env, check=True)
        with engine.connect() as connection:
            assert connection.execute(text("SELECT count(*) FROM synthetic_demo_category")).scalar_one() == 2
        monkeypatch.setenv("DATABASE_URL", url)
        get_engine.cache_clear()
        assert TestClient(app).get("/ready").json() == {"status": "ok"}
    finally:
        get_engine.cache_clear()
        engine.dispose()
        subprocess.run(["alembic", "downgrade", "base"], cwd=API_ROOT, env=env, check=True)
