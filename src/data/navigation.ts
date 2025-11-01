import { LucideIcon } from 'lucide-react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  BarChart, 
  Settings,
  Users,
  Truck 
} from 'lucide-react';

export interface NavigationItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles: ('admin' | 'manager' | 'cashier')[];
  children?: NavigationItem[];
}

export const navigationConfig: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'cashier'],
  },
  {
    path: '/inventory',
    label: 'Inventory',
    icon: Package,
    roles: ['admin', 'manager'],
    children: [
      {
        path: '/inventory/products',
        label: 'Products',
        icon: Package,
        roles: ['admin', 'manager'],
      },
      // {
      //   path: '/inventory/stock-transfer',
      //   label: 'Stock Transfer',
      //   icon: Truck,
      //   roles: ['admin', 'manager'],
      // },
      // {
      //   path: '/inventory/suppliers',
      //   label: 'Suppliers',
      //   icon: Users,
      //   roles: ['admin', 'manager'],
      // },
    ],
  },
  {
    path: '/sales',
    label: 'Sales',
    icon: ShoppingCart,
    roles: ['admin', 'manager', 'cashier'],
    children: [
      {
        path: '/sales/pos',
        label: 'POS',
        icon: ShoppingCart,
        roles: ['admin', 'manager', 'cashier'],
      },
      // {
      //   path: '/sales/history',
      //   label: 'Sales History',
      //   icon: BarChart,
      //   roles: ['admin', 'manager'],
      // },
      {
        path: '/sales/customers',
        label: 'Customers',
        icon: Users,
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    path: '/warehouse',
    label: 'Warehouse',
    icon: Warehouse,
    roles: ['admin', 'manager'],
    children: [
      {
        path: '/warehouse/overview',
        label: 'Overview',
        icon: Warehouse,
        roles: ['admin', 'manager'],
      },
      {
        path: '/warehouse/transfers',
        label: 'Stock Transfer',
        icon: Truck,
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: BarChart,
    roles: ['admin', 'manager'],
    children: [
      {
        path: '/reports/sales',
        label: 'Sales Reports',
        icon: BarChart,
        roles: ['admin', 'manager'],
      },
      {
        path: '/reports/inventory',
        label: 'Inventory Reports',
        icon: Package,
        roles: ['admin', 'manager'],
      },
      {
        path: '/reports/profit-loss',
        label: 'Profit & Loss',
        icon: BarChart,
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['admin'],
    children: [
      {
        path: '/settings/users',
        label: 'User Management',
        icon: Users,
        roles: ['admin'],
      },
      {
        path: '/settings/outlets',
        label: 'Outlets',
        icon: Warehouse,
        roles: ['admin'],
      },
    ],
  },
];

// Helper function to get navigation items based on user role
export const getNavigationItems = (role: 'admin' | 'manager' | 'cashier'): NavigationItem[] => {
  return navigationConfig.filter(item => 
    item.roles.includes(role)
  ).map(item => ({
    ...item,
    children: item.children?.filter(child => child.roles.includes(role))
  }));
};

// Flat navigation for mobile (no nested children)
export const getFlatNavigation = (role: 'admin' | 'manager' | 'cashier'): NavigationItem[] => {
  const items: NavigationItem[] = [];
  
  navigationConfig.forEach(item => {
    if (item.roles.includes(role)) {
      items.push(item);
      if (item.children) {
        item.children.forEach(child => {
          if (child.roles.includes(role)) {
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