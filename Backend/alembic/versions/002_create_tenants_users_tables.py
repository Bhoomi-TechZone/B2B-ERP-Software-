"""create tenants and users tables

Revision ID: 002_create_tenants_users_tables
Revises: 001_create_registration_tables
Create Date: 2026-04-23 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002_create_tenants_users_tables'
down_revision: Union[str, None] = '001_create_registration_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create tenants and users tables"""
    
    # Create ENUM types
    op.execute("""
        CREATE TYPE tenant_status_enum AS ENUM (
            'trial', 'active', 'suspended', 'cancelled', 'churned'
        )
    """)
    
    op.execute("""
        CREATE TYPE user_status_enum AS ENUM (
            'pending_verification', 'active', 'suspended', 'deactivated'
        )
    """)
    
    op.execute("""
        CREATE TYPE user_type_enum AS ENUM (
            'tenant_admin', 'admin_user', 'employee', 'platform_admin'
        )
    """)
    
    op.execute("""
        CREATE TYPE auth_provider_enum AS ENUM (
            'local', 'google', 'microsoft', 'saml', 'oidc'
        )
    """)
    
    op.execute("""
        CREATE TYPE mfa_type_enum AS ENUM (
            'totp', 'email_otp', 'sms_otp'
        )
    """)
    
    # Create tenants table
    op.create_table(
        'tenants',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.func.gen_random_uuid(), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('subdomain', sa.String(100), nullable=False),
        sa.Column('status', postgresql.ENUM(name='tenant_status_enum', create_type=False), nullable=False, server_default='trial'),
        sa.Column('plan_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('primary_region', postgresql.ENUM(name='primary_region_enum', create_type=False), nullable=False),
        sa.Column('primary_currency', sa.String(3), nullable=False),
        sa.Column('company_size', postgresql.ENUM(name='company_size_enum', create_type=False), nullable=True),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('trial_ends_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('billing_cycle', postgresql.ENUM(name='billing_cycle_enum', create_type=False), nullable=False),
        sa.Column('fiscal_year_start', sa.SMALLINT, nullable=False, server_default='1'),
        sa.Column('date_format', sa.String(20), nullable=False, server_default='MM/DD/YYYY'),
        sa.Column('timezone', sa.String(50), nullable=False, server_default='America/New_York'),
        sa.Column('logo_url', sa.Text, nullable=True),
        sa.Column('brand_color', sa.String(7), nullable=True),
        sa.Column('onboarding_completed', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('onboarding_step', sa.Integer, nullable=False, server_default='1'),
        sa.Column('registration_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('settings_json', postgresql.JSONB, nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    # Create indexes for tenants
    op.create_index('ix_tenants_slug', 'tenants', ['slug'], unique=True)
    op.create_index('ix_tenants_subdomain', 'tenants', ['subdomain'], unique=True)
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.func.gen_random_uuid(), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenants.id'), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('email_verified', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('display_name', sa.String(200), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('phone_verified', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('avatar_url', sa.Text, nullable=True),
        sa.Column('password_hash', sa.Text, nullable=True),
        sa.Column('auth_provider', postgresql.ENUM(name='auth_provider_enum', create_type=False), nullable=False, server_default='local'),
        sa.Column('auth_provider_id', sa.String(255), nullable=True),
        sa.Column('status', postgresql.ENUM(name='user_status_enum', create_type=False), nullable=False, server_default='pending_verification'),
        sa.Column('user_type', postgresql.ENUM(name='user_type_enum', create_type=False), nullable=False, server_default='tenant_admin'),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_login_ip', postgresql.INET, nullable=True),
        sa.Column('failed_login_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('mfa_enabled', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('mfa_type', postgresql.ENUM(name='mfa_type_enum', create_type=False), nullable=True),
        sa.Column('mfa_secret', sa.Text, nullable=True),
        sa.Column('mfa_backup_codes', postgresql.ARRAY(sa.String), nullable=True),
        sa.Column('timezone', sa.String(50), nullable=True),
        sa.Column('locale', sa.String(20), nullable=True),
        sa.Column('force_password_change', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    # Create indexes for users
    op.create_index('ix_users_tenant_id', 'users', ['tenant_id'])
    op.create_index('ix_users_email', 'users', ['email'], unique=True)


def downgrade() -> None:
    """Drop tenants and users tables"""
    
    # Drop tables
    op.drop_table('users')
    op.drop_table('tenants')
    
    # Drop ENUM types
    op.execute('DROP TYPE mfa_type_enum')
    op.execute('DROP TYPE auth_provider_enum')
    op.execute('DROP TYPE user_type_enum')
    op.execute('DROP TYPE user_status_enum')
    op.execute('DROP TYPE tenant_status_enum')
