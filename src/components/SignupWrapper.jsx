import React from 'react';
import Signup from './Signup';
import { AuthProvider } from '../context/AuthContext';

const SignupWrapper = () => {
  return (
    <AuthProvider>
      <Signup />
    </AuthProvider>
  );
};

export default SignupWrapper;
