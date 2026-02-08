import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Generic API request function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from auth store
  const token = useAuthStore.getState().token;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
       // If unauthorized, clear auth and redirect to login
      if (response.status === 401) {
        useAuthStore.getState().logout();
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Product API
export const productAPI = {
  // Get all products
  getProducts: (params?: { 
    search?: string; 
    category?: string; 
    page?: number; 
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get single product
  getProduct: (id: string) => {
    return apiRequest(`/products/${id}`);
  },

  // Create product
  createProduct: (productData: any) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Update product
  updateProduct: (id: string, productData: any) => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // Delete product
  deleteProduct: (id: string) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Get categories
  getCategories: () => {
    return apiRequest('/products/categories');
  },

  // Get low stock products
  getLowStockProducts: () => {
    return apiRequest('/products/alerts/low-stock');
  },

  // NEW API METHODS FOR APPROVAL WORKFLOW
  
  // Get pending products
  getPendingProducts: (params?: { 
    page?: number; 
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/products/pending${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Approve product
  approveProduct: (productId: string) => {
    return apiRequest(`/products/${productId}/approve`, {
      method: 'PATCH',
    });
  },

  // Reject product
  rejectProduct: (productId: string, rejectionReason: string) => {
    return apiRequest(`/products/${productId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason }),
    });
  },
};