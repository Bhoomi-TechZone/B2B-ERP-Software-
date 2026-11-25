"""create registration tables

Revision ID: 001_create_registration_tables
Revises: 
Create Date: 2026-04-23 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_create_registration_tables'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create registration-related tables"""
    
    # Create ENUM types
    op.execute("""
        CREATE TYPE company_size_enum AS ENUM (
            '1_10', '11_50', '51_200', '201_500', '501_1000', '1000_plus'
        )
    """)
    
    op.execute("""
        CREATE TYPE primary_region_enum AS ENUM ('US', 'UK', 'IN')
    """)
    
    op.execute("""
        CREATE TYPE billing_cycle_enum AS ENUM ('monthly', 'annual')
    """)
    
    op.execute("""
        CREATE TYPE registration_status_enum AS ENUM (
            'pending_verification', 'verified', 'abandoned', 'spam_blocked'
        )
    """)
    
    op.execute("""
        CREATE TYPE token_type_enum AS ENUM (
            'email_verification', 'password_reset', 'email_change', 'invite'
        )
    """)
    
    # Create tenant_registrations table
    op.create_table(
        'tenant_registrations',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.func.gen_random_uuid(), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('password_hash', sa.Text, nullable=False),
        sa.Column('company_name', sa.String(200), nullable=False),
        sa.Column('company_size', postgresql.ENUM(name='company_size_enum', create_type=False), nullable=False),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('primary_region', postgresql.ENUM(name='primary_region_enum', create_type=False), nullable=False),
        sa.Column('plan_slug', sa.String(50), nullable=False),
        sa.Column('billing_cycle', postgresql.ENUM(name='billing_cycle_enum', create_type=False), nullable=False),
        sa.Column('promo_code', sa.String(50), nullable=True),
        sa.Column('terms_accepted', sa.Boolean, nullable=False, default=False),
        sa.Column('terms_accepted_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('registration_status', postgresql.ENUM(name='registration_status_enum', create_type=False), nullable=False, server_default='pending_verification'),
        sa.Column('verification_attempts', sa.Integer, nullable=False, server_default='0'),
        sa.Column('expires_at', sa.DateTime(timezone=True), server_default=sa.text("NOW() + INTERVAL '48 hours'"), nullable=False),
        sa.Column('converted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('converted_tenant_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    # Create indexes for tenant_registrations
    op.create_index('ix_tenant_registrations_email', 'tenant_registrations', ['email'], unique=True)
    op.create_index('ix_tenant_registrations_registration_status', 'tenant_registrations', ['registration_status'])
    
    # Create email_verification_tokens table
    op.create_table(
        'email_verification_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.func.gen_random_uuid(), primary_key=True),
        sa.Column('registration_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('token_type', postgresql.ENUM(name='token_type_enum', create_type=False), nullable=False, server_default='email_verification'),
        sa.Column('token_hash', sa.String(64), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ip_address', postgresql.INET, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    # Create indexes for email_verification_tokens
    op.create_index('ix_email_verification_tokens_registration_id', 'email_verification_tokens', ['registration_id'])
    op.create_index('ix_email_verification_tokens_user_id', 'email_verification_tokens', ['user_id'])
    op.create_index('ix_email_verification_tokens_token_hash', 'email_verification_tokens', ['token_hash'], unique=True)
    op.create_index('ix_email_verification_tokens_email', 'email_verification_tokens', ['email'])


def downgrade() -> None:
    """Drop registration-related tables"""
    
    # Drop tables
    op.drop_table('email_verification_tokens')
    op.drop_table('tenant_registrations')
    
    # Drop ENUM types
    op.execute('DROP TYPE token_type_enum')
    op.execute('DROP TYPE registration_status_enum')
    op.execute('DROP TYPE billing_cycle_enum')
    op.execute('DROP TYPE primary_region_enum')
    op.execute('DROP TYPE company_size_enum')
