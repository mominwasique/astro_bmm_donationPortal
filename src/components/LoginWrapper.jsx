import React from 'react';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';

const LoginWrapper = () => {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
};

export default LoginWrapper;
