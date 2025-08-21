import React, { useState, useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import toast from "react-hot-toast";
import { createSingleDonation } from "../../../api/donationApi";
import useSessionId from "../../../hooks/useSessionId";
import { encryptData } from "../../../utils/functions";

const PaymentForm = ({ amount, setAmount, onPaymentComplete }) => {
  const session = useSessionId();
  const [coverFee, setCoverFee] = useState(true);
  const [totalAmount, setTotalAmount] = useState("0.00");

  // PayPal discounted transaction fees for UK charities
  const PAYPAL_PERCENTAGE_FEE = 0.014; // 1.4%
  const PAYPAL_FIXED_FEE = 0.20; // Fixed fee in GBP
  const additionalFee = 0.25;

  // Function to calculate total amount including PayPal fees
  const calculateTotalAmount = (coverFee) => {
    if (coverFee) {
      return (
        parseFloat(amount) +
        parseFloat(amount) * PAYPAL_PERCENTAGE_FEE +
        PAYPAL_FIXED_FEE +
        additionalFee
      ).toFixed(2);
    } else {
      return amount;
    }
  };

  // Update total amount whenever coverFee or amount changes
  useEffect(() => {
    setTotalAmount(calculateTotalAmount(coverFee));
  }, [coverFee, amount]);

  const handleCreateDonation = async (donationData) => {
    try {
      toast.loading("Processing donation...");
      await createSingleDonation(donationData);
      toast.dismiss();
      toast.success("Donation successful!");
      const userData = localStorage.getItem("userData");
      if (userData) {
        const encryptedData = encryptData(userData);
        window.location.href = `/payment-success?data=${encodeURIComponent(encryptedData)}`;
      }
      onPaymentComplete();
    } catch (error) {
      console.error("Error creating donation:", error);
      toast.dismiss();
      toast.error(error.message);
    } finally {
      toast.dismiss();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6">
      {/* Highlighted Amount Display */}
      <div className="mb-6 text-center">
        <h2 className="text-gray-600 font-medium text-lg">Total Donation Amount</h2>
        <div className="text-4xl font-bold text-[#2C0E8C] mt-2">
          £{totalAmount}
        </div>
      </div>

      {/* Cover Fee Checkbox */}
      <div className="mb-6 flex items-center justify-center">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={coverFee}
            onChange={(e) => setCoverFee(e.target.checked)}
            className="form-checkbox h-5 w-5 text-[#2C0E8C] rounded border-gray-300"
          />
          <span className="ml-2 text-gray-700">I want to cover the transaction fee</span>
        </label>
      </div>

      {/* PayPal Integration */}
      <div className="space-y-4">
        <PayPalScriptProvider
          options={{
            "client-id": import.meta.env.PUBLIC_PAYPAL_CLIENT_ID,
            currency: "GBP",
            intent: "capture",
          }}
        >
          <PayPalButtons
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: parseFloat(totalAmount).toFixed(2)
                    },
                  },
                ],
              });
            }}
            onApprove={(data, actions) => {
              return actions.order.capture().then((details) => {
                toast.success("Payment successful!");

                const donationData = {
                  txn_id: details.id,
                  payment_amt: details.purchase_units[0].amount.value,
                  currency: details.purchase_units[0].amount.currency_code,
                  payment_status: "Completed",
                  payment_mode_code: "PAYPAL",
                  auth_code: "",
                  reference_no: "REF" + Date.now(),
                  auth: 0,
                  session_id: session,
                  covered_fee: coverFee,
                };

                handleCreateDonation(donationData);
              });
            }}
            onError={(err) => {
              console.error("PayPal Error:", err);
              toast.error("Payment failed!");
            }}
            style={{
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "paypal"
            }}
            fundingSource={undefined}
          />
        </PayPalScriptProvider>

        <div className="text-center text-xs text-gray-500">
          Powered by PayPal
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;