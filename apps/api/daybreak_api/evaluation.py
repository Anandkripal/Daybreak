"""Retrospective, one-step baseline evaluation of monthly public rates."""
import json
import math
from datetime import date
from decimal import Decimal

from sqlalchemy import text
from daybreak_api.database import get_engine


def evaluate(rows: list[tuple[date, Decimal]], holdout: int = 12) -> dict:
    if holdout < 1 or len(rows) < holdout + 12:
        raise ValueError("Need twelve preceding observations plus the holdout")
    for i in range(1, len(rows)):
        prev, current = rows[i - 1][0], rows[i][0]
        if current.year * 12 + current.month != prev.year * 12 + prev.month + 1:
            raise ValueError("Periods must be ordered and consecutive months")
    errors: dict[str, list[float]] = {"naive": [], "seasonal_naive": []}
    for i in range(len(rows) - holdout, len(rows)):
        actual = rows[i][1]
        errors["naive"].append(float(actual - rows[i - 1][1]))
        errors["seasonal_naive"].append(float(actual - rows[i - 12][1]))
    scores = {name: {"mae_pp": sum(abs(x) for x in values) / len(values),
                     "rmse_pp": math.sqrt(sum(x * x for x in values) / len(values))}
              for name, values in errors.items()}
    return {"series_id": "FILRSAVR", "horizon_months": 1, "holdout_observations": holdout,
            "holdout_start": rows[-holdout][0].isoformat(), "holdout_end": rows[-1][0].isoformat(),
            "unit": "percentage points", "scores": scores,
            "limitations": "Retrospective evaluation on historical revised observations, not a current forecast. "
                           "Later revisions may have been unavailable at prediction time."}


def main() -> None:
    engine = get_engine()
    with engine.connect() as connection:
        rows = connection.execute(text("SELECT period, value FROM public_analytics.latest_rate ORDER BY period")).all()
    print(json.dumps(evaluate([(row.period, row.value) for row in rows]), indent=2))


if __name__ == "__main__":
    main()
