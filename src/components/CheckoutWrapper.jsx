import React from 'react';
import Checkout from './Checkout';
import { AuthProvider } from '../context/AuthContext';

const CheckoutWrapper = () => {
  return (
    <AuthProvider>
      <Checkout />
    </AuthProvider>
  );
};

export default CheckoutWrapper;
