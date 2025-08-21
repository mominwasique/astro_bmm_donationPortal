import React from 'react';

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center text-primary transition-colors"
  >
    <span className="mr-2">←</span> Back
  </button>
);
export default BackButton;
