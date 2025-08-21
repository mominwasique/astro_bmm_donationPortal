import React from 'react';
import Fundraiser from './Fundraiser';
import { CanvasserAuthProvider } from '../context/CanvasserAuthContext';

const FundraiserWrapper = () => {
  return (
    <CanvasserAuthProvider>
      <Fundraiser />
    </CanvasserAuthProvider>
  );
};

export default FundraiserWrapper;
