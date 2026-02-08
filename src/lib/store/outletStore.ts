// src/lib/outletStore.ts
import { create } from 'zustand';
import { outletAPI } from '../api/outletApi';

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

interface OperatingHours {
  open: string;
  close: string;
  timezone: string;
}

interface Warehouse {
  _id: string;
  id: string;
  name: string;
  code: string;
  address: Address;
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
  operatingHours: OperatingHours;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface OutletState {
  // Data
  outlets: Outlet[];
  outletTypes: string[];
  selectedOutlet: Outlet | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOutlets: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // Actions
  fetchOutlets: (params?: any) => Promise<void>;
  fetchOutlet: (id: string) => Promise<Outlet>;
  createOutlet: (outletData: any) => Promise<void>;
  updateOutlet: (id: string, outletData: any) => Promise<void>;
  deleteOutlet: (id: string) => Promise<void>;
  fetchOutletTypes: () => Promise<void>;
  
  // UI Actions
  setSelectedOutlet: (outlet: Outlet | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useOutletStore = create<OutletState>((set, get) => ({
  // Initial state
  outlets: [],
  outletTypes: [],
  selectedOutlet: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalOutlets: 0,
    hasNext: false,
    hasPrev: false
  },

  // Fetch all outlets
  fetchOutlets: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await outletAPI.getOutlets(params);
      
      const outlets = response.data.map((outlet: any) => ({
        id: outlet._id,
        ...outlet
      }));

      set({
        outlets,
        loading: false,
        pagination: response.pagination
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch single outlet
  fetchOutlet: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await outletAPI.getOutlet(id);
      const outlet = {
        id: response.data._id,
        ...response.data
      };
      set({ loading: false });
      return outlet;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Create outlet
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

  // Update outlet
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
        selectedOutlet: state.selectedOutlet?.id === id ? updatedOutlet : state.selectedOutlet,
        loading: false
      }));
      
      return updatedOutlet;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete outlet
  deleteOutlet: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await outletAPI.deleteOutlet(id);
      
      set(state => ({
        outlets: state.outlets.filter(o => o.id !== id),
        selectedOutlet: state.selectedOutlet?.id === id ? null : state.selectedOutlet,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch outlet types
  fetchOutletTypes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await outletAPI.getOutletTypes();
      set({ 
        outletTypes: response.data,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // UI Actions
  setSelectedOutlet: (outlet: Outlet | null) => set({ selectedOutlet: outlet }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));