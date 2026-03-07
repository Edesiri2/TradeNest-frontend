import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Calendar, Clock, Lock, Mail, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authAPI } from '../../lib/api/authApi';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { formatDate } from '../../lib/utils/utils';
import type { User as AuthUser } from '../../types/auth';

const normalizeProfile = (profile: any, fallbackUser: AuthUser | null): AuthUser => {
  const outlet =
    profile?.outlet && typeof profile.outlet === 'object'
      ? {
          id: profile.outlet.id || profile.outlet._id || profile.outletId || fallbackUser?.outletId || '',
          name: profile.outlet.name || fallbackUser?.outlet?.name,
          code: profile.outlet.code || fallbackUser?.outlet?.code
        }
      : fallbackUser?.outlet || null;

  return {
    id: profile?.id || profile?._id || fallbackUser?.id || '',
    email: profile?.email || fallbackUser?.email || '',
    firstName: profile?.firstName || fallbackUser?.firstName || '',
    lastName: profile?.lastName || fallbackUser?.lastName || '',
    fullName:
      profile?.fullName ||
      `${profile?.firstName || fallbackUser?.firstName || ''} ${profile?.lastName || fallbackUser?.lastName || ''}`.trim(),
    role: {
      id: profile?.role?.id || profile?.role?._id || fallbackUser?.role?.id || '',
      name: profile?.role?.name || fallbackUser?.role?.name || '',
      description: profile?.role?.description || fallbackUser?.role?.description || ''
    },
    isEmailVerified:
      profile?.isEmailVerified !== undefined ? profile.isEmailVerified : fallbackUser?.isEmailVerified || false,
    lastLogin: profile?.lastLogin || fallbackUser?.lastLogin || '',
    outlet,
    outletId: profile?.outletId || outlet?.id || fallbackUser?.outletId || '',
    createdAt: profile?.createdAt || fallbackUser?.createdAt || '',
    updatedAt: profile?.updatedAt || fallbackUser?.updatedAt || ''
  };
};

const Profile: React.FC = () => {
  const { token, user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<AuthUser | null>(user);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;

      setIsProfileLoading(true);
      try {
        const response = await authAPI.getProfile(token);
        const nextProfile = normalizeProfile(response.data, user);
        setProfile(nextProfile);
        setUser(nextProfile);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load profile');
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
  }, [token, setUser]);

  const profileRows = useMemo(
    () => [
      { label: 'Full Name', value: profile?.fullName || '-', icon: User },
      { label: 'Email', value: profile?.email || '-', icon: Mail },
      { label: 'Role', value: profile?.role?.name?.replace(/_/g, ' ') || '-', icon: Shield },
      {
        label: 'Outlet',
        value: profile?.outlet?.name ? `${profile.outlet.name}${profile.outlet.code ? ` (${profile.outlet.code})` : ''}` : 'Not assigned',
        icon: Building2
      },
      {
        label: 'Created',
        value: profile?.createdAt ? formatDate(new Date(profile.createdAt)) : '-',
        icon: Calendar
      },
      {
        label: 'Last Login',
        value: profile?.lastLogin ? formatDate(new Date(profile.lastLogin)) : '-',
        icon: Clock
      }
    ],
    [profile]
  );

  const handlePasswordChange = async () => {
    if (!token) return;

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please complete all password fields');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsPasswordSaving(true);
    try {
      const response = await authAPI.changePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      toast.success(response?.message || 'Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Settings</h1>
        <p className="text-gray-600">View your account details and update your password.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
              <p className="text-sm text-gray-500">Your current account details from the server.</p>
            </div>
            {isProfileLoading && <span className="text-sm text-gray-500">Refreshing...</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileRows.map(({ label, value, icon: Icon }) => (
              <div key={label} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Icon size={16} className="mr-2" />
                  {label}
                </div>
                <div className="text-base font-medium text-gray-900 capitalize">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500">Use your current password to set a new one.</p>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
              }
              icon={Lock}
              required
            />
            <Input
              type="password"
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, newPassword: event.target.value })
              }
              icon={Lock}
              help="Minimum of 6 characters"
              required
            />
            <Input
              type="password"
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })
              }
              icon={Lock}
              required
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="primary" onClick={handlePasswordChange} disabled={isPasswordSaving}>
              {isPasswordSaving ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
