import { useState, useEffect } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import toast from "react-hot-toast";
import { createSingleDonation } from "../../api/donationApi";
import useSessionId from "../../hooks/useSessionId";
import { encryptData } from "../../utils/functions";
import { useAuth } from "../../context/AuthContext";

const PayPalPayment = ({ reference_no, onSuccess }) => {
  const session = useSessionId();
  const [coverFee, setCoverFee] = useState(false);
  const [totalAmount, setTotalAmount] = useState("0.00");

  const { user, isAuthenticated } = useAuth();

  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const amount = cartItems
    .reduce(
      (total, item) =>
        total + parseFloat(item.donation_amount) * item.quantity,
      0
    )
    .toFixed(2);


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

  // Update total amount whenever coverFee changes
  useEffect(() => {
    setTotalAmount(calculateTotalAmount(coverFee));
  }, [coverFee]);

  const createDonation = async (donationData) => {
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
      onSuccess();
    } catch (error) {
      console.error("Error creating donation:", error);
      toast.dismiss();
      toast.error(error.message);
    } finally {
      toast.dismiss();
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id": import.meta.env.PUBLIC_PAYPAL_CLIENT_ID,
        currency: "GBP",
      }}
    >
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
        {/* Highlighted Amount Display */}
        <div className="mb-4 text-center">
          <p className="text-gray-600 font-medium">Total Donation Amount</p>
          <div className="text-3xl font-bold text-indigo-700 mt-1">
            £{totalAmount}
          </div>
        </div>

        {/* Cover Fee Checkbox - Now below the amount */}
        {/* <div className="mb-5 mt-3 flex items-center justify-center">
          <label className="flex items-center cursor-pointer text-gray-700 hover:text-indigo-600 transition-colors">
            <input
              type="checkbox"
              checked={coverFee}
              onChange={(e) => setCoverFee(e.target.checked)}
              className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <span className="ml-2">I want to cover the transaction fee</span>
          </label>
        </div> */}

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* PayPal Buttons */}
        <div className="mt-4">
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
                toast.success("Payment successful!", details);

                const donationData = {
                  txn_id: details.id,
                  payment_amt: details.purchase_units[0].amount.value,
                  currency: details.purchase_units[0].amount.currency_code,
                  payment_status: "Completed",
                  payment_mode_code: "PAYPAL",
                  auth_code: "",
                  reference_no,
                };

                if (isAuthenticated) {
                  donationData.donor_id = user.user_id;
                  donationData.auth = 1;
                } else {
                  donationData.session_id = session;
                  donationData.auth = 0;
                }

                createDonation(donationData);
              });
            }}
            onError={(err) => {
              console.error("PayPal Error:", err);
              toast.error("Payment failed!");
            }}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalPayment;