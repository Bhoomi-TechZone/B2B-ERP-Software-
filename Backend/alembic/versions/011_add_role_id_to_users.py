"""add_role_id_to_users

Revision ID: 011
Revises: 010
Create Date: 2026-06-02

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '011'
down_revision = '010'
branch_labels = None
depends_on = None


def upgrade():
    """
    Add role_id column to users collection.
    This migration adds RBAC support by linking users to roles.
    """
    # This is a MongoDB migration placeholder
    # The actual field will be added automatically by Beanie when the model is updated
    # This file serves as documentation of the schema change
    pass


def downgrade():
    """
    Remove role_id column from users collection.
    """
    # This is a MongoDB migration placeholder
    pass
