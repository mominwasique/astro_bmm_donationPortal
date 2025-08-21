import React from 'react';
import Canvasser from './Canvasser';
import { CanvasserAuthProvider } from '../context/CanvasserAuthContext';

const CanvasserWrapper = () => {
  return (
    <CanvasserAuthProvider>
      <Canvasser />
    </CanvasserAuthProvider>
  );
};

export default CanvasserWrapper;
