"""create invitation and security tables

Revision ID: 004
Revises: 003
Create Date: 2024-01-16 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create security_events table (append-only audit log)
    op.create_table(
        'security_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('severity', sa.Enum('info', 'warning', 'critical', name='eventseverity'), nullable=False, server_default='info'),
        sa.Column('actor_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('ip_address', postgresql.INET(), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('metadata_json', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_security_events_tenant_id', 'security_events', ['tenant_id'])
    op.create_index('ix_security_events_user_id', 'security_events', ['user_id'])
    op.create_index('ix_security_events_event_type', 'security_events', ['event_type'])
    op.create_index('ix_security_events_severity', 'security_events', ['severity'])
    op.create_index('ix_security_events_created_at', 'security_events', ['created_at'])
    
    # Add database-level triggers to prevent updates and deletes (append-only enforcement)
    op.execute("""
        CREATE OR REPLACE FUNCTION prevent_security_events_modification()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'UPDATE' THEN
                RAISE EXCEPTION 'security_events table is append-only. Updates are not allowed.';
            ELSIF TG_OP = 'DELETE' THEN
                RAISE EXCEPTION 'security_events table is append-only. Deletes are not allowed.';
            END IF;
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    op.execute("""
        CREATE TRIGGER prevent_security_events_update
        BEFORE UPDATE ON security_events
        FOR EACH ROW
        EXECUTE FUNCTION prevent_security_events_modification();
    """)
    
    op.execute("""
        CREATE TRIGGER prevent_security_events_delete
        BEFORE DELETE ON security_events
        FOR EACH ROW
        EXECUTE FUNCTION prevent_security_events_modification();
    """)
    
    # Note: user_invitations table already exists from previous migration
    # If it doesn't exist, uncomment below:
    
    # op.create_table(
    #     'user_invitations',
    #     sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    #     sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
    #     sa.Column('invited_by', postgresql.UUID(as_uuid=True), nullable=False),
    #     sa.Column('email', sa.String(255), nullable=False),
    #     sa.Column('first_name', sa.String(100), nullable=False),
    #     sa.Column('last_name', sa.String(100), nullable=False),
    #     sa.Column('phone', sa.String(20), nullable=True),
    #     sa.Column('role', sa.String(50), nullable=False),
    #     sa.Column('token_hash', sa.String(128), nullable=False),
    #     sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
    #     sa.Column('personal_details_json', postgresql.JSONB(), nullable=True),
    #     sa.Column('notification_prefs_json', postgresql.JSONB(), nullable=True),
    #     sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    #     sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
    #     sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
    #     sa.Column('revoked_by', postgresql.UUID(as_uuid=True), nullable=True),
    #     sa.Column('revoke_reason', sa.String(200), nullable=True),
    #     sa.Column('invite_ip', postgresql.INET(), nullable=True),
    #     sa.Column('accept_ip', postgresql.INET(), nullable=True),
    #     sa.Column('created_user_id', postgresql.UUID(as_uuid=True), nullable=True),
    #     sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    #     sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    #     sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
    #     sa.ForeignKeyConstraint(['invited_by'], ['users.id'], ondelete='CASCADE'),
    #     sa.ForeignKeyConstraint(['revoked_by'], ['users.id'], ondelete='SET NULL'),
    #     sa.ForeignKeyConstraint(['created_user_id'], ['users.id'], ondelete='SET NULL'),
    #     sa.PrimaryKeyConstraint('id'),
    #     sa.UniqueConstraint('token_hash')
    # )
    # op.create_index('ix_user_invitations_tenant_id', 'user_invitations', ['tenant_id'])
    # op.create_index('ix_user_invitations_email', 'user_invitations', ['email'])
    # op.create_index('ix_user_invitations_token_hash', 'user_invitations', ['token_hash'])
    # op.create_index('ix_user_invitations_status', 'user_invitations', ['status'])


def downgrade() -> None:
    # Drop triggers and function
    op.execute('DROP TRIGGER IF EXISTS prevent_security_events_delete ON security_events')
    op.execute('DROP TRIGGER IF EXISTS prevent_security_events_update ON security_events')
    op.execute('DROP FUNCTION IF EXISTS prevent_security_events_modification()')
    
    # Drop table
    # op.drop_table('user_invitations')
    op.drop_table('security_events')
    op.execute('DROP TYPE IF EXISTS eventseverity')
