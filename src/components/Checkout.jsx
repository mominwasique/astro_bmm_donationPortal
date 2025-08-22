import React, { useState, useEffect } from "react";
import DonationCart from "./CheckoutPage/DonationCart";
import GiftAidAndPersonalInfo from "./CheckoutPage/GiftAidAndPersonalInfo";
import StepIndicator from "./CheckoutPage/StepIndicator";
import { fetchCountriesList } from "../api/countiesApi";
import { encryptData, generateReferenceId } from "../utils/functions";
import { cartTransaction, updateParticipant, getCart } from "../api/cartApi";
import useSessionId from "../hooks/useSessionId";
import StripePayment from "./CheckoutPage/StripePayment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import PayPalPayment from "./CheckoutPage/PayPalPayment";
import { getRequiredFields } from "../utils/data";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ShoppingBag, CreditCard, User, Loader2 } from "lucide-react";
import { addNewAddress, getDonorAddress } from "../api/donationApi";
import ErrorBoundary from "./ErrorBoundary";


const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const sessionId = useSessionId();
  // Use state-managed cart instead of a localStorage snapshot
  const [isCartLoading, setIsCartLoading] = useState(true);
  const donorId = user?.user_id || JSON.parse(localStorage.getItem('user'))?.user_id;
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [preferences, setPreferences] = useState({
    giftAid: false,
    email: false,
    phone: false,
    post: false,
    sms: false,
  });
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [reference_no, setReference_no] = useState("");
  const [paymentGateway, setPaymentGateway] = useState("stripe");
  const [donation, setDonation] = useState({
    personalInfo: {
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    }
  });
  const [participantNames, setParticipantNames] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cart, setCart] = useState([]);
  const [countries, setCountries] = useState([]);
  const [addressData, setAddressData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isCreateCartTransactionPending, setIsCreateCartTransactionPending] = useState(false);
  const [createCartTransactionError, setCreateCartTransactionError] = useState(null);
  const [isReferenceIdPending, setIsReferenceIdPending] = useState(false);
  const [referenceIdError, setReferenceIdError] = useState(null);
  const [updateParticipantLoading, setUpdateParticipantLoading] = useState(false);

  const stripeKey = import.meta.env.PUBLIC_STRIPE_PUBLISH_KEY;
  const stripePromise = loadStripe(stripeKey || "");

  useEffect(() => {
    // One line: Warn in dev if publishable key is missing or invalid
    if (!stripeKey) {
      console.warn('Stripe publishable key is missing (PUBLIC_STRIPE_PUBLISH_KEY). Elements will not render.');
      toast.error('Stripe key missing. Please configure PUBLIC_STRIPE_PUBLISH_KEY.');
    }
  }, [stripeKey]);

  // Fetch cart data on component mount
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setIsCartLoading(true);
        let data = [];

        if (isAuthenticated && user?.user_id) {
          data = await getCart({ donor_id: user.user_id, session_id: '' });
        } else if (sessionId) {
          data = await getCart({ session_id: sessionId, donor_id: '' });
        }

        // If API returns no data, try localStorage as fallback
        if (!data || data.length === 0) {
          const localStorageCart = localStorage.getItem('cart');
          if (localStorageCart) {
            try {
              const parsedCart = JSON.parse(localStorageCart);
              data = Array.isArray(parsedCart) ? parsedCart : [parsedCart];
            } catch (parseError) {
              console.error('Error parsing localStorage cart:', parseError);
            }
          }
        }

        // setCartData(data || []);
        setCart(data || []);

        // Store in localStorage for backward compatibility
        if (data && data.length >= 0) {
          // One line: Persist latest cart snapshot for cross-page use
          localStorage.setItem('cart', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error fetching cart:', error);

        // Try localStorage as fallback
        const localStorageCart = localStorage.getItem('cart');
        if (localStorageCart) {
          try {
            const parsedCart = JSON.parse(localStorageCart);
            const fallbackData = Array.isArray(parsedCart) ? parsedCart : [parsedCart];
            // setCartData(fallbackData);
            setCart(fallbackData);
          } catch (parseError) {
            console.error('Error parsing localStorage cart:', parseError);
            // setCartData([]);
            setCart([]);
          }
        } else {
          // setCartData([]);
          setCart([]);
        }

        toast.error('Failed to load cart data from server, using cached data');
      } finally {
        setIsCartLoading(false);
      }
    };

    fetchCartData();
    // Reflect local cart updates immediately without network
    const onCartLocalChanged = () => {
      try {
        const snapshot = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(Array.isArray(snapshot) ? snapshot : []);
      } catch (_) {}
    };
    window.addEventListener('cart:local-changed', onCartLocalChanged);
    return () => window.removeEventListener('cart:local-changed', onCartLocalChanged);
  }, [isAuthenticated, user?.user_id, sessionId]);

  // One line: Redirect unauthenticated users who try to access profile fields page
  useEffect(() => {
    if (typeof window !== 'undefined' && step === 2 && !isAuthenticated) {
      // Allow guests to proceed but encourage login in UI; do not hard-redirect here
    }
  }, [step, isAuthenticated]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await fetchCountriesList();
        setCountries(countriesData);
      } catch (error) {
        console.error("Error loading countries:", error);
      }
    };

    const loadAddressData = async () => {
      if (donorId) {
        try {
          const address = await getDonorAddress(donorId);
          setAddressData(address);
        } catch (error) {
          console.error("Error loading address:", error);
        }
      }
    };

    loadCountries();
    loadAddressData();
  }, [donorId]);

  //updated code

  const createCartTransactionMutation = async (donationData) => {
    setIsCreateCartTransactionPending(true);
    setCreateCartTransactionError(null);
    try {
      const data = await cartTransaction(donationData);

      // UI-first: proceed on any 2xx response
      toast.dismiss();
      // Always open Stripe payment overlay after a successful transaction
      setPaymentGateway('stripe');
      setIsPaymentGatewayOpen(true);
    } catch (error) {
      setCreateCartTransactionError(error);
      toast.error("Error creating cart transaction");
      console.error("Cart transaction error:", error);
    } finally {
      setIsCreateCartTransactionPending(false);
    }
  };

  // Generate reference ID mutation
  const getReferenceIdMutation = async () => {
    setIsReferenceIdPending(true);
    setReferenceIdError(null);
    try {
      const referenceId = await generateReferenceId();
      setReference_no(referenceId);

      const updatedDonation = { ...donation, referenceId, ...preferences, session: sessionId, user, isAuthenticated };
      const cartSnapshot = JSON.parse(localStorage.getItem("cart"));
      localStorage.setItem("userData", JSON.stringify({ ...donation, cart: cartSnapshot }));

      // If authenticated and we have a stored address id, pass it for donor_address_id usage
      if (isAuthenticated && addressData?.data?.address_id) {
        updatedDonation.personalInfo = {
          ...updatedDonation.personalInfo,
          address_id: addressData.data.address_id,
        };
      }

      // Validation logic
      const rawPhone = updatedDonation.personalInfo?.phone?.trim() || "";
      const cleanedPhone = rawPhone.replace(/[^\d]/g, "");

      if (!rawPhone) {
        toast.error("Phone number is required.");
        return;
      }

      if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
        toast.error("Phone number must be between 10 to 15 digits.");
        return;
      }

      if (donation.personalInfo.bank_ac_no) {
        if (donation.personalInfo.bank_ac_no.length < 8) {
          toast.error("Bank account number must be at least 8 digits.");
          return;
        }
      }

      const requiredFieldsDynamic = getRequiredFields(cart);
      let missingFields = requiredFieldsDynamic.filter(
        (field) => !updatedDonation.personalInfo?.[field]
      );

      // Special-case: accept either city_id or city (when address finder fills city text)
      if (missingFields.includes('city_id') && updatedDonation.personalInfo?.city) {
        missingFields = missingFields.filter(f => f !== 'city_id');
      }

      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(", ")}`);
        return;
      }

      setIsSubmitted(true);
      toast.loading("Processing...");
      await createCartTransactionMutation(updatedDonation);
    } catch (error) {
      setReferenceIdError(error);
      toast.error("Error generating reference ID");
      console.error("Reference ID error:", error);
    } finally {
      setIsReferenceIdPending(false);
    }
  };

  // Update participant mutation
  const updateParticipantMutation = async (data) => {
    setUpdateParticipantLoading(true);
    try {
      await updateParticipant(data);
      toast.dismiss();
      toast.success("Participant names updated successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error(`Error updating participant names: ${error.message}`);
      console.error("Update participant error:", error);
    } finally {
      setUpdateParticipantLoading(false);
    }
  };

  // const handleNext = async () => {
  //   if (step === 2) {
  //     // Validate required fields before proceeding to payment
  //     const missingFields = requiredFields.filter(field => !donation.personalInfo[field]);
  //     if (missingFields.length > 0) {
  //       toast.error('Please fill in all required fields');
  //       return;
  //     }

  //     setIsLoading(true);
  //     try {
  //       // Generate reference number if not exists
  //       if (!reference_no) {
  //         const newReferenceNo = generateReferenceId();
  //         setReference_no(newReferenceNo);
  //       }

  //       // Create transaction first
  //       const transactionData = {
  //         cart_id: cartData[0]?.cart_id,
  //         donor_id: donorId,
  //         personal_info: donation.personalInfo,
  //         preferences: preferences,
  //         participant_names: participantNames,
  //         reference_no: reference_no,
  //       };

  //       const response = await cartTransaction(transactionData);

  //       if (response.message === "Cart transaction has been created successfully") {
  //         setIsPaymentGatewayOpen(true);
  //         // Proceed to next step which will trigger Stripe
  //         setStep(3);
  //       } else {
  //         toast.error(response.message || 'Transaction failed');
  //       }
  //     } catch (error) {
  //       console.error('Payment error:', error);
  //       toast.error('Error processing payment');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   } else if (step < 3) {
  //     // Normal step progression for steps before payment
  //     setIsAnimating(true);
  //     setTimeout(() => {
  //       setStep(step + 1);
  //       setIsAnimating(false);
  //     }, 300);
  //   }
  // };

  const handleNext = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Please add items before proceeding.");
      return;
    }

    if (step == 1) {
      // Check if any participant name is empty for items requiring participants
      const emptyNames = cart.some(item => {
        if (item.participant_required === "Y") {
          const names = participantNames[item.cart_id] || [];
          return names.length === 0 || names.some(name => !name.trim());
        }
        return false;
      });

      if (emptyNames) {
        toast.error("Please fill in all participant names for required items before proceeding.");
        return;
      }

      // Only process items that require participants
      cart.forEach(item => {
        if (item.participant_required === "Y" && participantNames[item.cart_id]) {
          const data = {
            cart_id: item.cart_id,
            participant_name: participantNames[item.cart_id].join()
          };
          updateParticipantMutation(data);
        }
      });

      // Animate transition
      setIsAnimating(true);
      setTimeout(() => {
        // If user is not authenticated, send to login; else go to Gift Aid & Personal Info
        // if (!isAuthenticated) {
        //   window.location.href = '/login';
        //   return;
        // }
        setStep(step + 1);
        window.scrollTo(0, 0);
        setIsAnimating(false);
      }, 300);
    }
    else {
      setTimeout(() => {
        setStep(step + 1);
        window.scrollTo(0, 0);
        setIsAnimating(false);
      }, 300);
    }
  };

  // const handlePrevious = () => {
  //   if (step > 1) {
  //     setIsAnimating(true);
  //     setTimeout(() => {
  //       setStep(step - 1);
  //       setIsAnimating(false);
  //     }, 300);
  //   }
  // };

  const handlePrevious = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(step - 1);
      window.scrollTo(0, 0);
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!addressData?.data && isAuthenticated) {
      try {
        const response = await addNewAddress({
          address1: donation.personalInfo.address1,
          address2: donation.personalInfo.address2,
          city_id: donation.personalInfo.city_id,
          post_code: donation.personalInfo.postcode,
          donor_id: donorId,
          country: donation.personalInfo.country,
        });

        if (response.success) {
          toast.success('Address added successfully');
          await getReferenceIdMutation();
        } else {
          toast.error(response.message || 'Failed to add address');
        }
      } catch (error) {
        toast.error(error.message || 'Failed to add address');
      }
    } else {
      await getReferenceIdMutation();
    }
  };

  // const handleSubmit = async () => {
  //   setIsLoading(true);
  //   try {
  //     const transactionData = {
  //       cart_id: cartData[0]?.cart_id,
  //       donor_id: donorId,
  //       personal_info: donation.personalInfo,
  //       preferences: preferences,
  //       participant_names: participantNames,
  //       reference_no: reference_no,
  //     };

  //     const response = await cartTransaction(transactionData);

  //     if (response.message === "Cart transaction has been created successfully") {
  //       toast.dismiss();

  //       if (cartData.some(item => item.donation_period === 'direct-debit') && cartData.some(item => item.donation_period === 'one-off')) {
  //         setIsPaymentGatewayOpen(true);
  //       } else if (cartData.some(item => item.donation_period === 'one-off')) {
  //         setIsPaymentGatewayOpen(true);
  //       } else {
  //         const userData = localStorage.getItem("userData");
  //         const encryptedData = encryptData(userData);
  //         window.location.href = `/payment-success?data=${encodeURIComponent(encryptedData)}`;
  //       }
  //     } else {
  //       toast.error(response.message);
  //       // console.log(response.message);

  //     }
  //   } catch (error) {
  //     toast.error("Error processing transaction");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };



  // const getCurrentStep = () => {
  //   switch (step) {
  //     case 1:
  //       return "cart";
  //     case 2:
  //       return "personal-info";
  //     // case 3:
  //     //   return "payment";
  //     default:
  //       return "cart";
  //   }
  // };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Review Cart";
      case 2:
        return "Personal Information";
      // case 3:
      //   return "Payment";
      default:
        return "Review Cart";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1:
        return <ShoppingBag className="w-6 h-6" />;
      case 2:
        return <User className="w-6 h-6" />;
      // case 3:
      //   return <CreditCard className="w-6 h-6" />;
      default:
        return <ShoppingBag className="w-6 h-6" />;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <DonationCart
            cartData={cart}
            setCart={setCart}
            participantNames={participantNames}
            setParticipantNames={setParticipantNames}
            // onNext={handleNext}
            countries={countries}
            isLoading={isCartLoading}
          />
        );
      case 2:
        return (
          <GiftAidAndPersonalInfo
            donation={donation}
            setDonation={setDonation}
            preferences={preferences}
            setPreferences={setPreferences}
            participantNames={participantNames}
            setParticipantNames={setParticipantNames}
            // onNext={handleNext}
            onPrevious={handlePrevious}
            addressData={addressData}
            countries={countries}
          />
        );
      // case 3:
      //   return (
      //     <Elements stripe={stripePromise}>
      //       <StripePayment
      //         cartData={cartData}
      //         donation={donation}
      //         setIsPaymentGatewayOpen={setIsPaymentGatewayOpen}
      //         isPaymentGatewayOpen={isPaymentGatewayOpen}
      //         personalInfo={donation.personalInfo}
      //         preferences={preferences}
      //         participantNames={participantNames}
      //         reference_no={reference_no}
      //       />
      //     </Elements>
      //   );
      default:
        return null;
    }
  };

  return (
    // <div className="container mx-auto px-4 py-8 max-w-3xl">
    //   <div className="mb-8">

    //     <h1 className="text-2xl font-bold font-antonio flex items-center gap-2 mb-2 text-orange tracking-wide">
    //       {getStepIcon()}
    //       {getStepTitle()}</h1>
    //     <p className="text-gray-500">Step {step} of 2</p>


    //     <StepIndicator currentStep={step} />

    //     <AnimatePresence mode="wait">
    //       <motion.div
    //         key={step}
    //         initial={{ opacity: 0, x: 20 }}
    //         animate={{ opacity: 1, x: 0 }}
    //         exit={{ opacity: 0, x: -20 }}
    //         transition={{ duration: 0.3 }}
    //         className="mt-6"
    //       >
    //         {renderStep()}
    //       </motion.div>
    //     </AnimatePresence>
    //     {paymentGateway === "stripe" && isPaymentGatewayOpen && (
    //       <Elements stripe={stripePromise}>
    //         <StripePayment donation={donation} setIsPaymentGatewayOpen={setIsPaymentGatewayOpen} isPaymentGatewayOpen={isPaymentGatewayOpen} reference_no={reference_no} />
    //       </Elements>
    //     )}

    //     {paymentGateway === "paypal" && isPaymentGatewayOpen && !cartData.some(item => item.donation_period === 'direct-debit') && (
    //       <PayPalPayment donation={donation} reference_no={reference_no} onSuccess={(details) => {
    //         toast.dismiss()
    //         setIsPaymentGatewayOpen(false);
    //       }} />
    //     )}

    //   </div>
    // </div>
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-antonio flex items-center gap-2 mb-2 text-orange tracking-wide">

          {getStepIcon()}
          {getStepTitle()}
        </h1>
        <p className="text-gray-500">Step {step} of 2</p>
      </div>

      <StepIndicator step={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {paymentGateway === "stripe" && isPaymentGatewayOpen && (
        <Elements stripe={stripePromise}>
          <StripePayment
            personalInfo={donation.personalInfo}
            setIsPaymentGatewayOpen={setIsPaymentGatewayOpen}
            isPaymentGatewayOpen={isPaymentGatewayOpen}
            reference_no={reference_no}
          />
        </Elements>
      )}

      {paymentGateway === "paypal" && isPaymentGatewayOpen && !cart.some(item => item.donation_period === 'direct-debit') && (
        <PayPalPayment donation={donation} reference_no={reference_no} onSuccess={(details) => {
          toast.dismiss()
          setIsPaymentGatewayOpen(false);
        }} />
      )}

      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={step === 1 || isAnimating}
          className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${step === 1 || isAnimating
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {/* {cart.length === 0 && ( */}
        <a href="https://blackburnuktrust.org/appeals" className="w-full sm:w-auto">
          <button
            className={`w-full px-6 py-3 rounded-lg bg-primary text-white hover:bg-tealHover flex items-center justify-center gap-2 transition-all`}
          >
            <ShoppingBag className="w-4 h-4" />
            Add Programs
          </button>
        </a>
        <button
          onClick={step === 2 ? handleSubmit : handleNext}
          disabled={
            cart.length === 0 ||
            isSubmitted ||
            isAnimating ||
            isReferenceIdPending ||
            isCreateCartTransactionPending ||
            isLoading
          }
          className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${cart.length === 0 || isSubmitted || isAnimating
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-primary text-white hover:bg-tealHover"
            }`}
        >
          {isReferenceIdPending || isCreateCartTransactionPending || isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin m-auto" />
          ) : (
            step === 2 ? "Submit" : "Next"
          )}
          {step !== 2 && <ArrowRight className="w-4 h-4" />}
        </button>
        {/* )} */}

        {/* <button
          onClick={step === 2 ? handleSubmit : handleNext}
          disabled={cart.length === 0 || isSubmitted || isAnimating || isReferenceIdPending || isReferenceIdLoading || isCreateCartTransactionPending || isCreateCartTransactionLoading}
          className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${cart.length === 0 || isSubmitted || isAnimating
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-teal text-white hover:bg-tealHover"
            }`}
        >
          {isReferenceIdPending || isReferenceIdLoading || isCreateCartTransactionPending || isCreateCartTransactionLoading ? <Loader2 className="w-4 h-4 animate-spin m-auto" /> : step === 2 ? "Submit" : "Next"}
          {step !== 2 && <ArrowRight className="w-4 h-4" />}
        </button> */}
      </div>
    </div>
  );
};

export default Checkout;
