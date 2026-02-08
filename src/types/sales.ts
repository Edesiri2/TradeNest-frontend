import type { BaseEntity } from './common';

export interface Sale extends BaseEntity {
  outletId: string;
  userId: string;
  items: SaleItem[];
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mobile';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  customerId?: string;
  notes?: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Customer extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  lastPurchaseDate?: Date;
  loyaltyPoints: number;
  notes?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  stock: number;
}

export interface PaymentInfo {
  method: 'cash' | 'card' | 'transfer' | 'mobile';
  amount: number;
  reference?: string;
}

export interface ReceiptData {
  saleId: string;
  outletName: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  change?: number;
  date: Date;
}

// New types for the store state
export interface SalesState {
  sales: Sale[];
  customers: Customer[];
  currentSale: Sale | null;
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  selectedCustomer: Customer | null;
  paymentInfo: PaymentInfo | null;
}

// Store actions
export interface SalesActions {
  // Sales operations
  fetchSales: (filters?: SalesFilters) => Promise<void>;
  fetchSaleById: (id: string) => Promise<Sale | null>;
  createSale: (saleData: CreateSaleData) => Promise<Sale>;
  updateSale: (id: string, saleData: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  refundSale: (id: string, reason?: string) => Promise<void>;
  
  // Customer operations
  fetchCustomers: () => Promise<void>;
  fetchCustomerById: (id: string) => Promise<Customer | null>;
  createCustomer: (customerData: CreateCustomerData) => Promise<Customer>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Cart operations
  addToCart: (item: Omit<CartItem, 'total'>) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  
  // Payment operations
  setPaymentInfo: (paymentInfo: PaymentInfo) => void;
  processPayment: () => Promise<ReceiptData>;
  
  // Selection operations
  setSelectedCustomer: (customer: Customer | null) => void;
  
  // Utility operations
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Additional types for API and forms
export interface CreateSaleData {
  outletId: string;
  userId: string;
  items: Omit<SaleItem, 'id'>[];
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mobile';
  customerId?: string;
  notes?: string;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface SalesFilters {
  startDate?: Date;
  endDate?: Date;
  outletId?: string;
  paymentMethod?: string;
  customerId?: string;
}

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  averageSale: number;
  totalTransactions: number;
  popularProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
}

// Hook return type
export type UseSalesStore = SalesState & SalesActions;