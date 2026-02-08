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

// Location API
export const locationAPI = {
  // Get all warehouses
  getWarehouses: () => {
    return apiRequest('/warehouses');
  },

  // Get all outlets
  getOutlets: () => {
    return apiRequest('/outlets');
  },

  // Get warehouse by ID
  getWarehouse: (id: string) => {
    return apiRequest(`/warehouses/${id}`);
  },

  // Get outlet by ID
  getOutlet: (id: string) => {
    return apiRequest(`/outlets/${id}`);
  },
};