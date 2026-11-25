"""create login security tables

Revision ID: 003
Revises: 002
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create trusted_devices table
    op.create_table(
        'trusted_devices',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('device_fingerprint', sa.String(64), nullable=False),
        sa.Column('device_name', sa.String(200), nullable=False),
        sa.Column('ip_address', postgresql.INET(), nullable=False),
        sa.Column('trusted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_trusted_devices_user_id', 'trusted_devices', ['user_id'])
    op.create_index('ix_trusted_devices_device_fingerprint', 'trusted_devices', ['device_fingerprint'])
    
    # Create refresh_tokens table
    op.create_table(
        'refresh_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token_hash', sa.String(128), nullable=False),
        sa.Column('family_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('parent_token_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('device_fingerprint', sa.String(64), nullable=True),
        sa.Column('ip_address', postgresql.INET(), nullable=False),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoke_reason', sa.Enum(
            'logout', 'rotation', 'family_compromised', 'admin_revoke', 'password_change',
            name='revokereason'
        ), nullable=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['parent_token_id'], ['refresh_tokens.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_hash')
    )
    op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])
    op.create_index('ix_refresh_tokens_tenant_id', 'refresh_tokens', ['tenant_id'])
    op.create_index('ix_refresh_tokens_token_hash', 'refresh_tokens', ['token_hash'])
    op.create_index('ix_refresh_tokens_family_id', 'refresh_tokens', ['family_id'])
    
    # Create login_events table
    op.create_table(
        'login_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_type', sa.Enum(
            'login_success', 'login_failed', 'mfa_success', 'mfa_failed',
            'sso_login', 'magic_link_login', 'logout', 'password_reset',
            'account_locked', 'suspicious_activity',
            name='logineventtype'
        ), nullable=False),
        sa.Column('ip_address', postgresql.INET(), nullable=False),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('device_fingerprint', sa.String(64), nullable=True),
        sa.Column('location_json', postgresql.JSONB(), nullable=True),
        sa.Column('failure_reason', sa.String(100), nullable=True),
        sa.Column('risk_score', sa.SmallInteger(), nullable=False, server_default='0'),
        sa.Column('flagged', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_login_events_user_id', 'login_events', ['user_id'])
    op.create_index('ix_login_events_tenant_id', 'login_events', ['tenant_id'])
    op.create_index('ix_login_events_event_type', 'login_events', ['event_type'])
    
    # Create password_history table
    op.create_table(
        'password_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('password_hash', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_password_history_user_id', 'password_history', ['user_id'])
    
    # Create sso_configurations table
    op.create_table(
        'sso_configurations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('domain', sa.String(255), nullable=False),
        sa.Column('sso_type', sa.Enum(
            'saml', 'oidc', 'google_workspace', 'microsoft_entra',
            name='ssotype'
        ), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('saml_entity_id', sa.Text(), nullable=True),
        sa.Column('saml_sso_url', sa.Text(), nullable=True),
        sa.Column('saml_certificate', sa.Text(), nullable=True),
        sa.Column('oidc_client_id', sa.Text(), nullable=True),
        sa.Column('oidc_client_secret', sa.Text(), nullable=True),
        sa.Column('oidc_discovery_url', sa.Text(), nullable=True),
        sa.Column('attribute_mapping_json', postgresql.JSONB(), nullable=True),
        sa.Column('jit_provisioning', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('default_role_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('domain')
    )
    op.create_index('ix_sso_configurations_tenant_id', 'sso_configurations', ['tenant_id'])
    op.create_index('ix_sso_configurations_domain', 'sso_configurations', ['domain'])
    
    # Create magic_link_tokens table
    op.create_table(
        'magic_link_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token_hash', sa.String(128), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('ip_address', postgresql.INET(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_hash')
    )
    op.create_index('ix_magic_link_tokens_user_id', 'magic_link_tokens', ['user_id'])
    op.create_index('ix_magic_link_tokens_token_hash', 'magic_link_tokens', ['token_hash'])


def downgrade() -> None:
    op.drop_table('magic_link_tokens')
    op.drop_table('sso_configurations')
    op.drop_table('password_history')
    op.drop_table('login_events')
    op.drop_table('refresh_tokens')
    op.drop_table('trusted_devices')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS ssotype')
    op.execute('DROP TYPE IF EXISTS logineventtype')
    op.execute('DROP TYPE IF EXISTS revokereason')
