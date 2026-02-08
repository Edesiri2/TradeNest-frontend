export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string;
  isActive: boolean;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface PermissionGroup {
  [module: string]: Permission[];
}