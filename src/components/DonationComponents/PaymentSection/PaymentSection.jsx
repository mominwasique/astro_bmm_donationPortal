import React from 'react';
import PaymentForm from './PaymentForm';

const PaymentSection = ({ amount, setAmount, onBack, onPaymentComplete }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-grey">Payment Details</h2>
      <PaymentForm
        amount={amount}
        setAmount={setAmount}
        onPaymentComplete={onPaymentComplete}
      />
    </div>
  );
};

export default PaymentSection;