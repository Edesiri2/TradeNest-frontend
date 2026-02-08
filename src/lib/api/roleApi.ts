import { API_BASE_URL } from './config';
import type { CreateRoleData, UpdateRoleData } from '../../types/role';

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

// Role and Permission Management API
export const roleAPI = {
  // Get all roles
  getRoles: (token: string) => {
    return apiRequest('/roles', token, {
      method: 'GET',
    });
  },

  // Get all permissions
  getPermissions: (token: string) => {
    return apiRequest('/roles/permissions', token, {
      method: 'GET',
    });
  },

  // Get single role
  getRole: (token: string, id: string) => {
    return apiRequest(`/roles/${id}`, token, {
      method: 'GET',
    });
  },

  // Create new role
  createRole: (token: string, data: CreateRoleData) => {
    return apiRequest('/roles', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update role
  updateRole: (token: string, id: string, data: UpdateRoleData) => {
    return apiRequest(`/roles/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete role
  deleteRole: (token: string, id: string) => {
    return apiRequest(`/roles/${id}`, token, {
      method: 'DELETE',
    });
  },
};