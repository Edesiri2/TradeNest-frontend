import { create } from 'zustand';
import type { UserManagement, UserStats } from '../../types/user';
import { userAPI } from '../api/userApi';
import { useAuthStore } from './useAuthStore';

interface UserStore {
  users: UserManagement[];
  userStats: UserStats | null;
  selectedUser: UserManagement | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
  };
  
  // Actions
  fetchUsers: (params?: any) => Promise<void>;
  fetchUserStats: () => Promise<void>;
  fetchUser: (id: string) => Promise<UserManagement>;
  createUser: (data: any) => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setSelectedUser: (user: UserManagement | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  users: [],
  userStats: null,
  selectedUser: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalUsers: 0
  },

  // Fetch all users
  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      const response = await userAPI.getUsers(token, params);
      
      // Transform API response
      const users = response.data.map((user: any) => ({
        id: user._id,
        ...user,
        role: user.role || { name: 'user', description: '' }
      }));

      set({
        users,
        loading: false,
        pagination: response.pagination
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch user statistics
  fetchUserStats: async () => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      const response = await userAPI.getUserStats(token);
      
      set({
        userStats: response.data,
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch single user
  fetchUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      const response = await userAPI.getUser(token, id);
      const user = {
        id: response.data._id,
        ...response.data,
        role: response.data.role || { name: 'user', description: '' }
      };
      
      set({ loading: false });
      return user;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Create user
  createUser: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      const response = await userAPI.createUser(token, data);
      const newUser = {
        id: response.data._id,
        ...response.data
      };
      
      // Add to local state
      set(state => ({
        users: [...state.users, newUser],
        loading: false
      }));
      
      return newUser;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update user
  updateUser: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      const response = await userAPI.updateUser(token, id, data);
      const updatedUser = {
        id: response.data._id,
        ...response.data
      };
      
      // Update local state
      set(state => ({
        users: state.users.map(u => 
          u.id === id ? updatedUser : u
        ),
        loading: false
      }));
      
      return updatedUser;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token found');
      
      await userAPI.deleteUser(token, id);
      
      // Remove from local state
      set(state => ({
        users: state.users.filter(u => u.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // UI Actions
  setSelectedUser: (user: UserManagement | null) => set({ selectedUser: user }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));