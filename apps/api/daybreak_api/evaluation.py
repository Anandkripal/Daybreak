"""Retrospective, one-step baseline evaluation of monthly public rates."""
import json
import math
from datetime import date
from decimal import Decimal

from sqlalchemy import text
from daybreak_api.database import get_engine


def evaluate(rows: list[tuple[date, Decimal]], holdout: int = 12) -> dict:
    if type(holdout) is not int or holdout < 1 or len(rows) < holdout + 12:
        raise ValueError("Need twelve preceding observations plus the holdout")
    if any(not value.is_finite() or not math.isfinite(float(value)) for _, value in rows):
        raise ValueError("Observations must be finite representable numbers")
    for i in range(1, len(rows)):
        prev, current = rows[i - 1][0], rows[i][0]
        if current.year * 12 + current.month != prev.year * 12 + prev.month + 1:
            raise ValueError("Periods must be ordered and consecutive months")
    errors: dict[str, list[float]] = {"naive": [], "seasonal_naive": []}
    predictions = []
    for i in range(len(rows) - holdout, len(rows)):
        actual = rows[i][1]
        predictions.append({"period": rows[i][0].isoformat(),
                            "training_end": rows[i - 1][0].isoformat(),
                            "actual": str(actual), "naive": str(rows[i - 1][1]),
                            "seasonal_naive": str(rows[i - 12][1])})
        errors["naive"].append(float(actual - rows[i - 1][1]))
        errors["seasonal_naive"].append(float(actual - rows[i - 12][1]))
    if any(not math.isfinite(x) or not math.isfinite(x * x)
           for values in errors.values() for x in values):
        raise ValueError("Errors exceed supported numeric range")
    scores = {name: {"mae_pp": sum(abs(x) for x in values) / len(values),
                     "rmse_pp": math.sqrt(sum(x * x for x in values) / len(values))}
              for name, values in errors.items()}
    return {"series_id": "FILRSAVR", "horizon_months": 1, "holdout_observations": holdout,
            "holdout_start": rows[-holdout][0].isoformat(), "holdout_end": rows[-1][0].isoformat(),
            "unit": "percentage points", "scores": scores, "predictions": predictions,
            "training_observations_initial": len(rows) - holdout,
            "limitations": "Retrospective evaluation on historical revised observations, not a current forecast. "
                           "Later revisions may have been unavailable at prediction time."}


def main() -> None:
    engine = get_engine()
    try:
        with engine.connect() as connection:
            rows = connection.execute(text(
                "SELECT period, value, snapshot_sha256, source_url, retrieved_at "
                "FROM public_analytics.latest_rate WHERE series_id = 'FILRSAVR' ORDER BY period"
            )).all()
        result = evaluate([(row.period, row.value) for row in rows])
        result["provenance"] = {"snapshot_sha256": rows[0].snapshot_sha256,
                                "source_url": rows[0].source_url,
                                "retrieved_at": rows[0].retrieved_at.isoformat()}
        print(json.dumps(result, indent=2, allow_nan=False))
    finally:
        engine.dispose()


if __name__ == "__main__":
    main()
