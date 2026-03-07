import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = useAuthStore.getState().token;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export const stockTransferApi = {
  getTransfers: (params?: {
    search?: string;
    status?: string;
    fromLocation?: string;
    toLocation?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.fromLocation) queryParams.append('fromLocation', params.fromLocation);
    if (params?.toLocation) queryParams.append('toLocation', params.toLocation);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    return apiRequest(`/stock-transfers${queryString ? `?${queryString}` : ''}`);
  },

  createTransfer: (data: {
    fromLocation: string;
    fromLocationType: 'warehouse' | 'outlet';
    toLocation: string;
    toLocationType: 'warehouse' | 'outlet';
    requestedById: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedDelivery?: string;
    notes?: string;
    products: { productId: string; quantity: number }[];
  }) =>
    apiRequest('/stock-transfers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  approveTransfer: (transferId: string) =>
    apiRequest(`/stock-transfers/${transferId}/approve`, {
      method: 'PATCH'
    }),

  rejectTransfer: (transferId: string, rejectionReason: string) =>
    apiRequest(`/stock-transfers/${transferId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason })
    }),

  confirmTransfer: (transferId: string) =>
    apiRequest(`/stock-transfers/${transferId}/confirm`, {
      method: 'PATCH'
    }),

  markInTransit: (transferId: string) =>
    apiRequest(`/stock-transfers/${transferId}/in-transit`, {
      method: 'PATCH'
    }),

  completeTransfer: (transferId: string) =>
    apiRequest(`/stock-transfers/${transferId}/complete`, {
      method: 'PATCH'
    }),

  deleteTransfer: (transferId: string) =>
    apiRequest(`/stock-transfers/${transferId}`, {
      method: 'DELETE'
    })
};
