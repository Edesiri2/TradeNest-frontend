import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../../lib/store/useUserStore';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import { usePermissions, PermissionGuard } from '../../../lib/utils/permission';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Filter, Mail, Shield } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Table from '../../../components/ui/Table';
import { formatDate } from '../../../lib/utils/utils';

interface UsersListProps {
  onEditUser: (user: any) => void;
  onDeleteUser: (user: any) => void;
  onCreateUser: () => void;
}

const UsersList: React.FC<UsersListProps> = ({ onEditUser, onDeleteUser, onCreateUser }) => {
  const { users, loading, pagination, fetchUsers } = useUserStore();
  const { token } = useAuthStore();
  const { canCreateUsers, canEditUsers, canDeleteUsers, user: currentUser } = usePermissions();
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (token) {
      fetchUsers();
      // Fetch roles for filter dropdown
      fetchRoles();
    }
  }, [token]);

  const fetchRoles = async () => {
    try {
      // Implement this API call
      // const response = await fetch('/api/roles');
      // const data = await response.json();
      // setRoles(data.roles);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleSearch = () => {
    fetchUsers({
      search,
      role: roleFilter || undefined,
      isActive: statusFilter || undefined,
      page: 1
    });
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'super_admin': return 'from-purple-500 to-purple-700';
      case 'admin': return 'from-red-500 to-red-700';
      case 'manager': return 'from-blue-500 to-blue-700';
      case 'staff': return 'from-green-500 to-green-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const columns = [
    {
      key: 'fullName',
      title: 'User',
      render: (value: any, record: any) => (
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRoleColor(record.role.name)} flex items-center justify-center mr-3`}>
            <span className="text-white font-medium">
              {record.firstName?.charAt(0)}{record.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.fullName}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Mail size={12} />
              {record.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRoleColor(value.name)} flex items-center justify-center`}>
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-medium capitalize">{value.name.replace('_', ' ')}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: any, record: any) => (
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium w-fit ${
            record.isActive 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' 
              : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
          }`}>
            {record.isActive ? <UserCheck size={12} className="mr-1" /> : <UserX size={12} className="mr-1" />}
            {record.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${
            record.isEmailVerified 
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700' 
              : 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700'
          }`}>
            {record.isEmailVerified ? 'Verified' : 'Pending'}
          </span>
        </div>
      )
    },
    {
      key: 'lastLogin',
      title: 'Last Activity',
      render: (value: string) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {value ? formatDate(new Date(value)) : 'Never'}
          </div>
          <div className="text-gray-500 text-xs">
            {value ? formatDate(new Date(value)) : 'No activity'}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right' as const,
      render: (value: any, record: any) => (
        <div className="flex justify-end gap-2">
          <PermissionGuard requiredPermission="users.update">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditUser(record)}
              disabled={record.id === currentUser?.id || !canEditUsers}
              className="hover:bg-indigo-50 text-indigo-600"
            >
              <Edit size={16} />
              <span className="sr-only">Edit</span>
            </Button>
          </PermissionGuard>
          <PermissionGuard requiredPermission="users.delete">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteUser(record)}
              disabled={record.id === currentUser?.id || !canDeleteUsers}
              className="hover:bg-red-50 text-red-600"
            >
              <Trash2 size={16} />
              <span className="sr-only">Delete</span>
            </Button>
          </PermissionGuard>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <PermissionGuard requiredPermission="users.create">
          <Button 
            variant="primary" 
            onClick={onCreateUser} 
            icon={Plus}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Add User
          </Button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              icon={Search}
              className="bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <select
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.name}>
                  {role.name.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSearch} 
              icon={Filter}
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              Apply Filters
            </Button>
            {(search || roleFilter || statusFilter) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearch('');
                  setRoleFilter('');
                  setStatusFilter('');
                  fetchUsers();
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          data={users}
          emptyText={
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <UserX size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                {search || roleFilter || statusFilter 
                  ? 'Try adjusting your filters or search term'
                  : 'Get started by adding your first user'
                }
              </p>
            </div>
          }
          onRowClick={(record: any) => onEditUser(record)}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{(pagination.currentPage - 1) * 20 + 1}</span> to{' '}
            <span className="font-medium text-gray-900">{Math.min(pagination.currentPage * 20, pagination.totalUsers)}</span> of{' '}
            <span className="font-medium text-gray-900">{pagination.totalUsers}</span> users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchUsers({ page: pagination.currentPage - 1 })}
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => fetchUsers({ page: pagination.currentPage + 1 })}
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;