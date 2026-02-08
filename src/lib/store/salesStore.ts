// src/lib/salesStore.ts
import { create } from 'zustand';
import { salesAPI } from '../api/salesApi';
import type { 
  Sale, 
  CartItem, 
  Customer, 
  PaymentInfo,
  SalesFilters,
  CreateSaleData,
  CreateCustomerData
} from '../../types/sales';

interface SalesStoreState {
  // Data
  sales: Sale[];
  customers: Customer[];
  cart: CartItem[];
  currentSale: Sale | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Selection state
  selectedCustomer: Customer | null;
  paymentInfo: PaymentInfo | null;
  
  // Pagination & Summary
  pagination: {
    currentPage: number;
    totalPages: number;
    totalSales: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    todaySales: number;
    todayCount: number;
    totalRevenue: number;
    totalSales: number;
  };
}

interface SalesStoreActions {
  // Sales operations
  fetchSales: (filters?: SalesFilters) => Promise<void>;
  fetchSaleById: (id: string) => Promise<Sale | null>;
  createSale: (saleData: CreateSaleData) => Promise<Sale>;
  refundSale: (id: string, reason?: string) => Promise<void>;
  
  // Customer operations
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: CreateCustomerData) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  
  // Cart operations
  addToCart: (item: Omit<CartItem, 'total'>) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  
  // Payment operations
  setPaymentInfo: (paymentInfo: PaymentInfo) => void;
  
  // UI operations
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type SalesStore = SalesStoreState & SalesStoreActions;

