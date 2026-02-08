// src/lib/warehouseStore.ts
import { create } from 'zustand';
import { warehouseAPI, outletAPI } from '../api/warehouseApi';

interface Address {
  street?: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface Contact {
  phone?: string;
  email?: string;
  manager?: string;
}

interface Warehouse {
  _id: string;
  id: string;
  name: string;
  code: string;
  address: Address;
  contact: Contact;
  capacity: number;
  currentUtilization: number;
  isActive: boolean;
  outlets: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface Outlet {
  _id: string;
  id: string;
  name: string;
  code: string;
  type: string;
  address: Address;
  contact: Contact;
  warehouse: string | Warehouse;
  operatingHours?: {
    open: string;
    close: string;
    timezone: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface WarehouseState {
  // Data
  warehouses: Warehouse[];
  outlets: Outlet[];
  selectedWarehouse: Warehouse | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchWarehouses: (params?: any) => Promise<void>;
  fetchWarehouse: (id: string) => Promise<Warehouse>;
  createWarehouse: (warehouseData: any) => Promise<void>;
  updateWarehouse: (id: string, warehouseData: any) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  
  fetchOutlets: (params?: any) => Promise<void>;
  createOutlet: (outletData: any) => Promise<void>;
  updateOutlet: (id: string, outletData: any) => Promise<void>;
  deleteOutlet: (id: string) => Promise<void>;
  
  setSelectedWarehouse: (warehouse: Warehouse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  // Initial state
  warehouses: [],
  outlets: [],
  selectedWarehouse: null,
  loading: false,
  error: null,

  // Warehouse Actions
  fetchWarehouses: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await warehouseAPI.getWarehouses(params);
      const warehouses = response.data.map((warehouse: any) => ({
        id: warehouse._id,
        ...warehouse
      }));
      set({ warehouses, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchWarehouse: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await warehouseAPI.getWarehouse(id);
      const warehouse = {
        id: response.data._id,
        ...response.data
      };
      set({ loading: false });
      return warehouse;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createWarehouse: async (warehouseData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await warehouseAPI.createWarehouse(warehouseData);
      const newWarehouse = {
        id: response.data._id,
        ...response.data
      };
      
      set(state => ({
        warehouses: [...state.warehouses, newWarehouse],
        loading: false
      }));
      
      return newWarehouse;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateWarehouse: async (id: string, warehouseData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await warehouseAPI.updateWarehouse(id, warehouseData);
      const updatedWarehouse = {
        id: response.data._id,
        ...response.data
      };
      
      set(state => ({
        warehouses: state.warehouses.map(w => 
          w.id === id ? updatedWarehouse : w
        ),
        selectedWarehouse: state.selectedWarehouse?.id === id ? updatedWarehouse : state.selectedWarehouse,
        loading: false
      }));
      
      return updatedWarehouse;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteWarehouse: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await warehouseAPI.deleteWarehouse(id);
      
      set(state => ({
        warehouses: state.warehouses.filter(w => w.id !== id),
        selectedWarehouse: state.selectedWarehouse?.id === id ? null : state.selectedWarehouse,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Outlet Actions
  fetchOutlets: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await outletAPI.getOutlets(params);
      const outlets = response.data.map((outlet: any) => ({
        id: outlet._id,
        ...outlet
      }));
      set({ outlets, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createOutlet: async (outletData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await outletAPI.createOutlet(outletData);
      const newOutlet = {
        id: response.data._id,
        ...response.data
      };
      
      set(state => ({
        outlets: [...state.outlets, newOutlet],
        loading: false
      }));
      
      return newOutlet;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateOutlet: async (id: string, outletData: any) => {
    set({ loading: true, error: null });
    try {
      const response = await outletAPI.updateOutlet(id, outletData);
      const updatedOutlet = {
        id: response.data._id,
        ...response.data
      };
      
      set(state => ({
        outlets: state.outlets.map(o => 
          o.id === id ? updatedOutlet : o
        ),
        loading: false
      }));
      
      return updatedOutlet;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteOutlet: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await outletAPI.deleteOutlet(id);
      
      set(state => ({
        outlets: state.outlets.filter(o => o.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // UI Actions
  setSelectedWarehouse: (warehouse: Warehouse | null) => set({ selectedWarehouse: warehouse }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));