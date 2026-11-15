"""Measure a selective aggregate before/after an index on synthetic temporary data."""
import json
import os
from pathlib import Path
import statistics
import subprocess

query = "SELECT SUM(cents) FROM benchmark_cashflow WHERE bucket = 777"
sql = """
CREATE TEMP TABLE benchmark_cashflow AS
SELECT i AS id, i % 1000 AS bucket, (i % 10000)::numeric AS cents
FROM generate_series(1, 200000) AS i;
ANALYZE benchmark_cashflow;
SELECT to_json(version());
"""
sql += f"SELECT to_json(t) FROM ({query}) t;\n"
sql += (f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {query};\n") * 5
sql += "CREATE INDEX ON benchmark_cashflow (bucket); ANALYZE benchmark_cashflow;\n"
sql += (f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {query};\n") * 5
sql += f"SELECT to_json(t) FROM ({query}) t;\n"
result = subprocess.run([os.environ.get("PSQL", "psql"), "-X", "-qAt", "-v", "ON_ERROR_STOP=1",
                         os.environ.get("DATABASE_BENCH_URL", "postgres")],
                        input=sql, text=True, capture_output=True, check=True)
decoder = json.JSONDecoder()
remaining = result.stdout.strip()
parts = []
while remaining:
    value, end = decoder.raw_decode(remaining)
    parts.append(value)
    remaining = remaining[end:].strip()
before = parts[2:7]
after = parts[7:12]
assert parts[1] == parts[12] == {"sum": 1055400}, "Index changed result"
report = {"database": parts[0], "rows": 200000, "query": query, "same_result": parts[1],
          "before_ms": [p[0]["Execution Time"] for p in before],
          "after_ms": [p[0]["Execution Time"] for p in after],
          "before_plan": before[-1], "after_plan": after[-1],
          "limitations": "Local warm-cache temporary synthetic data, five runs each. Not production throughput. Index build/storage costs excluded; production 56-row RBA table does not justify this index."}
report["median_before_ms"] = statistics.median(report["before_ms"])
report["median_after_ms"] = statistics.median(report["after_ms"])
destination = Path(__file__).resolve().parent / "evidence/query-plan.json"
destination.parent.mkdir(exist_ok=True)
destination.write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({key: report[key] for key in ["rows", "same_result", "median_before_ms", "median_after_ms"]}, indent=2))
