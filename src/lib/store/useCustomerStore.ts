import { create } from 'zustand';
import { customerApi } from '../api/customerApi';

export interface CustomerRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyNumber?: string;
  loyaltyPoints: number;
  totalPurchases?: number;
}

interface CustomerStoreState {
  customers: CustomerRecord[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchCustomers: (params?: { search?: string; loyaltyNumber?: string; page?: number; limit?: number }) => Promise<void>;
  createCustomer: (payload: Partial<CustomerRecord>) => Promise<void>;
  updateCustomer: (id: string, payload: Partial<CustomerRecord>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  findByLoyaltyNumber: (loyaltyNumber: string) => Promise<CustomerRecord | null>;
}

const normalizeCustomer = (customer: any): CustomerRecord => ({
  id: customer._id || customer.id,
  name: customer.name || customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
  email: customer.email,
  phone: customer.phone,
  address: customer.address,
  loyaltyNumber: customer.loyaltyNumber,
  loyaltyPoints: Number(customer.loyaltyPoints || 0),
  totalPurchases: Number(customer.totalPurchases || 0)
});

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
  customers: [],
  loading: false,
  saving: false,
  error: null,
  fetchCustomers: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await customerApi.getCustomers(params);
      set({
        customers: (response.data || []).map(normalizeCustomer),
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  createCustomer: async (payload) => {
    set({ saving: true, error: null });
    try {
      const response = await customerApi.createCustomer(payload);
      set({
        customers: [normalizeCustomer(response.data), ...get().customers],
        saving: false
      });
    } catch (error: any) {
      set({ error: error.message, saving: false });
      throw error;
    }
  },
  updateCustomer: async (id, payload) => {
    set({ saving: true, error: null });
    try {
      const response = await customerApi.updateCustomer(id, payload);
      const nextCustomer = normalizeCustomer(response.data);
      set({
        customers: get().customers.map((customer) => (customer.id === id ? nextCustomer : customer)),
        saving: false
      });
    } catch (error: any) {
      set({ error: error.message, saving: false });
      throw error;
    }
  },
  deleteCustomer: async (id) => {
    set({ saving: true, error: null });
    try {
      await customerApi.deleteCustomer(id);
      set({
        customers: get().customers.filter((customer) => customer.id !== id),
        saving: false
      });
    } catch (error: any) {
      set({ error: error.message, saving: false });
      throw error;
    }
  },
  findByLoyaltyNumber: async (loyaltyNumber) => {
    try {
      const response = await customerApi.findByLoyaltyNumber(loyaltyNumber);
      return response.data ? normalizeCustomer(response.data) : null;
    } catch {
      return null;
    }
  }
}));
