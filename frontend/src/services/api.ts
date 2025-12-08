import axios, { AxiosError } from 'axios';
import  type { ApiConfig } from '@/types/allTypes';
import { API_CONFIG } from '@/config/index';
import ApiError from '@/errors/ApiError';

const BASE_URL = API_CONFIG.BASE_URL;


async function apiCall<T = any>(endpoint: string, options?: ApiConfig): Promise<T> {
  const { timeout = 120000, ...axiosOptions } = options || {}; // timeout is in ms
  try {
    const response = await axios({
      url: `${BASE_URL}${endpoint}`,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...axiosOptions?.headers,
      },
      ...axiosOptions,
    });
    
    return response.data;
  }
  
  catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle timeout
      if (axiosError.code === 'ECONNABORTED') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      // Handle HTTP errors
      if (axiosError.response) {
        throw new ApiError(
          axiosError.response.status,
          axiosError.response.statusText,
          axiosError.response.data
        );
      }
    }
    
    throw error;
  }
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, options?: ApiConfig) =>
    apiCall<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, body?: any, options?: ApiConfig) =>
    apiCall<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      data: body 
    }),
    
  put: <T = any>(endpoint: string, body?: any, options?: ApiConfig) =>
    apiCall<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      data: body 
    }),
    
  delete: <T = any>(endpoint: string, options?: ApiConfig) =>
    apiCall<T>(endpoint, { 
      ...options, 
      method: 'DELETE' 
    }),
};