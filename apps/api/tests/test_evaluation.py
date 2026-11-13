from datetime import date
from decimal import Decimal

import pytest
from daybreak_api.evaluation import evaluate


def months(n):
    return [(date(2020 + i // 12, i % 12 + 1, 1), Decimal(i)) for i in range(n)]


def test_chronological_baselines_have_known_errors():
    result = evaluate(months(24), 12)
    assert result["scores"]["naive"] == {"mae_pp": 1.0, "rmse_pp": 1.0}
    assert result["scores"]["seasonal_naive"] == {"mae_pp": 12.0, "rmse_pp": 12.0}
    assert result["holdout_start"] == "2021-01-01"


def test_rejects_insufficient_or_missing_months():
    with pytest.raises(ValueError):
        evaluate(months(23), 12)
    rows = months(25)
    del rows[3]
    with pytest.raises(ValueError):
        evaluate(rows, 12)


@pytest.mark.parametrize("value", ["NaN", "Infinity", "-Infinity", "1e999"])
def test_rejects_nonfinite_values(value):
    rows = months(24)
    rows[0] = (rows[0][0], Decimal(value))
    with pytest.raises(ValueError, match="finite"):
        evaluate(rows)


@pytest.mark.parametrize("holdout", [True, 1.5, 0, -1])
def test_rejects_invalid_holdout(holdout):
    with pytest.raises(ValueError):
        evaluate(months(24), holdout)


def test_future_changes_cannot_alter_earlier_predictions():
    rows = months(26)
    original = evaluate(rows)["predictions"]
    rows[-1] = (rows[-1][0], Decimal("999"))
    changed = evaluate(rows)["predictions"]
    assert original[:-1] == changed[:-1]
    assert original[-1]["naive"] == changed[-1]["naive"]
    assert original[-1]["seasonal_naive"] == changed[-1]["seasonal_naive"]
    assert all(row["training_end"] < row["period"] for row in original)
