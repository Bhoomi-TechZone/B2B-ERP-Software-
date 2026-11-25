"""Add has_trial column to plans

Revision ID: 006
Revises: 005
Create Date: 2026-04-28 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add has_trial column to control trial availability per plan"""
    
    # Add has_trial column (default TRUE to maintain existing behavior)
    op.add_column('plans', sa.Column('has_trial', sa.Boolean(), nullable=False, server_default='true'))
    
    # Remove server default after adding column
    op.alter_column('plans', 'has_trial', server_default=None)


def downgrade() -> None:
    """Remove has_trial column"""
    
    op.drop_column('plans', 'has_trial')
