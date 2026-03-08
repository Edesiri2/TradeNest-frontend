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
  Building,
  DollarSign
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
    ],
  },
  {
    path: '/sales/pos',
    label: 'Sales',
    icon: ShoppingCart,
    roles: ['super_admin', 'admin', 'manager', 'staff'],
    permissions: ['sales.read']
  },
  {
    path: '/warehouse',
    label: 'Warehouse',
    icon: Warehouse,
    roles: ['super_admin', 'admin', 'manager'],
    permissions: ['warehouses.read']
  },
  {
    path: '/outlets',
    label: 'Outlet Management',
    icon: Building,
    roles: ['super_admin', 'admin', 'manager', 'staff', 'viewer'],
  },
  {
    path: '/transfers',
    label: 'Transfers',
    icon: Truck,
    roles: ['super_admin', 'admin', 'manager'],
    permissions: ['warehouses.update'],
    children: [
      {
        path: '/transfers/stock',
        label: 'Stock Transfer',
        icon: Truck,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['warehouses.read']
      }
    ]
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
      {
        path: '/reports/customers',
        label: 'Customer Analytics',
        icon: Users,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['sales.read'],
      },
      {
        path: '/reports/operational-costs',
        label: 'Operational Costs',
        icon: DollarSign,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['operational_costs.read'],
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
        path: '/settings/product-categories',
        label: 'Categories',
        icon: Package,
        roles: ['super_admin', 'admin', 'manager'],
        permissions: ['products.read'],
      },
      {
        path: '/settings/profile',
        label: 'Profile Settings',
        icon: Users,
        roles: ['super_admin', 'admin', 'manager', 'staff', 'viewer'],
      },
      {
        path: '/settings/configuration',
        label: 'Configuration',
        icon: Settings,
        roles: ['super_admin', 'admin', 'manager'],
      }
    ],
  },
];

const hasMatchingPermission = (
  itemPermissions: string[] | undefined,
  permissions: string[]
) => {
  if (!itemPermissions || itemPermissions.length === 0) return false;
  return itemPermissions.some(permission => permissions.includes(permission));
};

const canAccessItem = (
  item: NavigationItem,
  role: string,
  permissions: string[]
) => {
  const roleMatches = item.roles.includes(role as any);
  const permissionMatches = hasMatchingPermission(item.permissions, permissions);

  return roleMatches || permissionMatches;
};

// Helper function to get navigation items based on user role and permissions
export const getNavigationItems = (
  role: string, 
  permissions: string[] = []
): NavigationItem[] => {
  return navigationConfig.reduce<NavigationItem[]>((items, item) => {
      const children = item.children?.filter(child => canAccessItem(child, role, permissions));
      const shouldIncludeItem = canAccessItem(item, role, permissions) || Boolean(children?.length);

      if (!shouldIncludeItem) {
        return items;
      }

      items.push({
        ...item,
        children
      });

      return items;
    }, []);
};

// Flat navigation for mobile (no nested children)
export const getFlatNavigation = (
  role: string,
  permissions: string[] = []
): NavigationItem[] => {
  const items: NavigationItem[] = [];

  navigationConfig.forEach(item => {
    if (canAccessItem(item, role, permissions)) {
      items.push(item);
      if (item.children) {
        item.children.forEach(child => {
          if (canAccessItem(child, role, permissions)) {
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

  return canAccessItem(item, role, permissions);
};
