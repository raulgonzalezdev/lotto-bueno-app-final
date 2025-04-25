"""Add missing fields to recolectores table

Revision ID: add_missing_recolector_fields
Revises: add_organizaciones_politicas
Create Date: 2024-06-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_missing_recolector_fields'
down_revision: Union[str, None] = 'add_organizaciones_politicas'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Comprobar si ya existen las columnas antes de añadirlas
    # La migración original creó la tabla con las columnas: id, nombre, cedula, telefono, es_referido
    # La migración add_recolector_fields añadió: email, municipio, organizacion_politica
    # Aquí verificamos que las columnas existan y las añadimos si no están presentes
    
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    existing_columns = [column['name'] for column in inspector.get_columns('recolectores')]
    
    # Añadir columna email si no existe
    if 'email' not in existing_columns:
        op.add_column('recolectores', sa.Column('email', sa.String(100), nullable=True))
    
    # Añadir columna estado si no existe
    if 'estado' not in existing_columns:
        op.add_column('recolectores', sa.Column('estado', sa.String(50), nullable=True))
    
    # Añadir columna municipio si no existe
    if 'municipio' not in existing_columns:
        op.add_column('recolectores', sa.Column('municipio', sa.String(50), nullable=True))
    
    # Añadir columna organizacion_politica si no existe
    if 'organizacion_politica' not in existing_columns:
        op.add_column('recolectores', sa.Column('organizacion_politica', sa.String(50), nullable=True))


def downgrade() -> None:
    # Solo eliminar las columnas si este script las creó originalmente
    # Esta es una operación potencialmente destructiva, por lo que debe realizarse con precaución
    
    # op.drop_column('recolectores', 'email')
    # op.drop_column('recolectores', 'municipio')
    # op.drop_column('recolectores', 'organizacion_politica')
    pass 