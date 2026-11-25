import { memo, useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  UserPlus, Mail, Shield, X, Send,
  Building2, Clock, RotateCw,
  Upload, Info, Loader2, AlertCircle, RefreshCw,
  MoreVertical, Eye, Pencil, UserCog, Trash2, CheckCircle2,
} from 'lucide-react'

import {
  TENANT_ROLES, TENANT_ROLE_MAP, INVITATION_STATUS_TONE,
} from '../../../config/tenantRoles'
import invitationService from '../../../services/invitationService'
import roleService from '../../../services/roleService'
import onboardingService from '../../../services/onboardingService'

// ─── Invitable roles (matching backend UserRole enum) ────────────────────
const INVITABLE_ROLES = ['hr_admin', 'payroll_admin', 'recruiter', 'finance_viewer', 'it_admin']
const INVITABLE_TENANT_ROLES = TENANT_ROLES.filter(r => INVITABLE_ROLES.includes(r.id))

// ─── Action Menu Component ────────────────────────────────────────────────
const InvitationActionMenu = memo(({ invitation, onResend, onRevoke, onViewDetails, onEditRole, onConvertToEmployee }) => {
  const [open, setOpen] = useState(false)

  const handleToggle = (e) => {
    e.stopPropagation()
    console.log('Action menu toggled:', !open, 'for invitation:', invitation.id)
    setOpen(p => !p)
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 z-[101] mt-1 w-56 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              style={{ minHeight: '100px' }}
            >
              <button
                onClick={() => {
                  onViewDetails(invitation)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4 text-blue-500" /> View Details
              </button>

              {(invitation.status === 'pending' || invitation.status === 'expired') && (
                <button
                  onClick={() => {
                    onResend(invitation.id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <RotateCw className="h-4 w-4 text-indigo-500" /> Resend Invitation
                </button>
              )}

              <button
                onClick={() => {
                  onEditRole(invitation)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4 text-purple-500" /> Edit Role
              </button>

              {/* {invitation.status === 'accepted' && (
                <button 
                  onClick={() => { 
                    onConvertToEmployee(invitation)
                    setOpen(false) 
                  }} 
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                >
                  <UserCog className="h-4 w-4" /> Convert to Employee
                </button>
              )}
               */}
              <div className="my-1 border-t border-slate-100" />

              {invitation.status === 'pending' && (
                <button
                  onClick={() => {
                    onRevoke(invitation.id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Revoke Invitation
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
})
InvitationActionMenu.displayName = 'InvitationActionMenu'

// ─── Normalize API invitation to local shape ──────────────────────────────
const normalizeInvite = (inv) => {
  // Extract invited_by name - could be UUID or actual name
  const invitedById = inv.invited_by
  const invitedByName = inv.invited_by_name || inv.inviter_name || 'Admin'

  // Format dates
  const createdAt = inv.created_at?.$date || inv.created_at
  const expiresAt = inv.expires_at?.$date || inv.expires_at
  const acceptedAt = inv.accepted_at?.$date || inv.accepted_at

  const sentDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const expiryDate = expiresAt ? new Date(expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const acceptDate = acceptedAt ? new Date(acceptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null

  return {
    id: inv.id || inv._id || `inv-${Date.now()}`,
    email: inv.email || '',
    firstName: inv.first_name || '',
    lastName: inv.last_name || '',
    phone: inv.phone || '',
    roleId: inv.role || inv.role_id || 'employee',
    userType: inv.user_type || 'employee',
    employeeId: inv.employee_id,
    invitedBy: invitedByName,
    invitedById: invitedById,
    invitedAt: sentDate,
    expiresAt: expiryDate,
    acceptedAt: acceptDate,
    status: inv.status || 'pending',
    resentCount: inv.resent_count || 0,
    lastResentAt: inv.last_resent_at,
    createdUserId: inv.created_user_id,
    tenantId: inv.tenant_id,
    tokenHash: inv.token_hash,
    inviteIp: inv.invite_ip,
    acceptIp: inv.accept_ip,
    personalDetails: inv.personal_details_json || {},
    notificationPrefs: inv.notification_prefs_json || {},
    metadata: inv.metadata_json,
  }
}

// ─── Animations ──────────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }
const spring = { type: 'spring', stiffness: 380, damping: 26 }

const UsersAndRolesSection = memo(() => {
  const [invites, setInvites] = useState([])
  const [invitesLoading, setInvitesLoading] = useState(true)
  const [invitesError, setInvitesError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', roleId: '', dept: '', expiresInDays: 7 })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false)
  const [bulkUploadError, setBulkUploadError] = useState('')
  const fileInputRef = useRef(null)
  
  // Fetch roles from API
  const [availableRoles, setAvailableRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(true)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true)
        const response = await roleService.getRoles()
        const rolesData = response?.data?.data || response?.data || []
        const rolesList = Array.isArray(rolesData) ? rolesData : []
        setAvailableRoles(rolesList.map(r => ({
          id: r.id,
          name: r.role_name || r.name,
          role_name: r.role_name || r.name
        })))
        // Set default role if roles are loaded
        if (rolesList.length > 0 && !form.roleId) {
          setForm(f => ({ ...f, roleId: rolesList[0].role_name || rolesList[0].name }))
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err)
        setAvailableRoles([])
      } finally {
        setRolesLoading(false)
      }
    }
    fetchRoles()
  }, [])

  // ─── Fetch invitations from API ───────────────────────────────────────
  const fetchInvitations = async () => {
    setInvitesLoading(true); setInvitesError('')
    try {
      const data = await onboardingService.getInvitations()
      const list = Array.isArray(data) ? data
        : (data?.members || data?.invitations || data?.data || data?.results || [])
      setInvites(list.map(normalizeInvite))
    } catch (err) {
      setInvitesError(err.message || 'Failed to load invitations')
    } finally {
      setInvitesLoading(false)
    }
  }

  useEffect(() => { fetchInvitations() }, [])

  const pendingCount = useMemo(() => invites.filter(i => i.status === 'pending').length, [invites])
  const invitableRolesCount = availableRoles.length

  // ─── Actions ──────────────────────────────────────────────────────────
  const handleSendInvite = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) return
    setInviteLoading(true); setInviteError('')
    try {
      const res = await invitationService.invite({
        email: form.email.trim(),
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        phone: form.phone?.trim() || '',
        role: form.roleId,
        personal_details: {},
        notification_prefs: {},
      })
      setInvites(prev => [{
        id: res?.id || `inv-${Date.now()}`,
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        roleId: form.roleId,
        invitedBy: 'You',
        invitedAt: 'Just now',
        expiresAt: 'in 7d',
        status: 'pending',
        resentCount: 0,
      }, ...prev])
      setForm({ firstName: '', lastName: '', email: '', phone: '', roleId: availableRoles[0]?.name || '', dept: '', expiresInDays: 7 })
      setShowAddModal(false)
      fetchInvitations()
    } catch (err) {
      setInviteError(err.message || 'Failed to send invitation')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleResendInvite = async (id) => {
    try { await invitationService.resend?.(id) } catch (_) { }
    setInvites(prev => prev.map(i => i.id === id ? { ...i, resentCount: i.resentCount + 1, status: 'pending', expiresAt: 'in 7d' } : i))
    fetchInvitations()
  }

  const handleRevokeInvite = async (id) => {
    try {
      await invitationService.revoke(id)
      fetchInvitations()
    } catch (err) {
      alert(err.message || 'Failed to revoke invitation')
    }
  }

  const [viewDetailsModal, setViewDetailsModal] = useState(null)
  const [editRoleModal, setEditRoleModal] = useState(null)

  const handleViewDetails = (inv) => {
    setViewDetailsModal(inv)
  }

  const handleEditRole = (inv) => {
    setEditRoleModal(inv)
  }

  const handleSaveRole = async (invitationId, newRole) => {
    try {
      // TODO: Call API to update role
      // await invitationService.updateRole(invitationId, newRole)

      // Update local state
      setInvites(prev => prev.map(i =>
        i.id === invitationId ? { ...i, roleId: newRole } : i
      ))

      setEditRoleModal(null)
      fetchInvitations() // Refresh from API
    } catch (err) {
      alert(err.message || 'Failed to update role')
    }
  }

  const handleConvertToEmployee = (inv) => {
    if (confirm(`Convert ${inv.firstName} ${inv.lastName} to a full employee?`)) {
      alert(`Converting ${inv.firstName} ${inv.lastName} to employee...`)
      // TODO: Implement API call to convert invitation to employee
    }
  }

  // ─── Bulk CSV Upload ──────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const template = 'email,first_name,last_name,role\n'
      + 'john.doe@company.com,John,Doe,hr_admin\n'
      + 'jane.smith@company.com,Jane,Smith,payroll_admin\n'
      + 'mike.wilson@company.com,Mike,Wilson,recruiter\n'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk_invite_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const parseCSV = (text) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) throw new Error('CSV must have header row and at least one data row')

    const headers = lines[0].split(',').map(h => h.trim())
    const required = ['email', 'first_name', 'last_name', 'role']
    const missing = required.filter(r => !headers.includes(r))
    if (missing.length > 0) throw new Error(`Missing columns: ${missing.join(', ')}`)

    return lines.slice(1).map((line, idx) => {
      const values = line.split(',').map(v => v.trim())
      const row = {}
      headers.forEach((h, i) => row[h] = values[i] || '')
      if (!row.email || !row.first_name || !row.last_name || !row.role) {
        throw new Error(`Row ${idx + 2} has missing required fields`)
      }
      return row
    })
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkUploadLoading(true)
    setBulkUploadError('')

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      console.log('Bulk upload parsed:', rows)

      // Check if backend has bulk API
      if (invitationService.bulkInvite) {
        // Use bulk API if available
        await invitationService.bulkInvite(rows)
      } else {
        // Fallback: Send individual invites
        let success = 0
        let failed = 0
        for (const row of rows) {
          try {
            await invitationService.invite({
              email: row.email,
              first_name: row.first_name,
              last_name: row.last_name,
              role: row.role,
              phone: '',
              personal_details: {},
              notification_prefs: {},
            })
            success++
          } catch (err) {
            console.error(`Failed to invite ${row.email}:`, err)
            failed++
          }
        }
        if (failed > 0) {
          setBulkUploadError(`${success} sent, ${failed} failed`)
        }
      }

      fetchInvitations()
      e.target.value = '' // Reset input
    } catch (err) {
      console.error('Bulk upload error:', err)
      setBulkUploadError(err.message || 'Failed to process CSV')
    } finally {
      setBulkUploadLoading(false)
    }
  }

  return (
    <motion.div className="mx-auto max-w-8xl space-y-5" variants={stagger} initial="hidden" animate="visible">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Users &amp; Roles</h2>
          <p className="text-sm text-slate-500">Manage team invitations and access.</p>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" /> Invite user
        </motion.button>
      </motion.div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total invitations', value: invites.length, icon: Mail, tone: 'bg-blue-100 text-blue-700' },
          { label: 'Pending invites', value: pendingCount, icon: Clock, tone: 'bg-amber-100 text-amber-700' },
          { label: 'Invitable roles', value: invitableRolesCount, icon: Shield, tone: 'bg-violet-100 text-violet-700' },
        ].map(s => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} variants={fadeUp}
              whileHover={{ y: -3, boxShadow: '0 10px 24px -4px rgb(0 0 0 / 0.10)' }}
              transition={spring}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-600">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* ── Invitations list ───────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="flex-1 text-xs text-blue-900">
            Invitations expire after <b>7 days</b>. Tokens are SHA-256 hashed and one-time-use.
            Re-sending generates a new token and resets expiry.
          </p>
          <button onClick={fetchInvitations} disabled={invitesLoading}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50">
            <RefreshCw className={`h-3 w-3 ${invitesLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {invitesError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {invitesError}
          </div>
        )}

        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-visible">
          <div className="hidden grid-cols-[1.6fr_1fr_1fr_0.6fr_0.6fr_120px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:grid">
            <div>Invited person</div>
            <div>Role</div>
            <div>Invited by</div>
            <div>Expires</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-slate-100">
            {invitesLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              </div>
            )}
            <AnimatePresence initial={false}>
              {!invitesLoading && invites.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="px-6 py-12 text-center text-sm text-slate-500">
                  No invitations yet. Send your first invite ↑
                </motion.div>
              )}
              {invites.map((inv, i) => {
                const role = TENANT_ROLE_MAP[inv.roleId]
                const canResend = inv.status === 'pending' || inv.status === 'expired'
                const initials = ((inv.firstName[0] || '') + (inv.lastName[0] || '')).toUpperCase() || inv.email[0]?.toUpperCase()
                return (
                  <motion.div key={inv.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03, ...spring }}
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    className="grid grid-cols-1 gap-3 px-4 py-3 lg:grid-cols-[1.6fr_1fr_1fr_0.6fr_0.6fr_120px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${role?.avatarClass || 'bg-slate-400'}`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">{inv.firstName} {inv.lastName}</p>
                        <p className="truncate text-xs text-slate-500">{inv.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${role?.badgeClass || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        <Shield className="h-3 w-3" /> {role?.name || inv.roleId}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-slate-700">{inv.invitedBy}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" /> {inv.expiresAt}
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${INVITATION_STATUS_TONE[inv.status] || 'bg-slate-100 text-slate-600'}`}>
                        {inv.status}
                        {inv.resentCount > 0 && <span className="text-[9px] opacity-70">·{inv.resentCount}</span>}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <InvitationActionMenu
                        invitation={inv}
                        onResend={handleResendInvite}
                        onRevoke={handleRevokeInvite}
                        onViewDetails={handleViewDetails}
                        onEditRole={handleEditRole}
                        onConvertToEmployee={handleConvertToEmployee}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Bulk CSV */}
        <motion.div variants={fadeUp} whileHover={{ y: -2 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Bulk invite via CSV</p>
              <p className="text-xs text-slate-500">Columns: <code className="font-mono text-[11px]">email, first_name, last_name, role</code></p>
              {bulkUploadError && <p className="text-xs text-red-600 mt-1">{bulkUploadError}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Download template
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={bulkUploadLoading}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {bulkUploadLoading ? 'Uploading...' : 'Upload CSV'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleBulkUpload}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Invite modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}>
            <motion.form onSubmit={handleSendInvite} onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={spring}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Invite a user</h3>
                    <p className="text-[11px] text-slate-500">An email with a one-time setup link will be sent</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">First name *</label>
                    <input type="text" required value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder="Aisha"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Last name *</label>
                    <input type="text" required value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      placeholder="Khan"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email *</label>
                  <input type="email" required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="aisha@yourcompany.com"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Assign role *</label>
                  <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                    {rolesLoading ? (
                      <div className="col-span-full text-center py-4 text-sm text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading roles...
                      </div>
                    ) : availableRoles.length === 0 ? (
                      <div className="col-span-full text-center py-4 text-sm text-slate-500">
                        No roles available
                      </div>
                    ) : (
                      availableRoles.map(r => {
                        const selected = form.roleId === r.name
                        return (
                          <motion.button key={r.id} type="button"
                            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setForm(f => ({ ...f, roleId: r.name }))}
                            className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition ${selected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}>
                            <div className="flex w-full items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white bg-blue-600">
                                {r.name?.charAt(0)?.toUpperCase() || 'R'}
                              </span>
                              <span className="truncate text-xs font-semibold text-slate-800">{r.name}</span>
                            </div>
                            <p className="line-clamp-2 text-[10px] leading-snug text-slate-500">Role: {r.name}</p>
                          </motion.button>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                <div className="flex-1">
                  {inviteError && (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {inviteError}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowAddModal(false); setInviteError('') }}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                    Cancel
                  </button>
                  <motion.button type="submit" disabled={inviteLoading}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
                    {inviteLoading
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</>
                      : <><Send className="h-3.5 w-3.5" /> Send invite</>
                    }
                  </motion.button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── View Details Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {viewDetailsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() => setViewDetailsModal(null)}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={spring}
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${TENANT_ROLE_MAP[viewDetailsModal.roleId]?.avatarClass || 'bg-slate-400'}`}>
                    {((viewDetailsModal.firstName[0] || '') + (viewDetailsModal.lastName[0] || '')).toUpperCase() || viewDetailsModal.email[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {viewDetailsModal.firstName} {viewDetailsModal.lastName}
                    </h3>
                    <p className="text-sm text-slate-600">{viewDetailsModal.email}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setViewDetailsModal(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold capitalize ${INVITATION_STATUS_TONE[viewDetailsModal.status] || 'bg-slate-100 text-slate-600'}`}>
                    <span className={`h-2 w-2 rounded-full ${viewDetailsModal.status === 'accepted' ? 'bg-green-500' :
                        viewDetailsModal.status === 'pending' ? 'bg-amber-500' :
                          viewDetailsModal.status === 'expired' ? 'bg-red-500' :
                            'bg-slate-400'
                      }`} />
                    {viewDetailsModal.status}
                  </span>
                  {viewDetailsModal.resentCount > 0 && (
                    <span className="text-xs text-slate-500">
                      Resent {viewDetailsModal.resentCount} time{viewDetailsModal.resentCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {TENANT_ROLE_MAP[viewDetailsModal.roleId]?.name || viewDetailsModal.roleId}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {TENANT_ROLE_MAP[viewDetailsModal.roleId]?.description || 'No description'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-indigo-600" />
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 break-all">
                      {viewDetailsModal.email}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Invited By</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {viewDetailsModal.invitedBy}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Expires</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {viewDetailsModal.expiresAt}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-slate-600" />
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Invitation ID</p>
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-900 break-all">
                      {viewDetailsModal.id}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                {viewDetailsModal.status === 'accepted' && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-green-900">Invitation Accepted</p>
                        <p className="text-xs text-green-700 mt-1">
                          This user has successfully accepted the invitation and can now access the platform.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {viewDetailsModal.status === 'pending' && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">Awaiting Response</p>
                        <p className="text-xs text-amber-700 mt-1">
                          The invitation email has been sent. Waiting for the user to accept.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {viewDetailsModal.status === 'expired' && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-900">Invitation Expired</p>
                        <p className="text-xs text-red-700 mt-1">
                          This invitation has expired. You can resend a new invitation to this user.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button type="button" onClick={() => setViewDetailsModal(null)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                  Close
                </button>
                {(viewDetailsModal.status === 'pending' || viewDetailsModal.status === 'expired') && (
                  <motion.button type="button"
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      handleResendInvite(viewDetailsModal.id)
                      setViewDetailsModal(null)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                    <RotateCw className="h-3.5 w-3.5" /> Resend Invitation
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Role Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {editRoleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() => setEditRoleModal(null)}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={spring}
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Edit Role</h3>
                    <p className="text-sm text-slate-600">
                      {editRoleModal.firstName} {editRoleModal.lastName}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => setEditRoleModal(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Current Role</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {availableRoles.find(r => r.name === editRoleModal.roleId)?.name || editRoleModal.roleId}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Select New Role
                  </label>
                  <div className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto pr-2 sm:grid-cols-3">
                    {rolesLoading ? (
                      <div className="col-span-full text-center py-4 text-sm text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading roles...
                      </div>
                    ) : availableRoles.length === 0 ? (
                      <div className="col-span-full text-center py-4 text-sm text-slate-500">
                        No roles available
                      </div>
                    ) : (
                      availableRoles.map(r => {
                        const selected = editRoleModal.roleId === r.name
                        return (
                          <motion.button key={r.id} type="button"
                            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setEditRoleModal({ ...editRoleModal, roleId: r.name })}
                            className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition ${selected ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-100' : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}>
                            <div className="flex w-full items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white bg-purple-600">
                                {r.name?.charAt(0)?.toUpperCase() || 'R'}
                              </span>
                              <span className="truncate text-sm font-semibold text-slate-800">{r.name}</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-slate-600">Role: {r.name}</p>
                          </motion.button>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Role Permissions Preview */}
                {availableRoles.find(r => r.name === editRoleModal.roleId) && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Selected Role
                    </p>
                    <p className="text-sm text-slate-700">
                      {availableRoles.find(r => r.name === editRoleModal.roleId)?.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button type="button" onClick={() => setEditRoleModal(null)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                  Cancel
                </button>
                <motion.button type="button"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleSaveRole(editRoleModal.id, editRoleModal.roleId)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700">
                  <Shield className="h-3.5 w-3.5" /> Save Role
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

UsersAndRolesSection.displayName = 'UsersAndRolesSection'
export default UsersAndRolesSection
