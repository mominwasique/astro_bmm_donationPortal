import {
  CardElement,
  useElements,
  useStripe,
  PaymentRequestButtonElement,
} from '@stripe/react-stripe-js';
import { ChevronLeft, Lock, Droplets, CreditCard, Smartphone } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { createPaymentIntent, createSingleDonation } from '../../api/donationApi';
import toast from 'react-hot-toast';
import useSessionId from '../../hooks/useSessionId';
import { encryptData } from '../../utils/functions';
import { useAuth } from '../../context/AuthContext';

// ISO 3166-1 alpha-2 country codes
const countryCodes = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'RU', name: 'Russia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'MX', name: 'Mexico' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NL', name: 'Netherlands' },
];

const PaymentForm = ({
  onRequestClose,
  onPaymentSuccess,
  setCurrentStep,
  setIsSuccess,
  setIsPaymentGatewayOpen,
  isPaymentGatewayOpen,
  reference_no,
  personalInfo,
}) => {
  // Add null check
  if (!personalInfo) {
    return <div>Loading...</div>;
  }

  const userData = JSON.parse(localStorage.getItem('userData'));

  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState(userData?.personalInfo?.email);
  const [name, setName] = useState(
    `${userData?.personalInfo?.firstName} ${userData?.personalInfo?.lastName}`
  );
  const [address, setAddress] = useState({
    line1: userData?.personalInfo?.address1,
    line2: userData?.personalInfo?.address2,
    city: userData?.personalInfo?.city,
    postalCode: userData?.personalInfo?.postcode,
    country: 'GB', // Default country code for United Kingdom
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverTransactionFee, setCoverTransactionFee] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [stripeFee, setStripeFee] = useState(0);
  const showCoverFee = import.meta.env.PUBLIC_ENABLE_COVER_FEE === 'true';

  // New state for payment request (Google Pay/Apple Pay)
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [showCardForm, setShowCardForm] = useState(false);
  const [paymentRequestLoading, setPaymentRequestLoading] = useState(false);

  const session = useSessionId();

  const { user, isAuthenticated } = useAuth();

  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const amount = cartItems
    .reduce((total, item) => total + parseFloat(item.donation_amount) * item.quantity, 0)
    .toFixed(2);

  // UK Charity Stripe fee calculation (1.4% + 20p for UK/European cards)
  const calculateStripeFee = donationAmount => {
    // 1.4% + 20p for UK/European cards for registered charities
    const feePercentage = 0.014;
    const fixedFee = 0.2;
    const additionalFeee = 0.2;
    return (donationAmount * feePercentage) + fixedFee + additionalFeee;
  };

  // Update stripe fee and total amount when amount or coverTransactionFee changes
  useEffect(() => {
    const calculatedFee = calculateStripeFee(parseFloat(amount));
    setStripeFee(calculatedFee);
    setTotalAmount(coverTransactionFee ? parseFloat(amount) + calculatedFee : parseFloat(amount));
  }, [amount, coverTransactionFee]);

  // Setup payment request for Google Pay/Apple Pay
  useEffect(() => {
    if (!stripe || !totalAmount) return;

    const pr = stripe.paymentRequest({
      country: 'GB',
      currency: 'gbp',
      total: {
        label: 'Donation',
        amount: Math.round(totalAmount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: false,
      // Google Pay configuration
      googlePay: {
        merchantId: import.meta.env.ASTRO_GOOGLE_PAY_MERCHANT_ID || 'your-merchant-id',
        merchantOrigin: window.location.origin,
      },
      // Apple Pay configuration
      applePay: {
        merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
        supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
      },
    });

    pr.canMakePayment().then(result => {
      setPaymentMethods(result || {});
      setPaymentRequest(pr);

      if (result) {
        console.log('Payment methods available:', result);
        setShowCardForm(true);

        // If Google Pay or Apple Pay is available, show them first
        // if (result.googlePay || result.applePay) {
        //   setShowCardForm(false);
        // } else {
        //   setShowCardForm(true);
        // }
      } else {
        setShowCardForm(true);
      }
    });

    // Handle payment request completion
    pr.on('paymentmethod', async (event) => {
      setPaymentRequestLoading(true);
      setError(null);

      try {
        // Create payment intent
        const response = await createPaymentIntent({
          amount: Math.round(totalAmount * 100),
          reference_no,
          name,
          billing_address: formatAddress(address),
        });

        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          response.clientSecret,
          {
            payment_method: event.paymentMethod.id,
            receipt_email: email,
          }
        );

        if (confirmError) {
          console.error('Payment request error:', confirmError);
          setError(confirmError.message);
          setPaymentRequestLoading(false);
          return;
        }

        // Check if payment intent exists and has the right status
        if (!paymentIntent) {
          console.error('No payment intent returned');
          setError('Payment processing failed. Please try again.');
          setPaymentRequestLoading(false);
          return;
        }

        // Process successful payment only if status is succeeded
        if (paymentIntent.status === 'succeeded') {
          await processSuccessfulPayment(paymentIntent, name, email);
        } else if (paymentIntent.status === 'requires_action') {
          // Handle 3D Secure or other authentication
          setError('Additional authentication required. Please complete the verification.');
          setPaymentRequestLoading(false);
        } else if (paymentIntent.status === 'processing') {
          // Payment is still processing
          setError(
            'Payment is being processed. Please wait a moment and check your email for confirmation.'
          );
          setPaymentRequestLoading(false);
        } else {
          console.error('Payment status:', paymentIntent.status);
          setError('Payment processing is incomplete. Please try again.');
          setPaymentRequestLoading(false);
        }
      } catch (error) {
        console.error('Payment request processing error:', error);
        setError(error.message || 'Payment processing failed');
        setPaymentRequestLoading(false);
      }
    });

    pr.on('cancel', () => {
      setPaymentRequestLoading(false);
      setShowCardForm(true);
    });
  }, [stripe, totalAmount, reference_no, name, email]);

  // Helper function to format address
  const formatAddress = (addressObj) => {
    const selectedCountry = countryCodes.find(c => c.code === addressObj.country);
    const countryName = selectedCountry ? selectedCountry.name : addressObj.country;

    return [
      addressObj.line1,
      addressObj.line2,
      addressObj.city,
      addressObj.postalCode,
      countryName]
      .filter(Boolean)
      .join(', ');
  };

  // Process successful payment (shared between payment methods)
  const processSuccessfulPayment = async (paymentIntent, donorName, donorEmail) => {
    // Check if payment is actually completed
    if (paymentIntent.status !== 'succeeded') {
      console.error('Payment not completed. Status:', paymentIntent.status);
      setError('Payment was not completed successfully. Please try again.');
      setLoading(false);
      setPaymentRequestLoading(false);
      return;
    }

    const donationData = {
      txn_id: paymentIntent.id,
      payment_amt: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      payment_status: 'Completed',
      payment_mode_code: 'STRIPE',
      auth_code: '',
      reference_no: reference_no,
      auth: isAuthenticated ? true : false,
      donor_name: donorName,
      donor_address: formatAddress(address),
      donor_email: donorEmail,
    };

    if (isAuthenticated) {
      donationData.donor_id = user.user_id;
    } else {
      donationData.session_id = session;
    }

    await createDonation(donationData);
  };

  const createDonation = async (donationData) => {
    try {
      toast.loading('Processing your donation...');
      await createSingleDonation(donationData);
      toast.dismiss();
      toast.success('Thank you for your donation!');

      // Clear all loading states
      setLoading(false);
      setPaymentRequestLoading(false);

      // Clear cart only after successful donation creation
      localStorage.removeItem('cart');

      // Use the success callbacks only after donation is successfully created
      if (setIsSuccess) setIsSuccess(true);
      if (onPaymentSuccess) onPaymentSuccess();

      const userData = localStorage.getItem('userData');
      if (userData) {
        const encryptedData = encryptData(userData);
        window.location.href = `/payment-success?data=${encodeURIComponent(encryptedData)}`;
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      toast.dismiss();
      // console.log(error);

      toast.error(error.message || 'Failed to process donation');
      // console.log(error.message);

      // Clear loading states on error
      setLoading(false);
      setPaymentRequestLoading(false);
    }
  };

  const handlePaymentIntent = async (paymentMethod, name) => {
    try {
      toast.loading('Processing payment...');
      // One line: Create intent with required amount and metadata
      const data = await createPaymentIntent({ amount: Math.round(totalAmount * 100), reference_no, name, billing_address: formatAddress(address) });
      toast.dismiss();

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: paymentMethod.id,
          receipt_email: email,
        }
      );



      if (confirmError) {
        console.error('Error confirming payment:', confirmError);
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      // Check if payment intent exists and has the right status
      if (!paymentIntent) {
        console.error('No payment intent returned');
        setError('Payment processing failed. Please try again.');
        setLoading(false);
        return;
      }

      // Process successful payment only if status is succeeded
      if (paymentIntent.status === 'succeeded') {
        await processSuccessfulPayment(paymentIntent, name, email);
      } else if (paymentIntent.status === 'requires_action') {
        // Handle 3D Secure or other authentication
        setError('Additional authentication required. Please complete the verification.');
        setLoading(false);
      } else if (paymentIntent.status === 'processing') {
        // Payment is still processing
        setError(
          'Payment is being processed. Please wait a moment and check your email for confirmation.'
        );
        setLoading(false);
      } else {
        console.error('Payment status:', paymentIntent.status);
        setError('Payment processing is incomplete. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.dismiss();
      toast.error(error.message || 'Payment processing failed');
      setLoading(false);
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name,
        email,
        address: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          postal_code: address.postalCode,
          country: address.country,
        },
      },
    });

    if (stripeError) {
      console.error('Error creating payment method:', stripeError);
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    await handlePaymentIntent(paymentMethod, name);
  };

  const handleClose = () => {
    window.location.href = '/payment-failure';
  };

  // Get payment method display info
  const getPaymentMethodInfo = () => {
    if (paymentMethods.googlePay) {
      return { name: 'Google Pay', icon: '🟢', available: true };
    } else if (paymentMethods.applePay) {
      return { name: 'Apple Pay', icon: '🍎', available: true };
    }
    return { name: 'Card Payment', icon: '💳', available: false };
  };

  // console.log(paymentMethods," paymentMethods");

  const paymentMethodInfo = getPaymentMethodInfo();

  return (
    <div
      className={`fixed inset-0 z-50 ${isPaymentGatewayOpen ? 'flex' : 'hidden'} bg-white overflow-y-auto`}
    >
      {/* Header with back button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={handleClose}
          aria-label="Go back"
        >
          <ChevronLeft className="text-gray-600" size={20} />
        </button>
      </div>

      <div className="w-full min-h-full flex flex-col lg:grid lg:grid-cols-3 gap-8 p-8 pt-16">
        {/* Left Section - Secure Payment Information */}
        <div className="lg:col-span-1 space-y-6 order-1 lg:order-1 mb-8 lg:mb-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-secondary-700">
              Complete your payment using the secure form
            </h1>
            <Lock className="text-secondary-500" size={20} />
          </div>
          {/* {JSON.stringify(paymentMethods)} */}

          <p className="text-gray-600 text-sm leading-relaxed">
            When donating online you'll be connected to a secure server, which is indicated by the
            padlock in the address bar. For more info, visit{' '}
            <a href="/privacy-policy" className="underline text-green-700 hover:text-primary-700">
              Privacy policy
            </a>
            .
          </p>

          <blockquote className="text-primary text-lg italic font-medium">
            "Give charity without delay, for it stands in the way of calamity." (Tirmidhi)
          </blockquote>

          {/* Payment Methods Status */}
        </div>

        {/* Middle Section - Payment Form */}
        <div className="lg:col-span-1 space-y-6 order-3 lg:order-2 mb-8 lg:mb-0">
          <h2 className="text-xl font-bold text-secondary-700">Choose your payment method</h2>

          {/* Google Pay / Apple Pay Button */}
          {paymentRequest &&
            (paymentMethods.googlePay || paymentMethods.applePay) &&
            !showCardForm && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="text-green-600" size={20} />
                    <h3 className="font-semibold text-green-800">Quick Payment</h3>
                  </div>
                  <p className="text-sm text-green-700 mb-4">
                    Use {paymentMethodInfo.name} for a faster, more secure payment experience.
                  </p>
                  <PaymentRequestButtonElement options={{ paymentRequest }} className="w-full" />
                  {paymentRequestLoading && (
                    <div className="mt-2 text-center text-sm text-gray-600">
                      Processing payment...
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setShowCardForm(true)}
                    className="text-sm text-gray-600 hover:text-gray-800 underline mb-16 md:mb-0"
                  >
                    Or pay with card instead
                  </button>
                </div>
              </div>
            )}

          {/* Card Payment Form */}
          {showCardForm && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="text-blue-600" size={20} />
                  <h3 className="font-semibold text-blue-800">Card Payment</h3>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Enter your card details for a secure payment.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name on Card
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Cardholder Name"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="card-element"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Card Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg width="20" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                        <circle cx="7" cy="12" r="2" />
                        <circle cx="15" cy="12" r="2" />
                      </svg>
                    </div>
                    <div className="pl-10 pr-3 py-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-secondary-500 focus-within:border-secondary-500">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#374151',
                              '::placeholder': {
                                color: '#9CA3AF',
                              },
                            },
                            invalid: {
                              color: '#EF4444',
                            },
                          },
                          placeholder: '0000 0000 0000 0000',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-600">
                    Is the 3-digit number printed on the back of your card. American Express: the
                    4-digit number on the front.
                  </p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !stripe}
                  className="w-full bg-primary text-white py-4 px-6 rounded-md hover:bg-secondary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : 'Process Payment'}
                  <Droplets className="text-white" size={20} />
                </button>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <span className="text-xs text-gray-500">stripe</span>
                  <span className="text-xs text-gray-500">VISA</span>
                  <span className="text-xs text-gray-500">Mastercard</span>
                  <span className="text-xs text-gray-500">American Express</span>
                </div>
              </form>

              {/* Show option to go back to digital wallets if available */}
              {(paymentMethods.googlePay || paymentMethods.applePay) && (
                <div className="text-center">
                  <button
                    onClick={() => setShowCardForm(false)}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Or use {paymentMethodInfo.name} instead
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Donation Summary */}
        <div className="lg:col-span-1 order-2 lg:order-3 mb-8 lg:mb-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Donation Summary</h2>

            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.program_name}</h3>
                    {/* <p className="text-sm text-gray-500">Zakat, Single Payment</p> */}
                  </div>
                  <p className="font-semibold text-primary">
                    £{(item.quantity * item.donation_amount).toFixed(2)}
                  </p>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Donation total</span>
                  <span className="font-bold text-primary text-lg">£{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
