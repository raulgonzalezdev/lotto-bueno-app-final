"""Add telegram_id to users table

Revision ID: add_telegram_id_to_users
Revises: fedc86cde357
Create Date: 2024-06-14 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_telegram_id_to_users'
down_revision: Union[str, None] = 'fedc86cde357'  # Esto debe ser la última revisión que aplicaste
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('users', sa.Column('telegram_id', sa.BigInteger(), nullable=True, unique=True))


def downgrade():
    op.drop_column('users', 'telegram_id') 