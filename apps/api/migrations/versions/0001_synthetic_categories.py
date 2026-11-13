"""Create a clearly synthetic demo fixture, not a service directory.

Revision ID: 0001
Revises:
"""

from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    categories = op.create_table(
        "synthetic_demo_category",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("label", sa.String(length=80), nullable=False, unique=True),
    )
    op.bulk_insert(categories, [{"id": 1, "label": "Example: food"}, {"id": 2, "label": "Example: housing"}])


def downgrade() -> None:
    op.drop_table("synthetic_demo_category")
