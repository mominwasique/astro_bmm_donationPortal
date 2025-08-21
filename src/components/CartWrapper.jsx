import React, { useState } from 'react';
import Cart from './Cart';

const CartWrapper = ({ isOpen, setIsOpen }) => {
  const [render, setRender] = useState(false);

  return (
    <Cart
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      render={render}
      setRender={setRender}
    />
  );
};

export default CartWrapper;
