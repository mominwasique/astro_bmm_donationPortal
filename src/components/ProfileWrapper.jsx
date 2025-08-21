import React, { useEffect } from 'react';
import Profile from './Profile';
import { AuthProvider, useAuth } from '../context/AuthContext';

const GuardedProfile = () => {
  const { isAuthenticated } = useAuth();

  // One line: Redirect unauthenticated users to login
  useEffect(() => { if (typeof window !== 'undefined' && !isAuthenticated) window.location.href = '/login'; }, [isAuthenticated]);

  return <Profile />;
};

const ProfileWrapper = () => {
  return (
    <AuthProvider>
      <GuardedProfile />
    </AuthProvider>
  );
};

export default ProfileWrapper;
