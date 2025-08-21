import React, { useState, useEffect } from 'react';
import HeaderWrapper from './HeaderWrapper';
import CartWrapper from './CartWrapper';
import HomeWrapper from './HomeWrapper';
import { CartAnimation } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';

const CartStateProvider = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Set current path after component mounts to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Only render Home content on the home page
  const showHome = currentPath === '/';

  return (
    <>
      <CartWrapper isOpen={isOpen} setIsOpen={setIsOpen} />
      <HeaderWrapper setIsOpen={setIsOpen} />
      {showHome && <HomeWrapper />}
      <CartAnimation />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </>
  );
};

export default CartStateProvider;
