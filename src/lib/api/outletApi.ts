const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Generic API request function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Outlet API
export const outletAPI = {
  // Get all outlets
  getOutlets: (params?: { 
    search?: string; 
    type?: string; 
    warehouse?: string; 
    active?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.warehouse) queryParams.append('warehouse', params.warehouse);
    if (params?.active !== undefined) queryParams.append('active', params.active.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/outlets${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get outlet types
  getOutletTypes: () => {
    return apiRequest('/outlets/types');
  },

  // Get single outlet
  getOutlet: (id: string) => {
    return apiRequest(`/outlets/${id}`);
  },

  // Create outlet
  createOutlet: (outletData: any) => {
    return apiRequest('/outlets', {
      method: 'POST',
      body: JSON.stringify(outletData),
    });
  },

  // Update outlet
  updateOutlet: (id: string, outletData: any) => {
    return apiRequest(`/outlets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(outletData),
    });
  },

  // Delete outlet
  deleteOutlet: (id: string) => {
    return apiRequest(`/outlets/${id}`, {
      method: 'DELETE',
    });
  },
};