from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from daybreak_api.main import app

client = TestClient(app)


def test_health_contract() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert app.openapi()["paths"]["/health"]["get"]["responses"]["200"]


def test_readiness_hides_connection_failure(monkeypatch) -> None:
    def failing_engine():
        raise OperationalError("secret statement", {}, Exception("secret details"))

    monkeypatch.setattr("daybreak_api.main.get_engine", failing_engine)
    response = client.get("/ready")
    assert response.status_code == 503
    assert response.json() == {"status": "unavailable"}
    assert "secret" not in response.text


def test_readiness_without_configuration(monkeypatch) -> None:
    from daybreak_api.database import get_engine

    monkeypatch.delenv("DATABASE_URL", raising=False)
    get_engine.cache_clear()
    try:
        response = client.get("/ready")
        assert response.status_code == 503
    finally:
        get_engine.cache_clear()
