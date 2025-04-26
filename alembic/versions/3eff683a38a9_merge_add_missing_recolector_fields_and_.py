"""merge add_missing_recolector_fields and add_telegram_id_to_users

Revision ID: 3eff683a38a9
Revises: add_missing_recolector_fields, add_telegram_id_to_users
Create Date: 2025-04-25 19:35:49.089659

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3eff683a38a9'
down_revision: Union[str, None] = ('add_missing_recolector_fields', 'add_telegram_id_to_users')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
