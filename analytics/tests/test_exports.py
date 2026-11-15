import importlib.util
from contextlib import closing
import json
import sqlite3
from pathlib import Path
import unittest
from tempfile import TemporaryDirectory

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("export_bi", ROOT / "export_bi.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ExportTests(unittest.TestCase):
    def test_zero_income_and_observation_windows(self):
        with closing(sqlite3.connect(':memory:')) as conn:
            conn.row_factory = sqlite3.Row
            conn.execute('CREATE TABLE synthetic_cashflow (month TEXT, kind TEXT, cents INTEGER, recurring INTEGER)')
            conn.executemany('INSERT INTO synthetic_cashflow VALUES (?,?,?,?)', [
                ('2025-01-01', 'expense', 100, 1),
                ('2025-03-01', 'income', 300, 0),
            ])
            rows = conn.execute((ROOT / 'sql/monthly_finance.sql').read_text()).fetchall()
            self.assertIsNone(rows[0]['expense_ratio'])
            self.assertEqual(rows[1]['expense_ratio'], 0)
            self.assertEqual(rows[1]['net_change_cents'], 400)
            self.assertEqual(rows[1]['trailing_3_observation_net_cents'], 100)
            self.assertEqual(len(rows), 2)  # Missing February is not fabricated as zero.

    def test_known_controls_and_windows(self):
        data = module.build_tables()
        monthly = data["monthly_finance"]
        self.assertEqual(sum(row["income_cents"] for row in monthly), 4380000)
        self.assertEqual(sum(row["expense_cents"] for row in monthly), 2538000)
        self.assertEqual(monthly[0]["net_cents"], 104000)
        self.assertIsNone(monthly[0]["net_change_cents"])
        self.assertEqual(monthly[1]["net_change_cents"], 4000)
        self.assertEqual(monthly[-1]["cumulative_net_cents"], 1842000)
        self.assertEqual(monthly[2]["trailing_3_observation_net_cents"], (104000+108000+127000)/3)

    def test_reproducible_exports_and_no_private_columns(self):
        with TemporaryDirectory() as first, TemporaryDirectory() as second:
            a, b = Path(first), Path(second)
            module.export(a)
            module.export(b)
            for file in a.iterdir():
                self.assertEqual(file.read_bytes(), (b / file.name).read_bytes())
            data = json.loads((a / "workbook-data.json").read_text())
            self.assertTrue(all(row["difference"] == 0 for row in data["quality"]))
            self.assertEqual(len(data["rba_rates"]), 56)
            self.assertEqual(set(data["cashflow"][0]), {"month", "category", "kind", "cents", "recurring", "data_class"})


if __name__ == "__main__":
    unittest.main()
