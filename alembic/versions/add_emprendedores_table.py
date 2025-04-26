"""Add emprendedores table

Revision ID: add_emprendedores_table
Revises: merge_heads
Create Date: 2024-07-10 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_emprendedores_table'
down_revision: Union[str, None] = 'merge_heads'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Crear tabla emprendedores si no existe
    op.create_table('emprendedores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cedula', sa.String(length=20), nullable=False),
        sa.Column('nombre_apellido', sa.String(length=100), nullable=False),
        sa.Column('rif', sa.String(length=50), nullable=True),
        sa.Column('nombre_emprendimiento', sa.String(length=100), nullable=False),
        sa.Column('telefono', sa.String(length=20), nullable=False),
        sa.Column('estado', sa.String(length=50), nullable=True),
        sa.Column('municipio', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Crear índices
    op.create_index(op.f('ix_emprendedores_id'), 'emprendedores', ['id'], unique=False)
    op.create_index(op.f('ix_emprendedores_cedula'), 'emprendedores', ['cedula'], unique=False)
    op.create_index(op.f('ix_emprendedores_telefono'), 'emprendedores', ['telefono'], unique=False)


def downgrade() -> None:
    # Eliminar índices y tabla
    op.drop_index(op.f('ix_emprendedores_telefono'), table_name='emprendedores')
    op.drop_index(op.f('ix_emprendedores_cedula'), table_name='emprendedores')
    op.drop_index(op.f('ix_emprendedores_id'), table_name='emprendedores')
    op.drop_table('emprendedores') 