import { Gift } from 'lucide-react';
import React from 'react';

const CompactFooter = () => {
  return (
    <footer className="bg-primary text-white font-sans py-6 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Details Section */}
        <div className="space-y-2">
          <h3 className="text-secondary font-medium text-lg border-b border-secondaryDark pb-1 mb-2">BANK TRANSFER DETAILS</h3>

          <div className="text-sm space-y-1">
            <p>Account: Global Care Foundation</p>
            <p>Sort Code: 30-97-97</p>
            <p>Account No: 00920566</p>
            <p className="text-xs text-gray-300">BIC: TSBSGB2AXXX</p>
            <p className="text-xs text-gray-300">IBAN: GB79TSBS30979700920566</p>
            <p className="text-xs italic text-gray-300 mt-1">
              Reference: ZN-(Zakat/Fitra/Sadaqah/etc.)
            </p>
          </div>
        </div>

        {/* Help Children Section */}
        <div className="space-y-3">
          <h3 className="text-secondary font-medium text-lg border-b border-secondaryDark pb-1 mb-2">HELP DISABLED CHILDREN</h3>

          <div className="text-sm space-y-3">
            <div className="flex items-start">
              <div className="text-secondary mr-2 flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-medium">100% Donation Policy</h4>
                <p className="text-gray-300 text-xs">All money goes to the cause</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-secondary mr-2 flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Education & Rehabilitation</h4>
                <p className="text-gray-300 text-xs">Life-changing support for children</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-secondary mr-2 flex-shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium">Gift Aid</h4>
                <p className="text-gray-300 text-xs">+25p for every £1 at no cost to you</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-primaryHover">
        <p> {new Date().getFullYear()} Global Care Foundation. Your donation is greatly appreciated!</p>
      </div>
    </footer>
  );
};

export default CompactFooter;