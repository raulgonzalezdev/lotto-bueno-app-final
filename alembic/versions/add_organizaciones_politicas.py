"""Add organizaciones_politicas table

Revision ID: add_organizaciones_politicas
Revises: add_recolector_fields
Create Date: 2023-05-26 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_organizaciones_politicas'
down_revision: Union[str, None] = 'add_recolector_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Crear la tabla de organizaciones políticas
    op.create_table('organizaciones_politicas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=50), nullable=False),
        sa.Column('codigo', sa.String(length=20), nullable=True),
        sa.Column('descripcion', sa.String(length=200), nullable=True),
        sa.Column('activo', sa.Boolean(), server_default=sa.sql.expression.true(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_organizaciones_politicas_id'), 'organizaciones_politicas', ['id'], unique=False)
    op.create_index(op.f('ix_organizaciones_politicas_nombre'), 'organizaciones_politicas', ['nombre'], unique=True)
    
    # Insertar organizaciones políticas iniciales
    op.execute("""
    INSERT INTO organizaciones_politicas (nombre, codigo, activo) VALUES 
    ('PV', 'PRIMERO VENEZUELA', true),
    ('AD', 'ACCION DEMOCRATICA', true), 
    ('COPEI', 'COMITE ORGANIZADO POLITICO ELECTORAL INDEPENDIENTE', true),
    ('VOL', 'VOLUNTAD POPULAR', true),
    ('BR', 'BANDERA ROJA', true)
    """)


def downgrade() -> None:
    # Eliminar tabla
    op.drop_index(op.f('ix_organizaciones_politicas_nombre'), table_name='organizaciones_politicas')
    op.drop_index(op.f('ix_organizaciones_politicas_id'), table_name='organizaciones_politicas')
    op.drop_table('organizaciones_politicas') 