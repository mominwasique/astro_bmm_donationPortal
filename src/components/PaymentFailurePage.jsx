import React from "react";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const PaymentFailurePage = () => {
  const handleRetryPayment = () => {
    window.location.href = "/checkout";
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <XCircle className="mx-auto h-16 w-16 text-red-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're sorry, but your payment could not be processed. Please try again or contact support if the problem persists.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">What you can do:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Check your payment method details</li>
              <li>• Ensure you have sufficient funds</li>
              <li>• Try using a different payment method</li>
              <li>• Contact your bank if the issue persists</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <button
            onClick={handleRetryPayment}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={handleBackToHome}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
