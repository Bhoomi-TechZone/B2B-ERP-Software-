"""create employee tables

Revision ID: 008_create_employee_tables
Revises: 007_add_role_to_users
Create Date: 2024-04-30 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '008_create_employee_tables'
down_revision = '007_add_role_to_users'
branch_labels = None
depends_on = None

def upgrade():
    # Create enums
    employment_status_enum = postgresql.ENUM(
        'active', 'on_leave', 'notice_period', 'terminated', 'alumni', 'pending_start',
        name='employmentstatus'
    )
    employment_status_enum.create(op.get_bind())
    
    employment_type_enum = postgresql.ENUM(
        'full_time', 'part_time', 'contract', 'zero_hours', 'intern', 'gig',
        name='employmenttype'
    )
    employment_type_enum.create(op.get_bind())
    
    gender_enum = postgresql.ENUM(
        'male', 'female', 'non_binary', 'prefer_not_to_say', 'self_describe',
        name='gender'
    )
    gender_enum.create(op.get_bind())
    
    termination_reason_enum = postgresql.ENUM(
        'resignation', 'redundancy', 'dismissal', 'end_of_contract', 'retirement',
        name='terminationreason'
    )
    termination_reason_enum.create(op.get_bind())
    
    job_level_enum = postgresql.ENUM(
        'junior', 'mid', 'senior', 'lead', 'head',
        name='joblevel'
    )
    job_level_enum.create(op.get_bind())
    
    location_type_enum = postgresql.ENUM(
        'office', 'remote', 'hybrid',
        name='locationtype'
    )
    location_type_enum.create(op.get_bind())
    
    document_type_enum = postgresql.ENUM(
        'contract', 'id_proof', 'visa', 'passport', 'certificate', 'other',
        name='documenttype'
    )
    document_type_enum.create(op.get_bind())

    # Create departments table
    op.create_table('departments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('head_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('cost_center_code', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['departments.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_departments_tenant_id'), 'departments', ['tenant_id'], unique=False)

    # Create job_titles table
    op.create_table('job_titles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('level', job_level_enum, nullable=True),
        sa.Column('job_family', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_job_titles_tenant_id'), 'job_titles', ['tenant_id'], unique=False)

    # Create work_locations table
    op.create_table('work_locations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('type', location_type_enum, nullable=False),
        sa.Column('address_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('country', sa.String(length=2), nullable=True),
        sa.Column('timezone', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_work_locations_tenant_id'), 'work_locations', ['tenant_id'], unique=False)

    # Create employees table
    op.create_table('employees',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('employee_number', sa.String(length=50), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('preferred_name', sa.String(length=100), nullable=True),
        sa.Column('pronouns', sa.String(length=50), nullable=True),
        sa.Column('email_work', sa.String(length=255), nullable=True),
        sa.Column('email_personal', sa.String(length=255), nullable=True),
        sa.Column('phone_work', sa.String(length=20), nullable=True),
        sa.Column('phone_personal', sa.String(length=20), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', gender_enum, nullable=True),
        sa.Column('nationality', sa.String(length=2), nullable=True),
        sa.Column('country_of_residence', sa.String(length=2), nullable=True),
        sa.Column('address_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('profile_photo_url', sa.Text(), nullable=True),
        sa.Column('employment_status', employment_status_enum, nullable=False),
        sa.Column('employment_type', employment_type_enum, nullable=False),
        sa.Column('hire_date', sa.Date(), nullable=True),
        sa.Column('probation_end_date', sa.Date(), nullable=True),
        sa.Column('notice_period_days', sa.Integer(), nullable=True),
        sa.Column('termination_date', sa.Date(), nullable=True),
        sa.Column('termination_reason', termination_reason_enum, nullable=True),
        sa.Column('department_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('job_title_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('manager_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('work_location_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('region', sa.String(length=100), nullable=True),
        sa.Column('timezone', sa.String(length=50), nullable=True),
        sa.Column('custom_fields_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ),
        sa.ForeignKeyConstraint(['job_title_id'], ['job_titles.id'], ),
        sa.ForeignKeyConstraint(['manager_id'], ['employees.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['work_location_id'], ['work_locations.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('employee_number')
    )
    op.create_index(op.f('ix_employees_tenant_id'), 'employees', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_employees_employee_number'), 'employees', ['employee_number'], unique=False)
    op.create_index(op.f('ix_employees_email_work'), 'employees', ['email_work'], unique=False)

    # Add foreign key constraint for department head_id after employees table is created
    op.create_foreign_key('fk_departments_head_id', 'departments', 'employees', ['head_id'], ['id'])

    # Create employee_job_history table
    op.create_table('employee_job_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('employee_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('job_title_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('department_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('manager_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('change_reason', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ),
        sa.ForeignKeyConstraint(['job_title_id'], ['job_titles.id'], ),
        sa.ForeignKeyConstraint(['manager_id'], ['employees.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_employee_job_history_employee_id'), 'employee_job_history', ['employee_id'], unique=False)

    # Create employee_documents table
    op.create_table('employee_documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('employee_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('document_type', document_type_enum, nullable=False),
        sa.Column('file_url', sa.Text(), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('expiry_date', sa.Date(), nullable=True),
        sa.Column('uploaded_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_employee_documents_employee_id'), 'employee_documents', ['employee_id'], unique=False)

    # Create employee_notes table
    op.create_table('employee_notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('employee_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('note_text', sa.Text(), nullable=False),
        sa.Column('is_private', sa.Boolean(), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_employee_notes_employee_id'), 'employee_notes', ['employee_id'], unique=False)

    # Create emergency_contacts table
    op.create_table('emergency_contacts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('employee_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('relationship', sa.String(length=100), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('is_primary', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_emergency_contacts_employee_id'), 'emergency_contacts', ['employee_id'], unique=False)


def downgrade():
    # Drop tables in reverse order
    op.drop_index(op.f('ix_emergency_contacts_employee_id'), table_name='emergency_contacts')
    op.drop_table('emergency_contacts')
    
    op.drop_index(op.f('ix_employee_notes_employee_id'), table_name='employee_notes')
    op.drop_table('employee_notes')
    
    op.drop_index(op.f('ix_employee_documents_employee_id'), table_name='employee_documents')
    op.drop_table('employee_documents')
    
    op.drop_index(op.f('ix_employee_job_history_employee_id'), table_name='employee_job_history')
    op.drop_table('employee_job_history')
    
    op.drop_foreign_key('fk_departments_head_id', 'departments', type_='foreignkey')
    
    op.drop_index(op.f('ix_employees_email_work'), table_name='employees')
    op.drop_index(op.f('ix_employees_employee_number'), table_name='employees')
    op.drop_index(op.f('ix_employees_tenant_id'), table_name='employees')
    op.drop_table('employees')
    
    op.drop_index(op.f('ix_work_locations_tenant_id'), table_name='work_locations')
    op.drop_table('work_locations')
    
    op.drop_index(op.f('ix_job_titles_tenant_id'), table_name='job_titles')
    op.drop_table('job_titles')
    
    op.drop_index(op.f('ix_departments_tenant_id'), table_name='departments')
    op.drop_table('departments')
    
    # Drop enums
    document_type_enum = postgresql.ENUM(name='documenttype')
    document_type_enum.drop(op.get_bind())
    
    location_type_enum = postgresql.ENUM(name='locationtype')
    location_type_enum.drop(op.get_bind())
    
    job_level_enum = postgresql.ENUM(name='joblevel')
    job_level_enum.drop(op.get_bind())
    
    termination_reason_enum = postgresql.ENUM(name='terminationreason')
    termination_reason_enum.drop(op.get_bind())
    
    gender_enum = postgresql.ENUM(name='gender')
    gender_enum.drop(op.get_bind())
    
    employment_type_enum = postgresql.ENUM(name='employmenttype')
    employment_type_enum.drop(op.get_bind())
    
    employment_status_enum = postgresql.ENUM(name='employmentstatus')
    employment_status_enum.drop(op.get_bind())