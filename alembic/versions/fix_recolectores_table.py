"""Arreglar la tabla recolectores

Revision ID: fix_recolectores_table
Revises: 3eff683a38a9
Create Date: 2024-07-01 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fix_recolectores_table'
down_revision: Union[str, None] = '3eff683a38a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Verificar y añadir columnas faltantes
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    # Obtener columnas existentes
    existing_columns = [column['name'] for column in inspector.get_columns('recolectores')]
    
    # Añadir las columnas si no existen
    if 'email' not in existing_columns:
        op.add_column('recolectores', sa.Column('email', sa.String(100), nullable=True))
    
    if 'estado' not in existing_columns:
        op.add_column('recolectores', sa.Column('estado', sa.String(50), nullable=True))
    
    if 'municipio' not in existing_columns:
        op.add_column('recolectores', sa.Column('municipio', sa.String(50), nullable=True))
    
    if 'organizacion_politica' not in existing_columns:
        op.add_column('recolectores', sa.Column('organizacion_politica', sa.String(50), nullable=True))
    
    # Verificar si existe la tabla organizaciones_politicas
    tables = inspector.get_table_names()
    if 'organizaciones_politicas' not in tables:
        # Crear la tabla si no existe
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
    # Esta operación es potencialmente destructiva, por lo que se deja vacía
    pass 