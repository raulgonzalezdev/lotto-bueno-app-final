"""Add fields municipio parroquia

Revision ID: a4c1db255d3b
Revises: f81482e543c0
Create Date: 2024-06-10 11:15:25.510794

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a4c1db255d3b'
down_revision: Union[str, None] = 'f81482e543c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
   
    op.add_column('tickets', sa.Column('municipio', sa.String(length=35), nullable=True))
    op.add_column('tickets', sa.Column('parroquia', sa.String(length=35), nullable=True))


def downgrade():
 
    op.drop_column('tickets', 'municipio')
    op.drop_column('tickets', 'parroquia')