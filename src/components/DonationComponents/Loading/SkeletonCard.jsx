import React from 'react';

const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-gray-100 p-6">
    <div className="h-6 w-24 bg-gray-200 rounded mb-3" />
    <div className="h-4 w-full bg-gray-200 rounded" />
  </div>
);

export default SkeletonCard;
