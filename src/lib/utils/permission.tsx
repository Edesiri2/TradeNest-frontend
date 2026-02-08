import { useAuthStore } from '../store/useAuthStore';

/**
 * Check if user has a specific permission
 */
export const hasPermission = (permission: string): boolean => {
  const { hasPermission } = useAuthStore.getState();
  return hasPermission(permission);
};

/**
 * Check if user has any of the given permissions
 */
export const hasAnyPermission = (permissions: string[]): boolean => {
  const { hasAnyPermission } = useAuthStore.getState();
  return hasAnyPermission(permissions);
};

/**
 * Check if user has all of the given permissions
 */
export const hasAllPermissions = (permissions: string[]): boolean => {
  const { hasAllPermissions } = useAuthStore.getState();
  return hasAllPermissions(permissions);
};

/**
 * Check if user is in a specific role
 */
export const isInRole = (roleName: string): boolean => {
  const { isInRole } = useAuthStore.getState();
  return isInRole(roleName);
};

/**
 * Get permission display name
 */
export const getPermissionDisplayName = (permission: string): string => {
  const parts = permission.split('.');
  if (parts.length === 2) {
    const [module, action] = parts;
    const actionMap: Record<string, string> = {
      'create': 'Create',
      'read': 'View',
      'update': 'Edit',
      'delete': 'Delete',
      'approve': 'Approve',
      'export': 'Export',
      'import': 'Import'
    };
    
    const moduleMap: Record<string, string> = {
      'users': 'Users',
      'products': 'Products',
      'warehouses': 'Warehouses',
      'outlets': 'Outlets',
      'sales': 'Sales',
      'roles': 'Roles',
      'permissions': 'Permissions'
    };
    
    const displayAction = actionMap[action] || action;
    const displayModule = moduleMap[module] || module;
    
    return `${displayAction} ${displayModule}`;
  }
  
  return permission;
};

/**
 * Group permissions by module for display
 */
export const groupPermissionsByModule = (permissions: string[]) => {
  const grouped: Record<string, string[]> = {};
  
  permissions.forEach(permission => {
    const parts = permission.split('.');
    if (parts.length === 2) {
      const [module] = parts;
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(permission);
    }
  });
  
  return grouped;
};

/**
 * Permission hook for React components
 */
export const usePermissions = () => {
  const { permissions, user, hasPermission, hasAnyPermission, hasAllPermissions, isInRole } = useAuthStore();
  
  return {
    permissions,
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isInRole,
    
    // Module-specific permission checks
    canViewUsers: hasPermission('users.read'),
    canCreateUsers: hasPermission('users.create'),
    canEditUsers: hasPermission('users.update'),
    canDeleteUsers: hasPermission('users.delete'),
    
    canViewProducts: hasPermission('products.read'),
    canCreateProducts: hasPermission('products.create'),
    canEditProducts: hasPermission('products.update'),
    canDeleteProducts: hasPermission('products.delete'),
    canApproveProducts: hasPermission('products.approve'),
    
    canViewWarehouses: hasPermission('warehouses.read'),
    canCreateWarehouses: hasPermission('warehouses.create'),
    canEditWarehouses: hasPermission('warehouses.update'),
    canDeleteWarehouses: hasPermission('warehouses.delete'),
    
    canViewOutlets: hasPermission('outlets.read'),
    canCreateOutlets: hasPermission('outlets.create'),
    canEditOutlets: hasPermission('outlets.update'),
    canDeleteOutlets: hasPermission('outlets.delete'),
    
    canViewSales: hasPermission('sales.read'),
    canCreateSales: hasPermission('sales.create'),
    canEditSales: hasPermission('sales.update'),
    canDeleteSales: hasPermission('sales.delete'),
    
    canViewRoles: hasPermission('roles.read'),
    canCreateRoles: hasPermission('roles.create'),
    canEditRoles: hasPermission('roles.update'),
    canDeleteRoles: hasPermission('roles.delete'),
    
    canViewPermissions: hasPermission('permissions.read'),
    
    // Role checks
    isSuperAdmin: isInRole('super_admin'),
    isAdmin: isInRole('admin'),
    isManager: isInRole('manager'),
    isStaff: isInRole('staff'),
    isViewer: isInRole('viewer'),
  };
};

/**
 * Higher Order Component for permission-based route protection
 */
export const withPermission = (WrappedComponent: React.ComponentType, requiredPermission: string) => {
  return function WithPermissionWrapper(props: any) {
    const { hasPermission, isAuthenticated } = useAuthStore();
    
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    }
    
    if (!hasPermission(requiredPermission)) {
      // Show access denied
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
};

/**
 * Component wrapper for conditional rendering based on permissions
 */
export const PermissionGuard: React.FC<{
  children: React.ReactNode;
  requiredPermission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  requiredRole?: string;
  fallback?: React.ReactNode;
}> = ({ 
  children, 
  requiredPermission, 
  anyPermission, 
  allPermissions, 
  requiredRole,
  fallback = null 
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    isInRole,
    isAuthenticated 
  } = useAuthStore();
  
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }
  
  let hasAccess = true;
  
  if (requiredPermission) {
    hasAccess = hasAccess && hasPermission(requiredPermission);
  }
  
  if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAccess && hasAnyPermission(anyPermission);
  }
  
  if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAccess && hasAllPermissions(allPermissions);
  }
  
  if (requiredRole) {
    hasAccess = hasAccess && isInRole(requiredRole);
  }
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};