import { useState, useEffect, useCallback, useRef } from 'react';

// Types
export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface UseApiOptions {
  manual?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

// API Client
class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;
  private timeout: number;

  constructor(config: ApiConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.timeout = config.timeout || 10000;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: { ...this.headers, ...headers },
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { ...this.headers, ...headers },
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'PUT',
      headers: { ...this.headers, ...headers },
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'PATCH',
      headers: { ...this.headers, ...headers },
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      headers: { ...this.headers, ...headers },
    });
    return this.handleResponse<T>(response);
  }
}

// Create a default API client instance
const defaultApiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'https://jsonplaceholder.typicode.com',
});

// Main hook for API calls
export function useApi<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    loading: !options.manual,
    error: null,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(
    async (data?: any, customHeaders?: Record<string, string>): Promise<T | null> => {
      if (!isMounted.current) return null;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        let response: T;
        
        switch (method) {
          case 'GET':
            response = await defaultApiClient.get<T>(endpoint, customHeaders);
            break;
          case 'POST':
            response = await defaultApiClient.post<T>(endpoint, data, customHeaders);
            break;
          case 'PUT':
            response = await defaultApiClient.put<T>(endpoint, data, customHeaders);
            break;
          case 'PATCH':
            response = await defaultApiClient.patch<T>(endpoint, data, customHeaders);
            break;
          case 'DELETE':
            response = await defaultApiClient.delete<T>(endpoint, customHeaders);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        if (isMounted.current) {
          setState({
            data: response,
            loading: false,
            error: null,
          });
          
          options.onSuccess?.(response);
        }

        return response;
      } catch (error) {
        if (isMounted.current) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          
          options.onError?.(errorMessage);
        }
        return null;
      }
    },
    [method, endpoint, options.onSuccess, options.onError]
  );

  // Auto-execute for non-manual calls
  useEffect(() => {
    if (!options.manual) {
      execute();
    }
  }, [execute, options.manual]);

  return {
    ...state,
    execute,
    refetch: () => execute(),
  };
}

// Convenience hooks for specific methods
export function useGet<T = any>(endpoint: string, options?: UseApiOptions) {
  return useApi<T>('GET', endpoint, options);
}

export function usePost<T = any>(endpoint: string, options?: UseApiOptions) {
  return useApi<T>('POST', endpoint, { ...options, manual: true });
}

export function usePut<T = any>(endpoint: string, options?: UseApiOptions) {
  return useApi<T>('PUT', endpoint, { ...options, manual: true });
}

export function usePatch<T = any>(endpoint: string, options?: UseApiOptions) {
  return useApi<T>('PATCH', endpoint, { ...options, manual: true });
}

export function useDelete<T = any>(endpoint: string, options?: UseApiOptions) {
  return useApi<T>('DELETE', endpoint, { ...options, manual: true });
}

// Hook for creating custom API client
export function useApiClient(config?: ApiConfig) {
  return new ApiClient(config);
}

// Export the API client class for direct usage
export { ApiClient };