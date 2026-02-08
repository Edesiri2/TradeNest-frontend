import { API_BASE_URL } from './config';
import type { CreateUserData, UpdateUserData, UserStats } from '../../types/user';

const apiRequest = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// User Management API
export const userAPI = {
  // Get all users
  getUsers: (token: string, params?: { 
    search?: string; 
    role?: string; 
    isActive?: string;
    page?: number; 
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive) queryParams.append('isActive', params.isActive);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint, token, {
      method: 'GET',
    });
  },

  // Get user statistics
  getUserStats: (token: string) => {
    return apiRequest('/users/stats', token, {
      method: 'GET',
    });
  },

  // Get single user
  getUser: (token: string, id: string) => {
    return apiRequest(`/users/${id}`, token, {
      method: 'GET',
    });
  },

  // Create new user
  createUser: (token: string, data: CreateUserData) => {
    return apiRequest('/users', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update user
  updateUser: (token: string, id: string, data: UpdateUserData) => {
    return apiRequest(`/users/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete user (soft delete)
  deleteUser: (token: string, id: string) => {
    return apiRequest(`/users/${id}`, token, {
      method: 'DELETE',
    });
  },
};