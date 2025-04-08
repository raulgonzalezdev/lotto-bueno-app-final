"""Add unique constraint to telefono in Ticket

Revision ID: ee9eee775f35
Revises: a4c1db255d3b
Create Date: 2024-06-10 12:30:23.857187

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ee9eee775f35'
down_revision: Union[str, None] = 'a4c1db255d3b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_unique_constraint('uq_ticket_telefono', 'tickets', ['telefono'])


def downgrade():
    op.drop_constraint('uq_ticket_telefono', 'tickets', type_='unique')