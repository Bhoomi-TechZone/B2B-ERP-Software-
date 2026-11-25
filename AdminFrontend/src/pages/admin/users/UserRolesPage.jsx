import { useState, useEffect } from 'react';
import { roleService } from '../../../services/roleService';
import { toast } from 'react-hot-toast';
import { 
  UserPlus, Search, Edit2, Trash2, Shield, ChevronDown, ChevronUp,
  Check, X
} from 'lucide-react';

// Module definitions
const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'employees', label: 'Employees' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'leaves', label: 'Leave Management' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'recruitment', label: 'Recruitment' },
  { key: 'crm', label: 'CRM' },
  { key: 'billing', label: 'Billing' },
  { key: 'reports', label: 'Reports & Analytics' },
  { key: 'settings', label: 'Settings' },
  { key: 'projects', label: 'Projects' },
  { key: 'projects_employee', label: 'Tasks (Employee)' },
  { key: 'onboarding', label: 'Onboarding' }
];

const PERMISSIONS = ['read', 'write', 'delete', 'export', 'approve'];

const UserRolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Load roles
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await roleService.getAllRoles(search);
      setRoles(response.data || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (roleId, module, permission, currentValue) => {
    try {
      await roleService.togglePermission(roleId, {
        module,
        permission,
        value: !currentValue
      });
      
      // Update local state
      setRoles(roles.map(role => {
        if (role.id === roleId) {
          const updatedModules = role.modules || [];
          const moduleIndex = updatedModules.findIndex(m => m.module_name === module);
          
          if (moduleIndex >= 0) {
            updatedModules[moduleIndex][permission] = !currentValue;
          } else {
            updatedModules.push({
              module_name: module,
              [permission]: !currentValue
            });
          }
          
          return {
            ...role,
            modules: updatedModules
          };
        }
        return role;
      }));
      
      toast.success('Permission updated');
    } catch (error) {
      console.error('Failed to toggle permission:', error);
      toast.error('Failed to update permission');
    }
  };

  const deleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await roleService.deleteRole(roleId);
      setRoles(roles.filter(r => r.id !== roleId));
      toast.success('Role deleted successfully');
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Failed to delete role');
    }
  };

  const getPermissionValue = (role, module, permission) => {
    const roleModule = role.modules?.find(m => m.module_name === module);
    return roleModule?.[permission] || false;
  };

  const filteredRoles = roles.filter(role =>
    role.role_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users & Permissions</h1>
            <p className="text-gray-600 mt-1">Manage global roles and system-wide user access</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <UserPlus size={20} />
            Create Role
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {filteredRoles.map((role) => {
          const isExpanded = expandedRoleId === role.id;
          const totalPerms = role.total_permissions || 0;
          
          return (
            <div key={role.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              {/* Role Header */}
              <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{role.role_name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <span>{totalPerms}/3 settings</span>
                      {role.is_system_role && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          Custom
                        </span>
                      )}
                      <span className="capitalize">{role.status || 'Active'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedRoleId(isExpanded ? null : role.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <button
                    onClick={() => setEditingRole(role)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  {!role.is_system_role && (
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Permission Matrix (Expanded) */}
              {isExpanded && (
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Module</th>
                          {PERMISSIONS.map(perm => (
                            <th key={perm} className="text-center py-3 px-4 font-semibold text-gray-700 capitalize">
                              {perm}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {MODULES.map((module) => (
                          <tr key={module.key} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{module.label}</td>
                            {PERMISSIONS.map(perm => {
                              const value = getPermissionValue(role, module.key, perm);
                              return (
                                <td key={perm} className="text-center py-3 px-4">
                                  <button
                                    onClick={() => togglePermission(role.id, module.key, perm, value)}
                                    className={`w-10 h-6 rounded-full transition-colors relative ${
                                      value ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                        value ? 'right-1' : 'left-1'
                                      }`}
                                    />
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new role.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserRolesPage;
