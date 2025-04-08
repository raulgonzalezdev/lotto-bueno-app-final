"""add isAdmin column to Users table

Revision ID: 9616b7446239
Revises: b0e0159bc517
Create Date: 2024-06-11 13:37:16.834988

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '9616b7446239'
down_revision: Union[str, None] = 'b0e0159bc517'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('users', sa.Column('isAdmin', sa.Boolean(), nullable=True, server_default=sa.sql.expression.false()))


def downgrade():
    op.drop_column('users', 'isAdmin')