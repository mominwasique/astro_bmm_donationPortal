import { CART_STORAGE_KEY, AUTH_TOKEN_KEY } from '../constants/config';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getCartFromStorage = () => {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error parsing cart from storage:', error);
    return [];
  }
};

export const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const setAuthToken = (token) => localStorage.setItem(AUTH_TOKEN_KEY, token);
export const removeAuthToken = () => localStorage.removeItem(AUTH_TOKEN_KEY);

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePassword = (password) => password.length >= 8;

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateOrderId = () => {
  return `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data.message || error.response.data.error || 'An error occurred';
  }
  if (error.request) {
    return 'Network error. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred';
}; 