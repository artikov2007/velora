"""Create the initial catalog tables."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_catalog"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("slug", sa.String(length=80), primary_key=True),
        sa.Column("name", sa.String(length=160), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "products",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=180), nullable=False, unique=True),
        sa.Column("name", sa.String(length=240), nullable=False),
        sa.Column("brand", sa.String(length=120), nullable=False),
        sa.Column("category_slug", sa.String(length=80), sa.ForeignKey("categories.slug"), nullable=False),
        sa.Column("country_code", sa.String(length=2), nullable=False),
        sa.Column("price_minor", sa.BigInteger(), nullable=False),
        sa.Column("currency_code", sa.String(length=3), nullable=False),
        sa.Column("image_url", sa.String(length=2048), nullable=False),
        sa.Column("image_alt", sa.String(length=240), nullable=False),
        sa.Column("is_demo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("price_minor >= 0", name="ck_products_price_non_negative"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_products_country_category", "products", ["country_code", "category_slug"])
    op.create_index("ix_products_created_at", "products", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_products_created_at", table_name="products")
    op.drop_index("ix_products_country_category", table_name="products")
    op.drop_table("products")
    op.drop_table("categories")