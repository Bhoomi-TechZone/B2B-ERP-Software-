import { useState } from 'react'
import { Users, ChevronRight, User, Mail, Phone } from 'lucide-react'

const TEAM_STRUCTURE = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    role: 'Department Head - Sales',
    email: 'rajesh@workmatrix.com',
    phone: '+91-98765-43210',
    reports: 15,
    children: [
      {
        id: '2',
        name: 'Priya Sharma',
        role: 'Team Lead - Enterprise Sales',
        email: 'priya@workmatrix.com',
        phone: '+91-98765-43211',
        reports: 5,
        children: [
          { id: '3', name: 'Amit Singh', role: 'Sales Rep', email: 'amit@workmatrix.com', reports: 0 },
          { id: '4', name: 'Neha Patel', role: 'Sales Rep', email: 'neha@workmatrix.com', reports: 0 },
        ],
      },
      {
        id: '5',
        name: 'Vikram Reddy',
        role: 'Team Lead - SMB Sales',
        email: 'vikram@workmatrix.com',
        phone: '+91-98765-43212',
        reports: 4,
        children: [
          { id: '6', name: 'Anjali Gupta', role: 'Sales Rep', email: 'anjali@workmatrix.com', reports: 0 },
          { id: '7', name: 'Rahul Verma', role: 'Sales Rep', email: 'rahul@workmatrix.com', reports: 0 },
        ],
      },
    ],
  },
]

const TeamMember = ({ member, level = 0 }) => {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = member.children && member.children.length > 0

  const getRoleColor = (role) => {
    if (role.includes('Head')) return 'bg-purple-100 text-purple-700'
    if (role.includes('Lead')) return 'bg-blue-100 text-blue-700'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-2">
      <div
        className={`rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all ${
          level > 0 ? 'ml-8' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            {hasChildren && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <ChevronRight
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    expanded ? 'rotate-90' : ''
                  }`}
                />
              </button>
            )}
            <div className="rounded-lg bg-blue-50 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{member.name}</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleColor(member.role)}`}>
                  {member.role}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {member.email}
                </div>
                {member.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {member.phone}
                  </div>
                )}
              </div>
            </div>
            {member.reports > 0 && (
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Direct Reports</p>
                <p className="text-lg font-bold text-slate-900">{member.reports}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="space-y-2">
          {member.children.map((child) => (
            <TeamMember key={child.id} member={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

const TeamHierarchyPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">16. Team Hierarchy</h1>
        <p className="mt-1 text-sm text-slate-600">
          Internal team structure
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Department Heads</p>
              <p className="text-2xl font-bold text-slate-900">3</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Team Leads</p>
              <p className="text-2xl font-bold text-slate-900">8</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Team Members</p>
              <p className="text-2xl font-bold text-slate-900">45</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Staff</p>
              <p className="text-2xl font-bold text-slate-900">56</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-4">
        {TEAM_STRUCTURE.map((member) => (
          <TeamMember key={member.id} member={member} />
        ))}
      </div>
    </div>
  )
}

export default TeamHierarchyPage
