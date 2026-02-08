// src/lib/store.ts
import { create } from 'zustand';
import { productAPI } from '../api/productApi';

interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  lowStockAlert: number;
  supplierId?: string;
  warehouseId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // NEW FIELDS ADDED BELOW
  status?: 'pending' | 'approved' | 'rejected';
  locationType?: 'warehouse' | 'outlet';
  locationId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

interface InventoryState {
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    lowStockCount: number;
    totalValue: number;
  };
  // NEW STATE FOR PENDING PRODUCTS
  pendingProducts: Product[];
  pendingPagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // Actions
  fetchProducts: (params?: any) => Promise<void>;
  fetchProduct: (id: string) => Promise<Product>;
  addProduct: (productData: any) => Promise<void>;
  updateProduct: (id: string, productData: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchLowStockProducts: () => Promise<Product[]>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // NEW ACTIONS FOR APPROVAL WORKFLOW
  fetchPendingProducts: (params?: any) => Promise<void>;
  approveProduct: (productId: string) => Promise<void>;
  rejectProduct: (productId: string, rejectionReason: string) => Promise<void>;
}

export const productStore = create<InventoryState>((set, get) => ({
  // Initial state
  products: [],
  categories: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false
  },
  summary: {
    lowStockCount: 0,
    totalValue: 0
  },
  // NEW INITIAL STATE FOR PENDING PRODUCTS
  pendingProducts: [],
  pendingPagination: {
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false
  },

  // Fetch all products
  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.getProducts(params);
      
      // Transform API response to match frontend structure
      const products = response.data.map((product: any) => ({
        id: product._id,
        ...product
      }));

      set({
        products,
        loading: false,
        pagination: response.pagination,
        summary: response.summary
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch single product
  fetchProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.getProduct(id);
      const product = {
        id: response.data._id,
        ...response.data
      };
      set({ loading: false });
      return product;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Add new product
  addProduct: async (productData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.createProduct(productData);
      const newProduct = {
        id: response.data._id,
        ...response.data
      };
      
      // Add to local state
      set(state => ({
        products: [...state.products, newProduct],
        loading: false
      }));
      
      return newProduct;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update product
  updateProduct: async (id: string, productData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.updateProduct(id, productData);
      const updatedProduct = {
        id: response.data._id,
        ...response.data
      };
      
      // Update local state
      set(state => ({
        products: state.products.map(p => 
          p.id === id ? updatedProduct : p
        ),
        loading: false
      }));
      
      return updatedProduct;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await productAPI.deleteProduct(id);
      
      // Remove from local state
      set(state => ({
        products: state.products.filter(p => p.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch categories
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.getCategories();
      set({ 
        categories: response.data,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch low stock products
  fetchLowStockProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.getLowStockProducts();
      const products = response.data.map((product: any) => ({
        id: product._id,
        ...product
      }));
      set({ loading: false });
      return products;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // NEW ACTION: Fetch pending products
  fetchPendingProducts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.getPendingProducts(params);
      
      // Transform API response to match frontend structure
      const pendingProducts = response.data.map((product: any) => ({
        id: product._id,
        ...product
      }));

      set({
        pendingProducts,
        loading: false,
        pendingPagination: response.pagination
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // NEW ACTION: Approve product
  approveProduct: async (productId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.approveProduct(productId);
      const approvedProduct = {
        id: response.data._id,
        ...response.data
      };
      
      // Remove from pending products and add to main products
      set(state => ({
        pendingProducts: state.pendingProducts.filter(p => p.id !== productId),
        products: [...state.products, approvedProduct],
        loading: false
      }));
      
      return approvedProduct;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // NEW ACTION: Reject product
  rejectProduct: async (productId: string, rejectionReason: string) => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.rejectProduct(productId, rejectionReason);
      const rejectedProduct = {
        id: response.data._id,
        ...response.data
      };
      
      // Remove from pending products
      set(state => ({
        pendingProducts: state.pendingProducts.filter(p => p.id !== productId),
        loading: false
      }));
      
      return rejectedProduct;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // UI Actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));