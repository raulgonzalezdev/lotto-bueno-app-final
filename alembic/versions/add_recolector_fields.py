"""Add fields to recolectores table

Revision ID: add_recolector_fields
Revises: 9616b7446239
Create Date: 2024-06-14 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_recolector_fields'
down_revision: Union[str, None] = '9616b7446239'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Añadir columnas a la tabla recolectores
    op.add_column('recolectores', sa.Column('email', sa.String(100), nullable=True))
    op.add_column('recolectores', sa.Column('estado', sa.String(50), nullable=True))
    op.add_column('recolectores', sa.Column('municipio', sa.String(50), nullable=True))
    op.add_column('recolectores', sa.Column('organizacion_politica', sa.String(50), nullable=True))


def downgrade() -> None:
    # Eliminar columnas agregadas
    op.drop_column('recolectores', 'email')
    op.drop_column('recolectores', 'estado')
    op.drop_column('recolectores', 'municipio')
    op.drop_column('recolectores', 'organizacion_politica') 