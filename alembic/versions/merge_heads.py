"""merge add_missing_recolector_fields and add_telegram_id_to_users

Revision ID: merge_heads
Revises: add_missing_recolector_fields, add_telegram_id_to_users
Create Date: 2024-07-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'merge_heads'
down_revision: Union[str, None] = ('add_missing_recolector_fields', 'add_telegram_id_to_users')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Esta migración solo sirve para fusionar las cabezas, no realiza cambios en la base de datos
    pass


def downgrade() -> None:
    # Esta migración solo sirve para fusionar las cabezas, no realiza cambios en la base de datos
    pass 