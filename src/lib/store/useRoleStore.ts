import { create } from 'zustand';
import type { Role, Permission, PermissionGroup } from '../../types/role';
import { roleAPI } from '../api/roleApi';
import { useAuthStore } from './useAuthStore';

interface RoleStore {
  roles: Role[];
  permissions: Permission[];
  permissionGroups: PermissionGroup;
  selectedRole: Role | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRoles: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  fetchRole: (id: string) => Promise<Role>;
  createRole: (data: any) => Promise<void>;
  updateRole: (id: string, data: any) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  setSelectedRole: (role: Role | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  groupPermissionsByModule: (permissions: Permission[]) => PermissionGroup;
}

export const useRoleStore = create<RoleStore>((set, get) => ({
  // Initial state
  roles: [],
  permissions: [],
  permissionGroups: {},
  selectedRole: null,
  loading: false,
  error: null,

  // Fetch all roles
  fetchRoles: async () => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      const response = await roleAPI.getRoles(token);
      
      // Transform API response
      const roles = response.data.map((role: any) => ({
        id: role._id,
        ...role,
        permissions: role.permissions || []
      }));

      set({
        roles,
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch all permissions
  fetchPermissions: async () => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      const response = await roleAPI.getPermissions(token);
      
      // Transform API response
      const permissions = response.data.map((permission: any) => ({
        id: permission._id,
        ...permission
      }));
      
      // Group permissions by module
      const permissionGroups = get().groupPermissionsByModule(permissions);

      set({
        permissions,
        permissionGroups,
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch single role
  fetchRole: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      const response = await roleAPI.getRole(token, id);
      const role = {
        id: response.data._id,
        ...response.data,
        permissions: response.data.permissions || []
      };
      
      set({ loading: false, selectedRole: role });
      return role;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Create role
  createRole: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      const response = await roleAPI.createRole(token, data);
      const newRole = {
        id: response.data._id,
        ...response.data
      };
      
      // Add to local state
      set(state => ({
        roles: [...state.roles, newRole],
        loading: false
      }));
      
      return newRole;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update role
  updateRole: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      const response = await roleAPI.updateRole(token, id, data);
      const updatedRole = {
        id: response.data._id,
        ...response.data
      };
      
      // Update local state
      set(state => ({
        roles: state.roles.map(r => 
          r.id === id ? updatedRole : r
        ),
        selectedRole: state.selectedRole?.id === id ? updatedRole : state.selectedRole,
        loading: false
      }));
      
      return updatedRole;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete role
  deleteRole: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      await roleAPI.deleteRole(token, id);
      
      // Remove from local state
      set(state => ({
        roles: state.roles.filter(r => r.id !== id),
        selectedRole: state.selectedRole?.id === id ? null : state.selectedRole,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Group permissions by module
  groupPermissionsByModule: (permissions: Permission[]): PermissionGroup => {
    return permissions.reduce((groups: PermissionGroup, permission) => {
      if (!groups[permission.module]) {
        groups[permission.module] = [];
      }
      groups[permission.module].push(permission);
      return groups;
    }, {});
  },

  // UI Actions
  setSelectedRole: (role: Role | null) => set({ selectedRole: role }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));