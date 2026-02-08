// App Configuration
export const APP_CONFIG = {
  name: 'TradeNest',
  version: '1.0.0',
  defaultCurrency: 'NGN',
  defaultCurrencySymbol: '₦',
} as const;

// User Roles and Permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  MOBILE: 'mobile',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Stock Transfer Status
export const STOCK_TRANSFER_STATUS = {
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type StockTransferStatus = typeof STOCK_TRANSFER_STATUS[keyof typeof STOCK_TRANSFER_STATUS];

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing & Fashion',
  'Food & Beverages',
  'Home & Kitchen',
  'Health & Beauty',
  'Sports & Outdoors',
  'Books & Media',
  'Automotive',
  'Office Supplies',
  'Toys & Games',
  'Jewelry & Accessories',
  'Other',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Inventory Status
export const INVENTORY_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
} as const;

export type InventoryStatus = typeof INVENTORY_STATUS[keyof typeof INVENTORY_STATUS];

// Stock Level Thresholds
export const STOCK_LEVELS = {
  CRITICAL: 5,
  LOW: 10,
  OPTIMAL: 25,
  HIGH: 50,
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Customer Types
export const CUSTOMER_TYPES = {
  REGULAR: 'regular',
  WHOLESALE: 'wholesale',
  CORPORATE: 'corporate',
  VIP: 'vip',
} as const;

export type CustomerType = typeof CUSTOMER_TYPES[keyof typeof CUSTOMER_TYPES];

// Tax Rates (Nigeria specific)
export const TAX_RATES = {
  STANDARD: 7.5, // VAT rate in Nigeria
  ZERO: 0,
  EXEMPT: 0,
} as const;

// Discount Types
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  BUY_X_GET_Y: 'buy_x_get_y',
} as const;

export type DiscountType = typeof DISCOUNT_TYPES[keyof typeof DISCOUNT_TYPES];

// Measurement Units
export const MEASUREMENT_UNITS = {
  PIECES: 'pieces',
  KILOGRAMS: 'kg',
  GRAMS: 'g',
  LITERS: 'liters',
  MILLILITERS: 'ml',
  METERS: 'meters',
  CENTIMETERS: 'cm',
} as const;

export type MeasurementUnit = typeof MEASUREMENT_UNITS[keyof typeof MEASUREMENT_UNITS];

// Supplier Payment Terms
export const PAYMENT_TERMS = {
  NET_7: 'Net 7',
  NET_15: 'Net 15',
  NET_30: 'Net 30',
  NET_45: 'Net 45',
  NET_60: 'Net 60',
  DUE_ON_RECEIPT: 'Due on receipt',
  PREPAID: 'Prepaid',
} as const;

export type PaymentTerm = typeof PAYMENT_TERMS[keyof typeof PAYMENT_TERMS];

// Warehouse Types
export const WAREHOUSE_TYPES = {
  MAIN: 'main',
  DISTRIBUTION: 'distribution',
  RETAIL: 'retail',
  COLD_STORAGE: 'cold_storage',
  BONDED: 'bonded',
} as const;

export type WarehouseType = typeof WAREHOUSE_TYPES[keyof typeof WAREHOUSE_TYPES];

// Outlet Types
export const OUTLET_TYPES = {
  RETAIL: 'retail',
  WHOLESALE: 'wholesale',
  ONLINE: 'online',
  KIOSK: 'kiosk',
} as const;

export type OutletType = typeof OUTLET_TYPES[keyof typeof OUTLET_TYPES];

// Notification Types
export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'low_stock',
  STOCK_OUT: 'stock_out',
  EXPIRING_SOON: 'expiring_soon',
  NEW_ORDER: 'new_order',
  PAYMENT_RECEIVED: 'payment_received',
  TRANSFER_COMPLETE: 'transfer_complete',
  SYSTEM_ALERT: 'system_alert',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// Report Types
export const REPORT_TYPES = {
  SALES_SUMMARY: 'sales_summary',
  INVENTORY_VALUATION: 'inventory_valuation',
  PROFIT_LOSS: 'profit_loss',
  STOCK_MOVEMENT: 'stock_movement',
  CUSTOMER_ANALYTICS: 'customer_analytics',
  SUPPLIER_PERFORMANCE: 'supplier_performance',
} as const;

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];

// Date Ranges for Reports
export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom',
} as const;

