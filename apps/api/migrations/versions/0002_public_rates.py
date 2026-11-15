"""Add isolated public RBA observations and immutable source snapshots."""
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA public_analytics")
    op.execute("""CREATE TABLE public_analytics.snapshot (
        sha256 char(64) PRIMARY KEY, source_url text NOT NULL,
        retrieved_at timestamptz NOT NULL)""")
    op.execute("""CREATE TABLE public_analytics.observation (
        snapshot_sha256 char(64) NOT NULL REFERENCES public_analytics.snapshot(sha256),
        series_id text NOT NULL, period date NOT NULL, value numeric NOT NULL,
        PRIMARY KEY(snapshot_sha256, series_id, period))""")
    op.execute("""CREATE VIEW public_analytics.latest_rate AS
        WITH latest_snapshot AS (
          SELECT sha256, retrieved_at, source_url FROM public_analytics.snapshot
          ORDER BY retrieved_at DESC, sha256 DESC LIMIT 1
        ), latest AS (
          SELECT o.*, s.retrieved_at, s.source_url
          FROM public_analytics.observation o JOIN latest_snapshot s
            ON s.sha256 = o.snapshot_sha256
        )
        SELECT series_id, period, value, source_url, retrieved_at, snapshot_sha256,
          value - lag(value) OVER (PARTITION BY series_id ORDER BY period) AS change_pp,
          avg(value) OVER (PARTITION BY series_id ORDER BY period ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS trailing_3_observation_mean
        FROM latest""")


def downgrade() -> None:
    op.execute("DROP SCHEMA public_analytics CASCADE")
