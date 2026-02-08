import type { LucideIcon } from 'lucide-react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  BarChart, 
  Settings,
  Users,
  Truck,
  Shield,
  Key
} from 'lucide-react';

export interface NavigationItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles: ('super_admin' | 'admin' | 'manager' | 'staff' | 'viewer')[];
  permissions?: string[]; // Optional: required permissions to see this item
  children?: NavigationItem[];
}

export const navigationConfig: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'admin', 'manager', 'staff', 'viewer'],
  },
  {
    path: '/inventory',
    label: 'Inventory',
    icon: Package,
    roles: ['super_admin', 'admin', 'manager'],
    permissions: ['products.read'],
    children: [
      {
        path: '/inventory/products',
        label: 'Products',
        icon: Package,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['products.read'],
      },
      {
        path: '/inventory/pending-approval',
        label: 'Pending Approval',
        icon: Shield,
        roles: ['super_admin', 'admin'],
        permissions: ['products.approve'],
      },
      {
        path: '/inventory/low-stock',
        label: 'Low Stock',
        icon: Package,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['products.read'],
      },
    ],
  },
  {
    path: '/sales',
    label: 'Sales',
    icon: ShoppingCart,
    roles: ['super_admin', 'admin', 'manager', 'staff'],
    permissions: ['sales.read'],
    children: [
      {
        path: '/sales/pos',
        label: 'POS',
        icon: ShoppingCart,
        roles: ['super_admin', 'admin', 'manager', 'staff'],
        permissions: ['sales.create'],
      },
      {
        path: '/sales/history',
        label: 'Sales History',
        icon: BarChart,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['sales.read'],
      },
      {
        path: '/sales/customers',
        label: 'Customers',
        icon: Users,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['sales.read'],
      },
    ],
  },
  {
    path: '/warehouse',
    label: 'Warehouse',
    icon: Warehouse,
    roles: ['super_admin', 'admin', 'manager'],
    permissions: ['warehouses.read'],
    children: [
      {
        path: '/warehouse/overview',
        label: 'Overview',
        icon: Warehouse,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['warehouses.read'],
      },
      {
        path: '/warehouse/transfers',
        label: 'Stock Transfer',
        icon: Truck,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['warehouses.update'],
      },
    ],
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: BarChart,
    roles: ['super_admin', 'admin', 'manager'],
    permissions: ['sales.read'],
    children: [
      {
        path: '/reports/sales',
        label: 'Sales Reports',
        icon: BarChart,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['sales.read'],
      },
      {
        path: '/reports/inventory',
        label: 'Inventory Reports',
        icon: Package,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['products.read'],
      },
      {
        path: '/reports/profit-loss',
        label: 'Profit & Loss',
        icon: BarChart,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['sales.read'],
      },
    ],
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['super_admin', 'admin', 'manager', 'staff', 'viewer'],
    children: [
      {
        path: '/settings/users',
        label: 'User Management',
        icon: Users,
        roles: ['super_admin', 'admin'],
        permissions: ['users.read'],
      },
      {
        path: '/settings/roles',
        label: 'Role Management',
        icon: Shield,
        roles: ['super_admin', 'admin'],
        permissions: ['roles.read'],
      },
      {
        path: '/settings/permissions',
        label: 'Permissions',
        icon: Key,
        roles: ['super_admin', 'admin'],
        permissions: ['permissions.read'],
      },
      {
        path: '/settings/profile',
        label: 'Profile Settings',
        icon: Users,
        roles: ['super_admin', 'admin', 'manager', 'staff', 'viewer'],
      },
    ],
  },
];

// Helper function to get navigation items based on user role and permissions
export const getNavigationItems = (
  role: string, 
  permissions: string[] = []
): NavigationItem[] => {
  const hasPermission = (itemPermissions?: string[]) => {
    if (!itemPermissions || itemPermissions.length === 0) return true;
    return itemPermissions.some(permission => permissions.includes(permission));
  };

  return navigationConfig
    .filter(item => item.roles.includes(role as any) && hasPermission(item.permissions))
    .map(item => ({
      ...item,
      children: item.children?.filter(
        child => child.roles.includes(role as any) && hasPermission(child.permissions)
      )
    }));
};

// Flat navigation for mobile (no nested children)
export const getFlatNavigation = (
  role: string,
  permissions: string[] = []
): NavigationItem[] => {
  const items: NavigationItem[] = [];
  
  const hasPermission = (itemPermissions?: string[]) => {
    if (!itemPermissions || itemPermissions.length === 0) return true;
    return itemPermissions.some(permission => permissions.includes(permission));
  };
  
  navigationConfig.forEach(item => {
    if (item.roles.includes(role as any) && hasPermission(item.permissions)) {
      items.push(item);
      if (item.children) {
        item.children.forEach(child => {
          if (child.roles.includes(role as any) && hasPermission(child.permissions)) {
            items.push(child);
          }
        });
      }
    }
  });
  
  return items;
};

// Find navigation item by path
export const findNavigationItem = (path: string): NavigationItem | undefined => {
  for (const item of navigationConfig) {
    if (item.path === path) return item;
    if (item.children) {
      const child = item.children.find(child => child.path === path);
      if (child) return child;
    }
  }
  return undefined;
};

// Check if a user can access a specific route
export const canAccessRoute = (
  path: string, 
  role: string, 
  permissions: string[] = []
): boolean => {
  const item = findNavigationItem(path);
  if (!item) return false;
  
  if (!item.roles.includes(role as any)) return false;
  
  if (item.permissions && item.permissions.length > 0) {
    return item.permissions.some(permission => permissions.includes(permission));
  }
  
  return true;
};