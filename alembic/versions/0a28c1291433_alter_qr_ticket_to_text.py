"""Alter qr_ticket to Text

Revision ID: 0a28c1291433
Revises: abc123456789
Create Date: 2024-06-10 09:03:11.002741

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0a28c1291433'
down_revision: Union[str, None] = 'abc123456789'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.alter_column('tickets', 'qr_ticket',
               existing_type=sa.String(length=255),
               type_=sa.Text(),
               existing_nullable=True)


def downgrade():
    op.alter_column('tickets', 'qr_ticket',
               existing_type=sa.Text(),
               type_=sa.String(length=255),
               existing_nullable=True)