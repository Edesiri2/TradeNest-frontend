import React, { useEffect, useState } from 'react';
import { useRoleStore } from '../../lib/store/useRoleStore';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { usePermissions, PermissionGuard } from '../../lib/utils/permission';
import { Search, Plus, Edit, Trash2, Shield, Key, Check, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { getPermissionDisplayName, groupPermissionsByModule } from '../../lib/utils/permission';
import { formatDate } from '../../lib/utils/utils';

const Roles: React.FC = () => {
  const { roles, permissions, permissionGroups, loading, error, fetchRoles, fetchPermissions, createRole, updateRole, deleteRole, setSelectedRole, selectedRole } = useRoleStore();
  const { token } = useAuthStore();
  const { canCreateRoles, canEditRoles, canDeleteRoles } = usePermissions();
  
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    if (token) {
      fetchRoles();
      fetchPermissions();
    }
  }, [token]);

  const handleCreateRole = async () => {
    try {
      await createRole(newRole);
      setShowCreateModal(false);
      setNewRole({
        name: '',
        description: '',
        permissions: []
      });
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    
    try {
      await updateRole(selectedRole.id, {
        name: selectedRole.name,
        description: selectedRole.description,
        permissions: selectedRole.permissions.map(p => p.id)
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
      await deleteRole(selectedRole.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  const handleEditClick = (role: any) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleDeleteClick = (role: any) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const handlePermissionsClick = (role: any) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  };

  const togglePermission = (permissionId: string) => {
    if (!selectedRole) return;
    
    const hasPermission = selectedRole.permissions.some(p => p.id === permissionId);
    
    if (hasPermission) {
      setSelectedRole({
        ...selectedRole,
        permissions: selectedRole.permissions.filter(p => p.id !== permissionId)
      });
    } else {
      const permission = permissions.find(p => p.id === permissionId);
      if (permission) {
        setSelectedRole({
          ...selectedRole,
          permissions: [...selectedRole.permissions, permission]
        });
      }
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Role',
      render: (value: string, record: any) => (
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            value === 'super_admin' ? 'bg-purple-100' :
            value === 'admin' ? 'bg-red-100' :
            value === 'manager' ? 'bg-blue-100' :
            value === 'staff' ? 'bg-green-100' :
            'bg-gray-100'
          }`}>
            <Shield size={20} className={
              value === 'super_admin' ? 'text-purple-600' :
              value === 'admin' ? 'text-red-600' :
              value === 'manager' ? 'text-blue-600' :
              value === 'staff' ? 'text-green-600' :
              'text-gray-600'
            } />
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'permissions',
      title: 'Permissions',
      render: (value: any[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((permission, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {getPermissionDisplayName(permission.name)}
            </span>
          ))}
          {value.length > 3 && (
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
              +{value.length - 3} more
            </span>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (value: boolean) => (
        <span className={`flex items-center ${value ? 'text-green-600' : 'text-red-600'}`}>
          {value ? <Check size={16} className="mr-1" /> : <X size={16} className="mr-1" />}
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value: string) => (
        <span>{formatDate(new Date(value))}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, record: any) => (
        <div className="flex space-x-2">
          <PermissionGuard requiredPermission="roles.update">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(record)}
              disabled={!canEditRoles || record.name === 'super_admin'}
            >
              <Edit size={16} />
            </Button>
          </PermissionGuard>
          <PermissionGuard requiredPermission="roles.update">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePermissionsClick(record)}
              disabled={!canEditRoles}
            >
              <Key size={16} />
            </Button>
          </PermissionGuard>
          <PermissionGuard requiredPermission="roles.delete">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(record)}
              disabled={!canDeleteRoles || record.name === 'super_admin'}
            >
              <Trash2 size={16} />
            </Button>
          </PermissionGuard>
        </div>
      )
    }
  ];

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase()) ||
    role.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Role Management</h1>
        <p className="text-gray-600">Manage user roles and permissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="w-64">
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <PermissionGuard requiredPermission="roles.create">
            <Button variant="primary" onClick={() => setShowCreateModal(true)} icon={Plus}>
              Add Role
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={filteredRoles}
        //   loading={loading}
          emptyText="No roles found"
        />
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Role"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Role Name"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            placeholder="e.g., inventory_manager"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              rows={3}
              placeholder="Describe the role's purpose and permissions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              {Object.entries(permissionGroups).map(([module, modulePermissions]) => (
                <div key={module} className="mb-4 last:mb-0">
                  <h4 className="font-medium text-gray-800 mb-2 capitalize">{module}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {modulePermissions.map(permission => (
                      <label key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newRole.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRole({
                                ...newRole,
                                permissions: [...newRole.permissions, permission.id]
                              });
                            } else {
                              setNewRole({
                                ...newRole,
                                permissions: newRole.permissions.filter(id => id !== permission.id)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{getPermissionDisplayName(permission.name)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateRole}>
            Create Role
          </Button>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Role"
        size="lg"
      >
        {selectedRole && (
          <div className="space-y-4">
            <Input
              label="Role Name"
              value={selectedRole.name}
              onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
              required
              disabled={selectedRole.name === 'super_admin'}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedRole.description}
                onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateRole}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title={`${selectedRole?.name} - Permissions`}
        size="xl"
      >
        {selectedRole && (
          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              Manage permissions for the {selectedRole.name} role. Changes will affect all users with this role.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(permissionGroups).map(([module, modulePermissions]) => (
                <div key={module} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3 capitalize text-lg">{module}</h4>
                  <div className="space-y-2">
                    {modulePermissions.map(permission => {
                      const isChecked = selectedRole.permissions.some(p => p.id === permission.id);
                      return (
                        <label key={permission.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(permission.id)}
                              className="mr-3"
                              disabled={selectedRole.name === 'super_admin'}
                            />
                            <div>
                              <div className="font-medium">{getPermissionDisplayName(permission.name)}</div>
                              <div className="text-xs text-gray-500">{permission.description}</div>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            permission.action === 'create' ? 'bg-green-100 text-green-800' :
                            permission.action === 'read' ? 'bg-blue-100 text-blue-800' :
                            permission.action === 'update' ? 'bg-yellow-100 text-yellow-800' :
                            permission.action === 'delete' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {permission.action}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setShowPermissionsModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateRole}>
            Save Permissions
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Role"
        size="sm"
      >
        {selectedRole && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">
              You are about to delete the "{selectedRole.name}" role. This action cannot be undone.
            </p>
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDeleteRole} className="bg-red-600 hover:bg-red-700">
            Delete Role
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Roles;