"""add user_type to invitations

Revision ID: 010_add_user_type_to_invitations
Revises: 009_add_employee_id_to_invitations
Create Date: 2024-04-30 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '010_add_user_type_to_invitations'
down_revision = '009_add_employee_id_to_invitations'
branch_labels = None
depends_on = None

def upgrade():
    # Add user_type column to user_invitations table
    op.add_column('user_invitations', sa.Column('user_type', sa.String(length=50), nullable=True, server_default='employee'))

def downgrade():
    # Drop column
    op.drop_column('user_invitations', 'user_type')