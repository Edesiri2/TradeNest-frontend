import { useAuthStore } from '../store/useAuthStore';
import type { BusinessSettings } from '../../types/settings';

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

export const settingsApi = {
  getSettings: () => apiRequest('/settings/configuration'),
  updateSettings: (payload: Partial<BusinessSettings>) =>
    apiRequest('/settings/configuration', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
};
