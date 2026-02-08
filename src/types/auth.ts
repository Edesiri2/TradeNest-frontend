export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
      role: {
        id: string;
        name: string;
        description: string;
      };
      isEmailVerified: boolean;
      lastLogin: string;
      createdAt?: string;
      updatedAt?: string;
    };
    permissions: string[];
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  isEmailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string;
}