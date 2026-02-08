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

// Sales API
export const salesAPI = {
  // Get all sales
  getSales: (params?: { 
    search?: string; 
    paymentMethod?: string; 
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    outlet?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.outlet) queryParams.append('outlet', params.outlet);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/sales${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get sales analytics
  getSalesAnalytics: (params?: { period?: string; outlet?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.outlet) queryParams.append('outlet', params.outlet);

    const queryString = queryParams.toString();
    const endpoint = `/sales/analytics${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get single sale
  getSale: (id: string) => {
    return apiRequest(`/sales/${id}`);
  },

  // Create new sale
  createSale: (saleData: any) => {
    return apiRequest('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  },

  // Refund sale
  refundSale: (id: string, refundData: any) => {
    return apiRequest(`/sales/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  },
};