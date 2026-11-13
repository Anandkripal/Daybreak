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
