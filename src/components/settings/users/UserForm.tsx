import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, UserCheck, UserX, Shield, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

interface UserFormProps {
  user?: any;
  isEditing?: boolean;
  isLoading?: boolean;
  onSave: (userData: any) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, isEditing = false, isLoading = false, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: '',
    isActive: true,
    sendWelcomeEmail: true
  });

  const [roles, setRoles] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        roleId: user.role?.id || '',
        isActive: user.isActive ?? true,
        sendWelcomeEmail: true
      });
    }
    fetchRoles();
  }, [user]);

  const fetchRoles = async () => {
    try {
      // Implement API call to fetch roles
      // const response = await fetch('/api/roles');
      // const data = await response.json();
      // setRoles(data.roles);
      
      // Mock data for now
      setRoles([
        { id: '1', name: 'super_admin', description: 'Full system access' },
        { id: '2', name: 'admin', description: 'Administrative access' },
        { id: '3', name: 'manager', description: 'Managerial access' },
        { id: '4', name: 'staff', description: 'Staff access' },
        { id: '5', name: 'viewer', description: 'Read-only access' }
      ]);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!isEditing) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'super_admin': return 'bg-gradient-to-r from-purple-500 to-purple-700';
      case 'admin': return 'bg-gradient-to-r from-red-500 to-red-700';
      case 'manager': return 'bg-gradient-to-r from-blue-500 to-blue-700';
      case 'staff': return 'bg-gradient-to-r from-green-500 to-green-700';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-700';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Edit User' : 'Create New User'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditing 
            ? 'Update user details and permissions' 
            : 'Add a new user to the system'
          }
        </p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, firstName: e.target.value });
              if (errors.firstName) setErrors({ ...errors, firstName: '' });
            }}
            icon={User}
            error={errors.firstName}
            placeholder="John"
            required
            className="bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, lastName: e.target.value });
              if (errors.lastName) setErrors({ ...errors, lastName: '' });
            }}
            icon={User}
            error={errors.lastName}
            placeholder="Doe"
            required
            className="bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Email & Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            icon={Mail}
            error={errors.email}
            placeholder="user@example.com"
            required={!isEditing}
            disabled={isEditing}
            className="bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed after creation</p>
          )}
        </div>
        <div>
          <Input
            label={isEditing ? 'New Password (optional)' : 'Password'}
            type="password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            icon={Lock}
            error={errors.password}
            placeholder={isEditing ? 'Leave blank to keep current' : '••••••••'}
            required={!isEditing}
            className="bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {isEditing ? 'Enter new password only if you want to change it' : 'Minimum 6 characters'}
          </p>
        </div>
      </div>

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((role) => (
            <label
              key={role.id}
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                formData.roleId === role.id
                  ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.id}
                checked={formData.roleId === role.id}
                onChange={(e) => {
                  setFormData({ ...formData, roleId: e.target.value });
                  if (errors.roleId) setErrors({ ...errors, roleId: '' });
                }}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${getRoleColor(role.name)} flex items-center justify-center flex-shrink-0`}>
                  <Shield size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 capitalize">
                    {role.name.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {role.description}
                  </div>
                </div>
                {formData.roleId === role.id && (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
        {errors.roleId && (
          <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
            <AlertCircle size={14} />
            {errors.roleId}
          </div>
        )}
      </div>

      {/* Status & Options */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                formData.isActive
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100'
                  : 'bg-gradient-to-r from-red-100 to-pink-100'
              }`}>
                {formData.isActive ? (
                  <UserCheck size={20} className="text-green-600" />
                ) : (
                  <UserX size={20} className="text-red-600" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">Account Status</div>
                <div className="text-sm text-gray-600">
                  {formData.isActive ? 'User can login and access the system' : 'User cannot login'}
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                formData.isActive 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-gray-300 to-gray-400'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full transform transition-transform duration-200 ${
                  formData.isActive ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </div>
            </div>
          </label>

          {!isEditing && (
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Send Welcome Email</div>
                  <div className="text-sm text-gray-600">
                    Send account details and welcome message to the user
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.sendWelcomeEmail}
                  onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  formData.sendWelcomeEmail 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                    : 'bg-gradient-to-r from-gray-300 to-gray-400'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform duration-200 ${
                    formData.sendWelcomeEmail ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isEditing ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Save Changes' : 'Create User'
          )}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;