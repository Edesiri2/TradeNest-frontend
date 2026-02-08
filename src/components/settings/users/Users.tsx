import React, { useState } from 'react';
import { useUserStore } from '../../../lib/store/useUserStore';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import { usePermissions } from '../../../lib/utils/permission';
import { Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import UsersList from './UsersList';
import UserForm from './UserForm';

const Users: React.FC = () => {
  const { createUser, updateUser, deleteUser, setSelectedUser, selectedUser } = useUserStore();
//   const { token } = useAuthStore();
//   const { canCreateUsers, canEditUsers, canDeleteUsers } = usePermissions();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (userData: any) => {
    setIsLoading(true);
    try {
      await createUser(userData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await updateUser(selectedUser.id, userData);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  return (
    <div className="p-6">
      <UsersList
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteClick}
        onCreateUser={() => setShowCreateModal(true)}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="lg"
      >
        <UserForm
          isEditing={false}
          isLoading={isLoading}
          onSave={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        {selectedUser && (
          <UserForm
            user={selectedUser}
            isEditing={true}
            isLoading={isLoading}
            onSave={handleUpdateUser}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User Account</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedUser.fullName}</span>?
                This action cannot be undone.
              </p>
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 text-sm text-gray-700">
                <div className="font-medium mb-2 text-red-700">⚠️ Important Notice</div>
                <ul className="space-y-1 text-left">
                  <li>• User will lose all access to the system</li>
                  <li>• Associated data will be anonymized</li>
                  <li>• Email can be reused for new accounts</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteUser}
                disabled={isLoading}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                {isLoading ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;