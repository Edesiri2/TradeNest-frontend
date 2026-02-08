import { API_BASE_URL } from './config';
import type { LoginCredentials, RegisterData, AuthResponse } from '../../types/auth';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
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

// Auth API
export const authAPI = {
  // Login user
  login: (credentials: LoginCredentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }) as Promise<AuthResponse>;
  },

  // Register user
  register: (data: RegisterData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<any>;
  },

  // Get user profile
  getProfile: (token: string) => {
    return apiRequest('/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Update profile
  updateProfile: (token: string, data: any) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Change password
  changePassword: (token: string, data: { currentPassword: string; newPassword: string }) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  // Verify email
  verifyEmail: (token: string) => {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // Resend verification email
  resendVerification: (email: string) => {
    return apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Forgot password
  forgotPassword: (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: (data: { token: string; newPassword: string }) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};