export const useSalesStore = create<SalesStore>((set, get) => ({
  // Initial state
  sales: [],
  customers: [],
  cart: [],
  currentSale: null,
  loading: false,
  error: null,
  selectedCustomer: null,
  paymentInfo: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalSales: 0,
    hasNext: false,
    hasPrev: false
  },
  summary: {
    todaySales: 0,
    todayCount: 0,
    totalRevenue: 0,
    totalSales: 0
  },

  // Fetch all sales - FIXED VERSION
  fetchSales: async (filters: SalesFilters = {}) => {
    set({ loading: true, error: null });
    try {
      // Convert Date objects to ISO strings for the API
      const apiParams: any = { ...filters };
      
      if (filters.startDate) {
        apiParams.startDate = filters.startDate.toISOString();
      }
      
      if (filters.endDate) {
        apiParams.endDate = filters.endDate.toISOString();
      }

      const response = await salesAPI.getSales(apiParams);
      
      // Transform API response to match your Sale type
      const sales: Sale[] = response.data.map((apiSale: any) => ({
        id: apiSale._id || apiSale.id,
        outletId: apiSale.outlet?._id || apiSale.outletId || 'default-outlet',
        userId: apiSale.cashier || apiSale.userId || 'default-user',
        items: apiSale.items.map((item: any) => ({
          id: item._id || Math.random().toString(36).substr(2, 9),
          productId: item.product?._id || item.productId,
          productName: item.product?.name || item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total || item.quantity * item.unitPrice,
        })),
        totalAmount: apiSale.totalAmount || apiSale.subtotal,
        taxAmount: apiSale.taxAmount,
        discountAmount: apiSale.discountAmount,
        paymentMethod: (apiSale.paymentMethod as 'cash' | 'card' | 'transfer' | 'mobile') || 'cash',
        paymentStatus: (apiSale.paymentStatus as 'pending' | 'completed' | 'failed' | 'refunded') || 'completed',
        customerId: apiSale.customer?._id || apiSale.customerId,
        notes: apiSale.notes,
        createdAt: new Date(apiSale.createdAt),
        updatedAt: new Date(apiSale.updatedAt),
      }));

      set({
        sales,
        loading: false,
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalSales: sales.length,
          hasNext: false,
          hasPrev: false
        },
        summary: response.summary || {
          todaySales: 0,
          todayCount: 0,
          totalRevenue: 0,
          totalSales: sales.length
        }
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch single sale
  fetchSaleById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await salesAPI.getSale(id);
      const apiSale = response.data;
      
      // Transform to your Sale type
      const sale: Sale = {
        id: apiSale._id,
        outletId: apiSale.outlet?._id || 'default-outlet',
        userId: apiSale.cashier || 'default-user',
        items: apiSale.items.map((item: any) => ({
          id: item._id || Math.random().toString(36).substr(2, 9),
          productId: item.product?._id || item.productId,
          productName: item.product?.name || item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total || item.quantity * item.unitPrice,
        })),
        totalAmount: apiSale.totalAmount || apiSale.subtotal,
        taxAmount: apiSale.taxAmount,
        discountAmount: apiSale.discountAmount,
        paymentMethod: apiSale.paymentMethod as 'cash' | 'card' | 'transfer' | 'mobile',
        paymentStatus: apiSale.paymentStatus as 'pending' | 'completed' | 'failed' | 'refunded',
        customerId: apiSale.customer?._id,
        notes: apiSale.notes,
        createdAt: new Date(apiSale.createdAt),
        updatedAt: new Date(apiSale.updatedAt),
      };
      
      set({ loading: false, currentSale: sale });
      return sale;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Create new sale
  createSale: async (saleData: CreateSaleData) => {
    set({ loading: true, error: null });
    try {
      const response = await salesAPI.createSale(saleData);
      const apiSale = response.data;
      
      // Transform to your Sale type
      const newSale: Sale = {
        id: apiSale._id,
        outletId: apiSale.outlet?._id || saleData.outletId,
        userId: apiSale.cashier || saleData.userId,
        items: apiSale.items.map((item: any, index: number) => ({
          id: item._id || Math.random().toString(36).substr(2, 9),
          productId: item.product?._id || saleData.items[index]?.productId,
          productName: item.product?.name || saleData.items[index]?.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total || item.quantity * item.unitPrice,
        })),
        totalAmount: apiSale.totalAmount || saleData.totalAmount,
        taxAmount: apiSale.taxAmount || saleData.taxAmount,
        discountAmount: apiSale.discountAmount || saleData.discountAmount,
        paymentMethod: apiSale.paymentMethod as 'cash' | 'card' | 'transfer' | 'mobile',
        paymentStatus: 'completed',
        customerId: apiSale.customer?._id || saleData.customerId,
        notes: apiSale.notes || saleData.notes,
        createdAt: new Date(apiSale.createdAt),
        updatedAt: new Date(apiSale.updatedAt),
      };
      
      set(state => ({
        sales: [newSale, ...state.sales],
        loading: false,
        currentSale: newSale
      }));
      
      return newSale;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Refund sale
  refundSale: async (id: string, reason?: string) => {
    set({ loading: true, error: null });
    try {
      await salesAPI.refundSale(id, { reason });
      
      set(state => ({
        sales: state.sales.map(sale => 
          sale.id === id 
            ? { ...sale, paymentStatus: 'refunded' as const }
            : sale
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Customer operations
  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      // Implement your customers API call here
      // const response = await customersAPI.getCustomers();
      // set({ customers: response.data, loading: false });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addCustomer: (customerData: CreateCustomerData) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Math.random().toString(36).substr(2, 9),
      totalPurchases: 0,
      loyaltyPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      customers: [...state.customers, newCustomer],
    }));
  },

  setSelectedCustomer: (customer: Customer | null) => {
    set({ selectedCustomer: customer });
  },

  // Cart Actions
  addToCart: (item: Omit<CartItem, 'total'>) => {
    set(state => {
      const existingItem = state.cart.find(cartItem => cartItem.productId === item.productId);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + item.quantity;
        if (newQuantity > item.stock) {
          return state;
        }
        
        return {
          cart: state.cart.map(cartItem =>
            cartItem.productId === item.productId
              ? {
                  ...cartItem,
                  quantity: newQuantity,
                  total: newQuantity * cartItem.unitPrice
                }
              : cartItem
          )
        };
      } else {
        const newItem: CartItem = {
          ...item,
          total: item.quantity * item.unitPrice
        };
        
        return {
          cart: [...state.cart, newItem]
        };
      }
    });
  },

  updateCartItem: (productId: string, quantity: number) => {
    set(state => ({
      cart: state.cart.map(item =>
        item.productId === productId
          ? {
              ...item,
              quantity: quantity,
              total: quantity * item.unitPrice
            }
          : item
      ).filter(item => item.quantity > 0)
    }));
  },

  removeFromCart: (productId: string) => {
    set(state => ({
      cart: state.cart.filter(item => item.productId !== productId)
    }));
  },

  clearCart: () => {
    set({ cart: [] });
  },

  getCartTotal: () => {
    const state = get();
    return state.cart.reduce((total, item) => total + item.total, 0);
  },

  getCartItemCount: () => {
    const state = get();
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  },

  // Payment operations
  setPaymentInfo: (paymentInfo: PaymentInfo) => {
    set({ paymentInfo });
  },

  // UI Actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));