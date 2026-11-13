"""API entry point. Health is liveness; readiness includes the database."""

from typing import Literal

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from daybreak_api.database import get_engine


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"


app = FastAPI(title="Daybreak API", version="0.1.0")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.get("/ready", responses={503: {"description": "Database unavailable"}})
def ready() -> JSONResponse:
    try:
        with get_engine().connect() as connection:
            connection.execute(text("SELECT 1"))
    except (RuntimeError, ValueError, SQLAlchemyError):
        # Do not expose connection details or credentials to clients.
        return JSONResponse(status_code=503, content={"status": "unavailable"})
    return JSONResponse(content={"status": "ok"})