export type DateRange = typeof DATE_RANGES[keyof typeof DATE_RANGES];

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid phone number',
  NUMBER: 'Please enter a valid number',
  POSITIVE_NUMBER: 'Please enter a positive number',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be less than ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be less than ${max}`,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
  },
  PRODUCTS: {
    BASE: '/api/products',
    BY_ID: (id: string) => `/api/products/${id}`,
    CATEGORIES: '/api/products/categories',
    INVENTORY: '/api/products/inventory',
  },
  SALES: {
    BASE: '/api/sales',
    BY_ID: (id: string) => `/api/sales/${id}`,
    DAILY: '/api/sales/daily',
    REPORTS: '/api/sales/reports',
  },
  CUSTOMERS: {
    BASE: '/api/customers',
    BY_ID: (id: string) => `/api/customers/${id}`,
  },
  SUPPLIERS: {
    BASE: '/api/suppliers',
    BY_ID: (id: string) => `/api/suppliers/${id}`,
  },
  WAREHOUSES: {
    BASE: '/api/warehouses',
    BY_ID: (id: string) => `/api/warehouses/${id}`,
  },
  INVENTORY: {
    BASE: '/api/inventory',
    STOCK_TRANSFERS: '/api/inventory/transfers',
    AUDITS: '/api/inventory/audits',
  },
  REPORTS: {
    BASE: '/api/reports',
    SALES: '/api/reports/sales',
    INVENTORY: '/api/reports/inventory',
    FINANCIAL: '/api/reports/financial',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  USER_PREFERENCES: 'user_preferences',
  CART_ITEMS: 'cart_items',
  RECENT_SEARCHES: 'recent_searches',
} as const;

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#3b82f6',
    SECONDARY: '#6b7280',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#06b6d4',
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const;

// Navigation Configuration
export const NAVIGATION = {
  DASHBOARD: '/dashboard',
  INVENTORY: '/inventory',
  SALES: '/sales',
  WAREHOUSE: '/warehouse',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

// Default Values
export const DEFAULTS = {
  PAGINATION: {
    PAGE: 1,
    LIMIT: 20,
    LIMIT_OPTIONS: [10, 20, 50, 100],
  },
  INVENTORY: {
    LOW_STOCK_ALERT: 10,
    INITIAL_STOCK: 0,
  },
  SALES: {
    TAX_RATE: 7.5,
    DISCOUNT: 0,
  },
  CURRENCY: {
    CODE: 'NGN',
    SYMBOL: '₦',
    DECIMALS: 2,
  },
} as const;

// Export all constants as a single object for easy access
export default {
  APP_CONFIG,
  USER_ROLES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  STOCK_TRANSFER_STATUS,
  PRODUCT_CATEGORIES,
  INVENTORY_STATUS,
  STOCK_LEVELS,
  ORDER_STATUS,
  CUSTOMER_TYPES,
  TAX_RATES,
  DISCOUNT_TYPES,
  MEASUREMENT_UNITS,
  PAYMENT_TERMS,
  WAREHOUSE_TYPES,
  OUTLET_TYPES,
  NOTIFICATION_TYPES,
  REPORT_TYPES,
  DATE_RANGES,
  VALIDATION_MESSAGES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  THEME,
  NAVIGATION,
  DEFAULTS,
};

export const BRAND = {
  colors: {
    indigo: '#667eea',
    purple: '#764ba2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradientHover: 'linear-gradient(135deg, #5a6fd9 0%, #6a4293 100%)',
  },
  
  gradients: {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    primaryHover: 'hover:from-indigo-700 hover:to-purple-700',
    sidebar: 'bg-gradient-to-b from-indigo-800 via-purple-900 to-gray-900',
  },
  
  shadows: {
    brand: 'shadow-[0_4px_14px_0_rgba(102,126,234,0.4)]',
    brandHover: 'hover:shadow-[0_6px_20px_rgba(102,126,234,0.5)]',
  },
  
  animations: {
    gradient: 'animate-gradient-shift bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto]',
  },
};

export const SIDEBAR_STYLE = {
  background: 'bg-gradient-to-b from-indigo-800 via-purple-900 to-gray-900',
  active: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
  border: 'border-l-4 border-indigo-500',
  hover: 'hover:bg-white/5',
};

export const BUTTON_STYLE = {
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
  secondary: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
};


// Usage
// import { BRAND, BUTTON_STYLE } from '../lib/constants/brand';

// // In your components:
// <button className={`px-4 py-2 rounded-lg font-medium transition-all ${BUTTON_STYLE.primary}`}>
//   Brand Button
// </button>

// <div className={`p-6 rounded-xl ${BRAND.gradients.primary} text-white`}>
//   Brand Gradient Section
// </div>