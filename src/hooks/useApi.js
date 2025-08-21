import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { getAuthToken, getErrorMessage } from '../utils/helpers';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, config = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api[method](url, data, config);
      return response.data;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    get: useCallback((url, config) => request('get', url, null, config), [request]),
    post: useCallback((url, data, config) => request('post', url, data, config), [request]),
    put: useCallback((url, data, config) => request('put', url, data, config), [request]),
    delete: useCallback((url, config) => request('delete', url, null, config), [request]),
  };
};

export default useApi; 