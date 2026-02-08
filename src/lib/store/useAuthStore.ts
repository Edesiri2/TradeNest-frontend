import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import type { AuthState, User, LoginCredentials, AuthResponse } from '../../types/auth';
import { authAPI } from '../api/authApi';

// Extend AuthState with new methods
interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setPermissions: (permissions: string[]) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isInRole: (roleName: string) => boolean;
}

// Decode JWT token to get user info and permissions
const decodeToken = (token: string): { user: User; permissions: string[] } => {
  try {
    const decoded: any = jwtDecode(token);
    console.log('Decoded token:', decoded);
    
    // Handle both flattened and nested role structure
    let roleName = 'user';
    let roleId = '';
    let roleDescription = '';
    
    if (decoded.role) {
      if (typeof decoded.role === 'string') {
        roleName = decoded.role;
        roleId = decoded.roleId || '';
      } else if (typeof decoded.role === 'object') {
        roleName = decoded.role.name || decoded.roleName || 'user';
        roleId = decoded.role.id || decoded.roleId || '';
        roleDescription = decoded.role.description || '';
      }
    } else if (decoded.roleName) {
      roleName = decoded.roleName;
    }
    
    return {
      user: {
        id: decoded.userId || decoded.id,
        email: decoded.email || '',
        firstName: decoded.firstName || '',
        lastName: decoded.lastName || '',
        fullName: decoded.fullName || `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim(),
        role: {
          id: roleId,
          name: roleName,
          description: roleDescription
        },
        isEmailVerified: decoded.isEmailVerified || false,
        lastLogin: decoded.lastLogin || new Date().toISOString(),
        createdAt: decoded.createdAt || new Date().toISOString(),
        updatedAt: decoded.updatedAt || new Date().toISOString()
      },
      permissions: decoded.permissions || []
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    throw new Error('Invalid token');
  }
};

// Merge user data from API response with token data
const mergeUserData = (apiUser: any, tokenUser: User): User => {
  return {
    id: apiUser.id || tokenUser.id,
    email: apiUser.email || tokenUser.email,
    firstName: apiUser.firstName || tokenUser.firstName,
    lastName: apiUser.lastName || tokenUser.lastName,
    fullName: apiUser.fullName || tokenUser.fullName || `${apiUser.firstName || tokenUser.firstName} ${apiUser.lastName || tokenUser.lastName}`.trim(),
    role: {
      id: apiUser.role?.id || tokenUser.role.id,
      name: apiUser.role?.name || tokenUser.role.name,
      description: apiUser.role?.description || tokenUser.role.description
    },
    isEmailVerified: apiUser.isEmailVerified !== undefined ? apiUser.isEmailVerified : tokenUser.isEmailVerified,
    lastLogin: apiUser.lastLogin || tokenUser.lastLogin,
    createdAt: apiUser.createdAt || tokenUser.createdAt,
    updatedAt: apiUser.updatedAt || tokenUser.updatedAt
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(credentials);
          
          if (response.success) {
            const { token, user: apiUser, permissions } = response.data;
            
            // Decode token to get user info and permissions
            const decoded = decodeToken(token);
            
            // Merge API user data with token data
            const mergedUser = mergeUserData(apiUser, decoded.user);
            
            set({
              user: mergedUser,
              token,
              permissions: permissions || decoded.permissions,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(data);
          
          if (response.success) {
            set({ isLoading: false });
            return response;
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Clear token from localStorage
        localStorage.removeItem('auth-storage');
        
        set({
          user: null,
          token: null,
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
        });
        
        // Redirect to login page
        window.location.href = '/login';
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        const decoded = decodeToken(token);
        set({ 
          token,
          user: decoded.user,
          permissions: decoded.permissions,
          isAuthenticated: true 
        });
      },

      setPermissions: (permissions: string[]) => {
        set({ permissions });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkAuth: () => {
        const { token } = get();
        if (token) {
          try {
            const decoded = decodeToken(token);
            set({ 
              user: decoded.user,
              permissions: decoded.permissions,
              isAuthenticated: true 
            });
          } catch (error) {
            get().logout();
          }
        }
      },

      hasPermission: (permission: string): boolean => {
        const { permissions, user } = get();
        
        // Super admin has all permissions
        if (user?.role.name === 'super_admin') {
          return true;
        }
        
        return permissions.includes(permission);
      },

      hasAnyPermission: (permissions: string[]): boolean => {
        const { hasPermission } = get();
        return permissions.some(hasPermission);
      },

      hasAllPermissions: (permissions: string[]): boolean => {
        const { hasPermission } = get();
        return permissions.every(hasPermission);
      },

      isInRole: (roleName: string): boolean => {
        const { user } = get();
        return user?.role.name === roleName;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.checkAuth();
        }
      },
    }
  )
);