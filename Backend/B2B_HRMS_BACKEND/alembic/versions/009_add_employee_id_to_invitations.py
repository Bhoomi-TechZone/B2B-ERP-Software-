"""add employee_id to invitations

Revision ID: 009_add_employee_id_to_invitations
Revises: 008_create_employee_tables
Create Date: 2024-04-30 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '009_add_employee_id_to_invitations'
down_revision = '008_create_employee_tables'
branch_labels = None
depends_on = None

def upgrade():
    # Add employee_id column to user_invitations table
    op.add_column('user_invitations', sa.Column('employee_id', postgresql.UUID(as_uuid=True), nullable=True))
    
    # Add foreign key constraint
    op.create_foreign_key('fk_user_invitations_employee_id', 'user_invitations', 'employees', ['employee_id'], ['id'])
    
    # Add index for better performance
    op.create_index(op.f('ix_user_invitations_employee_id'), 'user_invitations', ['employee_id'], unique=False)

def downgrade():
    # Drop index
    op.drop_index(op.f('ix_user_invitations_employee_id'), table_name='user_invitations')
    
    # Drop foreign key constraint
    op.drop_constraint('fk_user_invitations_employee_id', 'user_invitations', type_='foreignkey')
    
    # Drop column
    op.drop_column('user_invitations', 'employee_id')