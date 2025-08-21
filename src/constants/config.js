export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:4321/api';
export const STRIPE_PUBLIC_KEY = 'pk_test_51OpqyISCpAlqBVLzSBLMsm0w76Fvs0TkHkitCp7c5KFFk0DxPpVyU7do8eAJyi2SR4QAFnhNyphoteu9Yd16qswN00dQN0O2Jq';
export const PAYPAL_CLIENT_ID = import.meta.env.PUBLIC_PAYPAL_CLIENT_ID;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
  CHECKOUT: '/checkout',
  PAYMENT_SUCCESS: '/payment-success',
};

export const CART_STORAGE_KEY = 'donation_cart';
export const AUTH_TOKEN_KEY = 'auth_token';

export const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
};

export const DONATION_AMOUNTS = [10, 25, 50, 100, 250, 500, 1000];

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
}; 