import React from 'react';

const PaymentButton = ({ icon, text, onClick, isSelected }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-lg border px-4 py-3 text-center transition-all ${isSelected
        ? 'border-blue-500 bg-blue-50 shadow-md'
        : 'border-gray-300 bg-white hover:border-blue-500 hover:shadow-md'
      }`}
  >
    {icon} {text}
  </button>
);

export default PaymentButton;