"""add role to users

Revision ID: 007
Revises: 006
Create Date: 2026-04-29

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None


def upgrade():
    """Add role column to users table"""
    # Add role column to users table
    op.add_column('users', sa.Column('role', sa.String(50), nullable=True))
    
    # Create index for faster role-based queries
    op.create_index('ix_users_role', 'users', ['role'])


def downgrade():
    """Remove role column from users table"""
    # Drop index
    op.drop_index('ix_users_role', table_name='users')
    
    # Drop role column
    op.drop_column('users', 'role')
