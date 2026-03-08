import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export const customerApi = {
  getCustomers: (params?: { search?: string; loyaltyNumber?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.loyaltyNumber) queryParams.append('loyaltyNumber', params.loyaltyNumber);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    return apiRequest(`/customers${queryString ? `?${queryString}` : ''}`);
  },
  createCustomer: (payload: any) =>
    apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateCustomer: (id: string, payload: any) =>
    apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteCustomer: (id: string) =>
    apiRequest(`/customers/${id}`, {
      method: 'DELETE'
    }),
  findByLoyaltyNumber: (loyaltyNumber: string) =>
    apiRequest(`/customers/lookup/loyalty/${encodeURIComponent(loyaltyNumber)}`)
};
