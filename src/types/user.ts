export interface UserManagement {
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
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersByRole: Array<{
    _id: string;
    count: number;
  }>;
}