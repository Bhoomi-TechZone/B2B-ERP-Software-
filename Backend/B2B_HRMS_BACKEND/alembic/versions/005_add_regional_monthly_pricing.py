"""Add regional monthly pricing to plans

Revision ID: 005
Revises: 004
Create Date: 2026-04-28 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add monthly pricing columns for GBP, EUR, and INR regions"""
    
    # Add monthly pricing columns for each region
    op.add_column('plans', sa.Column('price_monthly_gbp', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('plans', sa.Column('price_monthly_eur', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('plans', sa.Column('price_monthly_inr', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('plans', sa.Column('price_yearly_eur', sa.Integer(), nullable=False, server_default='0'))
    
    # Remove server defaults after adding columns
    op.alter_column('plans', 'price_monthly_gbp', server_default=None)
    op.alter_column('plans', 'price_monthly_eur', server_default=None)
    op.alter_column('plans', 'price_monthly_inr', server_default=None)
    op.alter_column('plans', 'price_yearly_eur', server_default=None)


def downgrade() -> None:
    """Remove regional monthly pricing columns"""
    
    op.drop_column('plans', 'price_yearly_eur')
    op.drop_column('plans', 'price_monthly_inr')
    op.drop_column('plans', 'price_monthly_eur')
    op.drop_column('plans', 'price_monthly_gbp')
