import { create } from 'zustand';
import type { Product, Warehouse, StockTransfer, Supplier } from '../../types';
import { mockProducts, mockWarehouses, mockSuppliers, mockStockTransfers } from '../../data/mock-data';

interface InventoryStore {
  // State
  products: Product[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  stockTransfers: StockTransfer[];
  selectedProduct: Product | null;
  isLoading: boolean;
  
  // Product Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  
  // Warehouse Actions
  setWarehouses: (warehouses: Warehouse[]) => void;
  
  // Supplier Actions
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  
  // Stock Actions
  updateStock: (productId: string, newStock: number) => void;
  transferStock: (transfer: Omit<StockTransfer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  
  // Loading
  setLoading: (loading: boolean) => void;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  // Initial state with complete mock data
  products: mockProducts,
  warehouses: mockWarehouses,
  suppliers: mockSuppliers,
  stockTransfers: mockStockTransfers,
  selectedProduct: null,
  isLoading: false,

  // Product actions
  setProducts: (products) => set({ products }),
  
  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      products: [...state.products, newProduct],
    }));
  },

  updateProduct: (id, productData) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id
          ? { ...product, ...productData, updatedAt: new Date() }
          : product
      ),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    }));
  },

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  // Warehouse actions
  setWarehouses: (warehouses) => set({ warehouses }),

  // Supplier actions
  setSuppliers: (suppliers) => set({ suppliers }),
  
  addSupplier: (supplierData) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      suppliers: [...state.suppliers, newSupplier],
    }));
  },

  // Stock actions
  updateStock: (productId, newStock) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId
          ? { ...product, currentStock: newStock, updatedAt: new Date() }
          : product
      ),
    }));
  },

  transferStock: (transferData) => {
    const newTransfer: StockTransfer = {
      ...transferData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      stockTransfers: [...state.stockTransfers, newTransfer],
    }));

    // Update product stock levels
    transferData.items.forEach((item) => {
      const currentProduct = get().products.find(p => p.id === item.productId);
      if (currentProduct) {
        get().updateStock(item.productId, currentProduct.currentStock - item.quantity);
      }
    });
  },

  // Loading state
  setLoading: (loading) => set({ isLoading: loading }),
}));