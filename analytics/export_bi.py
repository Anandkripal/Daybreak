"""Deterministic public/synthetic BI package. Never accepts private user CSVs."""
import argparse
from contextlib import closing
import csv
import hashlib
import io
import json
from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parent
RBA_URL = "https://www.rba.gov.au/statistics/tables/csv/f5-data.csv"


def synthetic_rows():
    """One fictional example budget, not an observed person or population estimate."""
    rows = []
    for month in range(1, 13):
        for category, kind, cents, recurring in [
            ("Take-home income", "income", 300000 + month * 10000, 0),
            ("Housing", "expense", 120000, 1),
            ("Essentials", "expense", 60000 + month * 1000, 0),
            ("Utilities", "expense", 20000 + (month % 3) * 5000, 1),
        ]:
            rows.append({"month": f"2025-{month:02d}-01", "category": category,
                         "kind": kind, "cents": cents, "recurring": recurring,
                         "data_class": "synthetic"})
    return rows


def build_tables():
    source = synthetic_rows()
    with closing(sqlite3.connect(":memory:")) as conn:
        conn.row_factory = sqlite3.Row
        conn.execute("CREATE TABLE synthetic_cashflow (month TEXT, category TEXT, kind TEXT, cents INTEGER, recurring INTEGER, data_class TEXT)")
        conn.executemany("INSERT INTO synthetic_cashflow VALUES (:month,:category,:kind,:cents,:recurring,:data_class)", source)
        monthly = [dict(row) for row in conn.execute((ROOT / "sql/monthly_finance.sql").read_text())]
    assistance = []
    for month in range(1, 13):
        for category in ["Food", "Housing", "Money"]:
            contacts = 20 + month
            helped = 5 + month
            assistance.append({"month": f"2025-{month:02d}-01", "category": category,
                               "contacts": contacts, "received_help": helped,
                               "awaiting_reply": 8, "not_available": contacts - helped - 8,
                               "data_class": "synthetic"})
    return {"cashflow": source, "monthly_finance": monthly, "assistance": assistance}


def export(destination: Path):
    tables = build_tables()
    with (ROOT / "fixtures/rba_selected.csv").open() as handle:
        rates = list(csv.DictReader(handle))
    if not rates or any(row["series_id"] != "FILRSAVR" for row in rates):
        raise ValueError("Expected frozen selected RBA series")
    tables["rba_rates"] = rates
    monthly = tables["monthly_finance"]
    source = tables["cashflow"]
    income = sum(row["cents"] for row in source if row["kind"] == "income")
    expenses = sum(row["cents"] for row in source if row["kind"] == "expense")
    tables["quality"] = [
        {"check": "income_SQL_minus_source_cents", "difference": sum(row["income_cents"] for row in monthly) - income, "expected": 0},
        {"check": "expense_SQL_minus_source_cents", "difference": sum(row["expense_cents"] for row in monthly) - expenses, "expected": 0},
        {"check": "net_SQL_minus_source_cents", "difference": sum(row["net_cents"] for row in monthly) - income + expenses, "expected": 0},
        {"check": "missing_synthetic_months", "difference": 12 - len(monthly), "expected": 0},
        {"check": "assistance_unreconciled_outcomes", "difference": sum(abs(row["contacts"] - row["received_help"] - row["awaiting_reply"] - row["not_available"]) for row in tables["assistance"]), "expected": 0},
    ]
    if any(row["difference"] != row["expected"] for row in tables["quality"]):
        raise ValueError("Reconciliation failed")
    destination.mkdir(parents=True, exist_ok=True)
    files = {}
    for name, rows in tables.items():
        output = io.StringIO(newline="")
        writer = csv.DictWriter(output, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
        payload = output.getvalue().encode()
        (destination / f"{name}.csv").write_bytes(payload)
        files[f"{name}.csv"] = {"rows": len(rows), "sha256": hashlib.sha256(payload).hexdigest()}
    manifest = {"format_version": 1, "synthetic_definition": "One invented budget and invented aggregate assistance counts, calendar 2025. No actual users or impact claims.",
                "rba_provenance": json.loads((ROOT / "fixtures/rba_provenance.json").read_text()), "files": files,
                "controls_cents": {"income": income, "expenses": expenses, "net": income - expenses}}
    (destination / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    (destination / "workbook-data.json").write_text(json.dumps({**tables, "manifest": manifest}, indent=2) + "\n")
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "exports")
    args = parser.parse_args()
    print(json.dumps(export(args.output), indent=2))
