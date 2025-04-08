"""Add unique constraints and indexes to tickets table

Revision ID: 27267d025f38
Revises: fedc86cde357
Create Date: 2024-06-11 09:29:07.771516

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '27267d025f38'
down_revision: Union[str, None] = 'fedc86cde357'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Añadir nuevos campos
    op.add_column('tickets', sa.Column('ganador', sa.Boolean(), nullable=True))
    op.add_column('tickets', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('tickets', sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now(), nullable=True))
    



def downgrade():
    # Eliminar los nuevos campos
    op.drop_column('tickets', 'ganador')
    op.drop_column('tickets', 'created_at')
    op.drop_column('tickets', 'updated_at')
