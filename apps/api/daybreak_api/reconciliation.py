"""Public-only revision audit; no user finance tables are queried."""
import json
from sqlalchemy import text
from daybreak_api.database import get_engine

REVISION_SQL = """
WITH ranked AS (
  SELECT sha256, ROW_NUMBER() OVER (ORDER BY retrieved_at DESC, sha256 DESC) AS rank
  FROM public_analytics.snapshot
), current_values AS (
  SELECT o.* FROM public_analytics.observation o JOIN ranked r
  ON o.snapshot_sha256 = r.sha256 WHERE r.rank = 1
), previous_values AS (
  SELECT o.* FROM public_analytics.observation o JOIN ranked r
  ON o.snapshot_sha256 = r.sha256 WHERE r.rank = 2
)
SELECT COALESCE(c.series_id, p.series_id) AS series_id,
       COALESCE(c.period, p.period) AS period,
       p.snapshot_sha256 AS previous_snapshot, c.snapshot_sha256 AS current_snapshot,
       p.value AS previous_value, c.value AS current_value,
       CASE WHEN p.period IS NULL THEN 'added'
            WHEN c.period IS NULL THEN 'removed'
            WHEN c.value <> p.value THEN 'changed' ELSE 'unchanged' END AS status
FROM current_values c FULL OUTER JOIN previous_values p
ON c.series_id = p.series_id AND c.period = p.period
ORDER BY series_id, period
"""


def main() -> None:
    engine = get_engine()
    try:
        with engine.connect() as connection:
            rows = [dict(row) for row in connection.execute(text(REVISION_SQL)).mappings()]
        print(json.dumps({"comparison": "two most recently retrieved distinct snapshots",
                          "limitations": "Retrieval order is not source publication or revision order. "
                          "With one snapshot all observations are added.",
                          "rows": rows}, default=str, indent=2))
    finally:
        engine.dispose()


if __name__ == "__main__":
    main()
