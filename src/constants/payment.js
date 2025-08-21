// PayPal Fee Constants
export const PAYPAL_PERCENTAGE_FEE = 0.014; // 1.4%
export const PAYPAL_FIXED_FEE = 0.2; // Fixed fee in GBP
export const ADDITIONAL_FEE = 0.25;

// Payment Limits
export const MIN_DONATION_AMOUNT = 1.0; // Minimum donation amount in GBP
export const MAX_DONATION_AMOUNT = 10000.0; // Maximum donation amount in GBP

// Error Messages
export const PAYPAL_ERROR_MESSAGES = {
  SCRIPT_LOAD_ERROR:
    "We're having trouble loading the payment system. Please try again in a few minutes.",
  INVALID_AMOUNT: (min) =>
    `Please enter a valid donation amount (minimum £${min})`,
  PAYMENT_FAILED:
    "We couldn't complete your payment. Please try again or use a different payment method.",
  CONNECTION_ERROR:
    "We couldn't connect to PayPal. Please try again or use a different payment method.",
  CANCELLED: "You can try again when you're ready to complete your donation.",
  PROCESSING_ERROR:
    "We're having trouble processing your donation. Please try again or contact our support team.",
  CART_ERROR:
    "We couldn't find your donation details. Please try again or contact our support team.",
  ENCRYPTION_ERROR:
    "We're having trouble completing your donation. Please contact our support team for assistance.",
};
