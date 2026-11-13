"""Ingest the public RBA F5 securitised housing rate, without private data."""
import csv
import hashlib
import io
import sys
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from urllib.request import urlopen

from sqlalchemy import text
from daybreak_api.database import get_engine

URL = "https://www.rba.gov.au/statistics/tables/csv/f5-data.csv"
SERIES = "FILRSAVR"
EXPECTED_SOURCE = "RBA; Securitisation System"


def parse(content: bytes) -> list[tuple[date, Decimal]]:
    rows = list(csv.reader(io.StringIO(content.decode("utf-8-sig"))))
    metadata = {}
    for row in rows:
        if row and row[0] in {"Series ID", "Source", "Units", "Frequency"}:
            if row[0] in metadata:
                raise ValueError("Duplicate source metadata")
            metadata[row[0]] = row
    try:
        if metadata["Series ID"].count(SERIES) != 1:
            raise ValueError("Expected exactly one selected series")
        index = metadata["Series ID"].index(SERIES)
        if (metadata["Source"][index], metadata["Units"][index], metadata["Frequency"][index]) != (EXPECTED_SOURCE, "Per cent per annum", "Monthly"):
            raise ValueError("Unexpected source metadata")
    except (KeyError, IndexError) as exc:
        raise ValueError("Missing expected source metadata") from exc
    found = []
    seen = set()
    for row in rows:
        if not row or not row[0] or not row[0][0].isdigit():
            continue
        try:
            period = datetime.strptime(row[0], "%d-%b-%Y").date()
            # RBA omits trailing empty columns outside a series availability period.
            raw = row[index].strip() if len(row) > index else ""
            if not raw:
                continue
            value = Decimal(raw)
            if not value.is_finite() or (period.year, period.month) in seen:
                raise ValueError("Invalid or duplicate observation")
        except (InvalidOperation, IndexError) as exc:
            raise ValueError("Invalid observation") from exc
        seen.add((period.year, period.month))
        found.append((period, value))
    if not found:
        raise ValueError("No observations found")
    return sorted(found)


def ingest(engine, content: bytes, retrieved_at: datetime) -> int:
    if retrieved_at.tzinfo is None or retrieved_at.utcoffset() is None:
        raise ValueError("Retrieval timestamp must include a timezone")
    observations = parse(content)
    digest = hashlib.sha256(content).hexdigest()
    with engine.begin() as conn:
        inserted = conn.execute(text("""INSERT INTO public_analytics.snapshot
            (sha256, source_url, retrieved_at) VALUES (:sha, :url, :at)
            ON CONFLICT (sha256) DO NOTHING RETURNING sha256"""),
            {"sha": digest, "url": URL, "at": retrieved_at}).scalar_one_or_none()
        if not inserted:
            conn.execute(text("""UPDATE public_analytics.snapshot SET retrieved_at = GREATEST(retrieved_at, :at)
                WHERE sha256 = :sha"""), {"sha": digest, "at": retrieved_at})
        if inserted:
            conn.execute(text("""INSERT INTO public_analytics.observation
                (snapshot_sha256, series_id, period, value) VALUES (:sha, :series, :period, :value)"""),
                [{"sha": digest, "series": SERIES, "period": period, "value": value} for period, value in observations])
    return len(observations)


def main() -> None:
    with urlopen(URL, timeout=30) as response:
        content = response.read(10_000_001)
    if len(content) > 10_000_000:
        raise ValueError("Source file exceeds size limit")
    engine = get_engine()
    try:
        count = ingest(engine, content, datetime.now(timezone.utc))
        print(f"Validated {count} observations; SHA-256 {hashlib.sha256(content).hexdigest()}")
    finally:
        engine.dispose()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Ingestion failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        sys.exit(1)
