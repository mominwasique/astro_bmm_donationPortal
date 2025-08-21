import React from 'react';

const DonationCard = ({ title, description, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer rounded-xl border border-primary/40 p-6 transition-all hover:border-primary hover:shadow-[0_0_15px_rgba(196,146,97,0.3)] hover:-translate-y-1"
  >
    <h3 className="text-lg font-semibold text-black select-none">{title}</h3>
    {/* <p className="mt-2 text-sm text-gray-600">{description}</p> */}
  </div>
);

export default DonationCard; 