import React, { useState, useEffect } from "react";
import { Mail, Phone, MessageSquare, Mailbox, Info, AlertCircle, Check } from "lucide-react";

const CompactGiftAid = ({ preferences, setPreferences }) => {
  const [showFeeInfo, setShowFeeInfo] = useState(false);
  const showCoverFee = import.meta.env.PUBLIC_ENABLE_COVER_FEE === "false";

  // Initialize localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('donationPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    } else {
      setPreferences(prev => ({
        ...prev,
        giftAid: false,
        email: false,
        phone: false,
        post: false,
        sms: false
      }));
    }
  }, []);

  // Save to localStorage whenever preferences change
  useEffect(() => {
    localStorage.setItem('donationPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const toggleAll = (checked) => {
    setPreferences((prev) => ({
      ...prev,
      email: checked,
      phone: checked,
      post: checked,
      sms: checked,
    }));
  };

  // Calculate the fee amount based on donation amount (if available)
  const calculateFee = () => {
    if (preferences.donationAmount) {
      return (preferences.donationAmount * 0.0125).toFixed(2);
    }
    return "a small amount";
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="relative overflow-hidden bg-gradient-to-br from-secondary-50 via-white to-primary-50 border-2 border-secondary-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1  border-primary ">


        <div className="relative z-10">
          <div className="flex items-start space-x-4">


            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-xl font-bold bg-primary bg-clip-text text-transparent mb-2">
                  Boost your donation by 25%
                </h3>
                <p className="text-gray-700 font-medium">
                  UK taxpayer? Add Gift Aid at no extra cost to you
                </p>
              </div>

              <div className=" rounded-xl p-4 border border-secondary-200 shadow-sm mb-4 bg-primary">
                <div className="flex items-center space-x-3">
                  <div className="relative">

                    <input
                      type="checkbox"
                      id="gift-aid"
                      checked={preferences.giftAid}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, giftAid: e.target.checked }))
                      }
                      className="w-6 h-6 rounded-lg border-2 border-gray-300 text-secondary-500 focus:ring-secondary-500 focus:ring-2 bg-white hover:border-secondary-400 hover:shadow-md transition-all duration-300 transform hover:scale-110 cursor-pointer"

                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity duration-300"></div>
                    <i data-lucide="check" className="absolute inset-0 w-4 h-4 text-primary m-auto opacity-0 peer-checked:opacity-100 animate-pulse pointer-events-none"></i>
                  </div>
                  <label
                    for="gift-aid"
                    className="text-white font-semibold cursor-pointer hover:text-secondary-600 transition-colors duration-200"
                  >
                    Yes, add Gift Aid to my donation
                  </label>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 via-white to-primary-50 rounded-xl p-4 border-l-4 border-l-primary shadow-inner border-2 border-primary">
                <div className="flex items-start space-x-2">
                  <div className="bg-primary-100 p-1 rounded-full mt-1 flex-shrink-0">
                    <i data-lucide="check" className="w-3.5 h-3.5 text-primary-600"></i>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    I want to Gift Aid any donations made to Benefit Mankind now, in the future and in the past four years.
                    I am a UK taxpayer and I understand that if I pay less Income and/or Capital Gains Tax than the amount
                    of Gift Aid claimed on all my donations in the relevant tax year, it is my responsibility to pay any difference.
                    The Gift Aid claimed will be used to help fund the running costs of Benefit Mankind's work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Communication Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-md font-semibold mb-1 sm:mb-0 text-primary">Stay updated via:</h3>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="select-all"
              checked={
                preferences.email &&
                preferences.phone &&
                preferences.post &&
                preferences.sms
              }
              onChange={(e) => toggleAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary transform hover:scale-110 transition-transform duration-200"

            />
            <label htmlFor="select-all" className="ml-2 text-sm hover:text-secondary transition-colors duration-200">Select all</label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Mail, label: "Email", key: "email" },
            { icon: Phone, label: "Phone", key: "phone" },
            { icon: Mailbox, label: "Post", key: "post" },
            { icon: MessageSquare, label: "SMS", key: "sms" },
          ].map(({ icon: Icon, label, key }) => (
            <div
              key={key}
              onClick={() =>
                setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
              }
              className={`flex flex-col items-center p-3 rounded-lg border transform hover:scale-105 transition-all duration-300 ${preferences[key]
                ? "border-primary bg-gradient-to-br from-primary-50 to-white shadow-md"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                } cursor-pointer`}
            >
              <Icon size={18} className={`${preferences[key] ? "text-primary " : "text-gray-500"}`} />
              <span className="mt-1 text-sm font-medium">{label}</span>

            </div>
          ))}
        </div>
      </div>

      {/* Legal Text */}
      <div className="text-xs text-gray-600 leading-relaxed bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
        <p className="hover:text-primary transition-colors duration-200">
          <span className="font-medium text-secondary">Gift Aid:</span> By checking Gift Aid, I confirm I am a UK taxpayer and understand I must pay Income/Capital Gains Tax equal to the Gift Aid claimed.
        </p>
        <p className="mt-1 hover:text-primary transition-colors duration-200">
          <span className="font-medium text-secondary">Communication:</span> We protect your data and only contact you according to your preferences. See our Privacy Policy for details.
        </p>
        <p className="mt-1">
          For any questions or to update your preferences, contact <span className="text-secondary hover:text-primary cursor-pointer transition-colors duration-200">{import.meta.env.PUBLIC_CONTACT_MAIL}</span>

        </p>
      </div>
    </div>
  );
};

export default CompactGiftAid;