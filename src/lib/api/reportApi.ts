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

const buildQuery = (params?: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const reportApi = {
  getDashboardSummary: (params?: { outletId?: string; period?: string; startDate?: string; endDate?: string }) =>
    apiRequest(`/reports/dashboard${buildQuery(params)}`),
  getSalesReport: (params?: { outletId?: string; period?: string; startDate?: string; endDate?: string }) =>
    apiRequest(`/reports/sales${buildQuery(params)}`),
  getInventoryReport: (params?: { outletId?: string; period?: string; startDate?: string; endDate?: string }) =>
    apiRequest(`/reports/inventory${buildQuery(params)}`),
  getProfitLossReport: (params?: { outletId?: string; period?: string; startDate?: string; endDate?: string }) =>
    apiRequest(`/reports/profit-loss${buildQuery(params)}`),
  getCustomerAnalytics: (params?: { outletId?: string; period?: string; startDate?: string; endDate?: string }) =>
    apiRequest(`/reports/customer-analytics${buildQuery(params)}`),
  getOperationalCosts: (params?: { outletId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    apiRequest(`/reports/operational-costs${buildQuery(params)}`),
  getOperationalCostCategories: () =>
    apiRequest('/reports/operational-cost-categories'),
  getOperationalCostCategory: (id: string) =>
    apiRequest(`/reports/operational-cost-categories/${id}`),
  createOperationalCostCategory: (payload: any) =>
    apiRequest('/reports/operational-cost-categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateOperationalCostCategory: (id: string, payload: any) =>
    apiRequest(`/reports/operational-cost-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteOperationalCostCategory: (id: string) =>
    apiRequest(`/reports/operational-cost-categories/${id}`, {
      method: 'DELETE'
    }),
  createOperationalCost: (payload: any) =>
    apiRequest('/reports/operational-costs', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateOperationalCost: (id: string, payload: any) =>
    apiRequest(`/reports/operational-costs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteOperationalCost: (id: string) =>
    apiRequest(`/reports/operational-costs/${id}`, {
      method: 'DELETE'
    })
};
