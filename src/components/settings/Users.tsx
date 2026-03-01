import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../lib/store/useUserStore';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useRoleStore } from '../../lib/store/useRoleStore';
import { usePermissions, PermissionGuard } from '../../lib/utils/permission';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Filter } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { formatDate } from '../../lib/utils/utils';
import { locationAPI } from '../../lib/api/locationApi';

interface OutletOption {
  id: string;
  name: string;
  code: string;
}

const Users: React.FC = () => {
  const { users, pagination, fetchUsers, createUser, updateUser, deleteUser, setSelectedUser, selectedUser } = useUserStore();
  const { roles, fetchRoles } = useRoleStore();
  const { token } = useAuthStore();
  const { canEditUsers, canDeleteUsers, user: currentUser } = usePermissions();
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [outlets, setOutlets] = useState<OutletOption[]>([]);
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: '',
    outletId: '',
    isActive: true
  });

  const getRoleId = (user: any) => user?.role?.id || user?.role?._id || user?.roleId || '';
  const getOutletId = (user: any) => user?.outletId || user?.outlet?.id || user?.outlet?._id || '';

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchRoles();
    }
  }, [token, fetchUsers, fetchRoles]);

  useEffect(() => {
    const loadOutlets = async () => {
      try {
        const response = await locationAPI.getOutlets();
        const mappedOutlets = (response.data || [])
          .filter((outlet: any) => outlet.isActive)
          .map((outlet: any) => ({
            id: outlet._id,
            name: outlet.name,
            code: outlet.code
          }));
        setOutlets(mappedOutlets);
      } catch (outletError) {
        console.error('Failed to load outlets for user assignment:', outletError);
      }
    };

    loadOutlets();
  }, []);

  const handleSearch = () => {
    fetchUsers({
      search,
      role: roleFilter || undefined,
      isActive: statusFilter || undefined,
      page: 1
    });
  };

  const handleCreateUser = async () => {
    try {
      await createUser(newUser);
      setShowCreateModal(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roleId: '',
        outletId: '',
        isActive: true
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const roleId = getRoleId(selectedUser);
      const selectedRole = roles.find((role) => role.id === roleId);
      const isSuperAdmin = selectedRole?.name === 'super_admin';

      await updateUser(selectedUser.id, {
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        roleId,
        outletId: isSuperAdmin ? '' : getOutletId(selectedUser),
        isActive: selectedUser.isActive
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleEditClick = (user: any) => {
    const normalizedRoleId = getRoleId(user);
    const normalizedOutletId = getOutletId(user);

    setSelectedUser({
      ...user,
      role: {
        ...user.role,
        id: normalizedRoleId
      },
      outletId: normalizedOutletId
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const selectedRoleName = roles.find((role) => role.id === newUser.roleId)?.name || '';
  const isSuperAdminRole = selectedRoleName === 'super_admin';
  const selectedEditRoleId = selectedUser ? getRoleId(selectedUser) : '';
  const selectedEditRole = roles.find((role) => role.id === selectedEditRoleId);
  const isEditSuperAdminRole = selectedEditRole?.name === 'super_admin';
  const selectedEditOutletId = selectedUser ? getOutletId(selectedUser) : '';

  const columns = [
    {
      key: 'fullName',
      title: 'Name',
      render: (_value: any, record: any) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-blue-600 font-medium">
              {record.firstName?.charAt(0)}{record.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium">{record.fullName}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (value: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value.name === 'super_admin' ? 'bg-purple-100 text-purple-800' :
          value.name === 'admin' ? 'bg-red-100 text-red-800' :
          value.name === 'manager' ? 'bg-blue-100 text-blue-800' :
          value.name === 'staff' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.name}
        </span>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (value: boolean) => (
        <span className={`flex items-center ${value ? 'text-green-600' : 'text-red-600'}`}>
          {value ? <UserCheck size={16} className="mr-1" /> : <UserX size={16} className="mr-1" />}
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'isEmailVerified',
      title: 'Verified',
      render: (isVerified: boolean) => (
        <span className={isVerified ? 'text-green-600' : 'text-yellow-600'}>
          {isVerified ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (lastLogin: string) => (
        <span>{lastLogin ? formatDate(new Date(lastLogin)) : 'Never'}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_value: any, record: any) => (
        <div className="flex space-x-2">
          <PermissionGuard requiredPermission="users.update">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(record)}
              disabled={record.id === currentUser?.id || !canEditUsers}
            >
              <Edit size={16} />
            </Button>
          </PermissionGuard>
          <PermissionGuard requiredPermission="users.delete">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(record)}
              disabled={record.id === currentUser?.id || !canDeleteUsers}
            >
              <Trash2 size={16} />
            </Button>
          </PermissionGuard>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-gray-600">Manage users, roles, and permissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSearch} icon={Filter}>
              Apply Filters
            </Button>
            <PermissionGuard requiredPermission="users.create">
              <Button variant="primary" onClick={() => setShowCreateModal(true)} icon={Plus}>
                Add User
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={users}
        //   loading={loading}
          emptyText="No users found"
          onRowClick={(record) => setSelectedUser(record)}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalUsers)} of {pagination.totalUsers} users
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchUsers({ page: pagination.currentPage - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => fetchUsers({ page: pagination.currentPage + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newUser.firstName}
              onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={newUser.lastName}
              onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email Address"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newUser.roleId}
              onChange={(e) => {
                const nextRoleId = e.target.value;
                const nextRole = roles.find((role) => role.id === nextRoleId);
                const shouldClearOutlet = nextRole?.name === 'super_admin';
                setNewUser({
                  ...newUser,
                  roleId: nextRoleId,
                  outletId: shouldClearOutlet ? '' : newUser.outletId
                });
              }}
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outlet {isSuperAdminRole ? '(Not required for super admin)' : '*'}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newUser.outletId}
              onChange={(e) => setNewUser({ ...newUser, outletId: e.target.value })}
              disabled={isSuperAdminRole}
              required={!isSuperAdminRole}
            >
              <option value="">{isSuperAdminRole ? 'System generated user' : 'Select Outlet'}</option>
              {outlets.map(outlet => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name} ({outlet.code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={newUser.isActive}
              onChange={(e) => setNewUser({ ...newUser, isActive: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              User is active
            </label>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateUser}>
            Create User
          </Button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={selectedUser.firstName}
                onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={selectedUser.lastName}
                onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedEditRoleId}
                onChange={(e) => {
                  const nextRoleId = e.target.value;
                  const nextRole = roles.find((role) => role.id === nextRoleId);
                  const shouldClearOutlet = nextRole?.name === 'super_admin';

                  setSelectedUser({
                    ...selectedUser,
                    role: {
                      ...selectedUser.role,
                      id: nextRoleId,
                      name: nextRole?.name || selectedUser.role.name,
                      description: nextRole?.description || selectedUser.role.description
                    },
                    outletId: shouldClearOutlet ? '' : getOutletId(selectedUser)
                  });
                }}
                required
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outlet {isEditSuperAdminRole ? '(Not required for super admin)' : '*'}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedEditOutletId}
                onChange={(e) => setSelectedUser({ ...selectedUser, outletId: e.target.value })}
                disabled={isEditSuperAdminRole}
                required={!isEditSuperAdminRole}
              >
                <option value="">
                  {isEditSuperAdminRole ? 'System generated user' : 'Select Outlet'}
                </option>
                {outlets.map(outlet => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name} ({outlet.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editIsActive"
                checked={selectedUser.isActive}
                onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="editIsActive" className="text-sm text-gray-700">
                User is active
              </label>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="sm"
      >
        {selectedUser && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">
              You are about to deactivate {selectedUser.fullName}. This action cannot be undone.
            </p>
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
            Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
