import React from 'react';

const ErrorMessage = ({ message, onRetry }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
    <p className="font-medium">Error loading categories</p>
    <p className="text-sm mt-1">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 text-sm font-medium text-red-700 hover:text-red-800"
      >
        Try again
      </button>
    )}
  </div>
);

export default ErrorMessage;