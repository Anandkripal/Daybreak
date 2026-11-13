from datetime import datetime, timezone
from decimal import Decimal

import pytest
from daybreak_api.rba_ingest import parse, ingest


def sample(value="6.00"):
    return ("F5\nFrequency,Monthly\nUnits,Per cent per annum\n"
            "Source,RBA; Securitisation System\nSeries ID,FILRSAVR\n"
            f"31-Jan-2024,5.00\n29-Feb-2024,{value}\n").encode()


def test_parse_and_reject_invalid_sources():
    rows = parse(sample())
    assert [value for _, value in rows] == [Decimal("5"), Decimal("6")]
    with pytest.raises(ValueError):
        parse(sample().replace(b"Securitisation System", b"Other"))
    with pytest.raises(ValueError):
        parse(sample("NaN"))
    with pytest.raises(ValueError):
        parse(sample() + b"29-Feb-2024,7\n")


def test_postgres_snapshots_and_revisions():
    import os
    from sqlalchemy import create_engine, text
    if not os.getenv("DATABASE_TEST_URL"):
        pytest.skip("DATABASE_TEST_URL not set")
    engine = create_engine(os.environ["DATABASE_TEST_URL"])
    try:
        # Existing migration test can run independently; this test owns its own schema lifecycle.
        from alembic.config import Config
        from alembic import command
        import os as os_module
        os_module.environ["DATABASE_URL"] = os_module.environ["DATABASE_TEST_URL"]
        command.upgrade(Config("alembic.ini"), "head")
        now = datetime(2024, 3, 1, tzinfo=timezone.utc)
        assert ingest(engine, sample(), now) == 2
        assert ingest(engine, sample(), now) == 2
        assert ingest(engine, sample("7"), datetime(2024, 4, 1, tzinfo=timezone.utc)) == 2
        with engine.connect() as c:
            assert c.execute(text("SELECT count(*) FROM public_analytics.snapshot")).scalar_one() == 2
            result = c.execute(text("SELECT value, change_pp FROM public_analytics.latest_rate ORDER BY period")).all()
            assert result == [(Decimal("5"), None), (Decimal("7"), Decimal("2"))]
        reduced = sample().replace(b"29-Feb-2024,6.00\n", b"")
        ingest(engine, reduced, datetime(2024, 5, 1, tzinfo=timezone.utc))
        with engine.connect() as c:
            assert c.execute(text("SELECT count(*) FROM public_analytics.latest_rate")).scalar_one() == 1
        ingest(engine, sample(), datetime(2024, 6, 1, tzinfo=timezone.utc))
        with engine.connect() as c:
            assert c.execute(text("SELECT value FROM public_analytics.latest_rate ORDER BY period DESC LIMIT 1")).scalar_one() == Decimal("6")
    finally:
        engine.dispose()
        command.downgrade(Config("alembic.ini"), "base")
