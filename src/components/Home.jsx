import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createCart } from "../api/cartApi";
import AmountSelection from "./DonationComponents/AmountSelection/AmountSelection";
import CategorySelection from "./DonationComponents/CategorySelection/CategorySelection";
import CountrySelection from "./DonationComponents/CountrySelection/CountrySelection";
import ProgramSelection from "./DonationComponents/ProgramSelection/ProgramSelection";
import { useCart } from "../context/CartContext";
import useLocalStorage from "../hooks/useLocalStorage";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import DonationPeriodSelection from "./DonationPeriodSelection";
import { useAuth } from "../context/AuthContext";
import { trackEvent } from "../utils/gaTracking";

const Home = () => {
  const [step, setStep] = useLocalStorage("donationStep", 1);
  const [selectedPeriod, setSelectedPeriod] = useLocalStorage("selectedPeriod", null);
  const [selectedCategory, setSelectedCategory] = useLocalStorage("selectedCategory", "");
  const [selectedProgram, setSelectedProgram] = useLocalStorage("selectedProgram", "");
  const [selectedCountry, setSelectedCountry] = useLocalStorage("selectedCountry", "");
  const [amount, setAmount] = useLocalStorage("donationAmount", "");
  const [programRateId, setProgramRateId] = useLocalStorage("programRateId", 0);
  const [isClient, setIsClient] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset to step 1 and clear selectedPeriod on initial load
    setStep(1);
    setSelectedPeriod(null);
    setIsClient(true);
  }, []);

  // Coerce step to a number to avoid switch mismatches
  const numericStep = Number(step) || 1;

  // Debug: Log step changes
  useEffect(() => {
    console.log('Step changed to:', numericStep);
  }, [numericStep]);

  useEffect(() => {
    // Self-heal legacy string values from earlier sessions
    if (isClient && typeof step === 'string') {
      const coerced = Number(step);
      if (!Number.isNaN(coerced)) setStep(coerced);
    }
  }, [isClient, step, setStep]);

  useEffect(() => {
    // Only process URL parameters on client side
    if (isClient) {
      // TEMPORARILY DISABLED - URL parameter processing to prevent 404 errors
      console.log('URL parameter processing disabled to prevent API errors');

      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const category = Number(urlParams.get("category_id"));
      const program = Number(urlParams.get("program_id"));
      let country = urlParams.get("country_id");
      const amount = urlParams.get("amount");
      const type = urlParams.get("type");

      if (category) setSelectedCategory(category);
      if (program) setSelectedProgram(program);
      if (country) setSelectedCountry(country);
      if (amount) handleAmountSelect(amount);
      if (type) setSelectedPeriod(type);

      // If all parameters exist, skip to the amount selection step
      if (category && program) {
        setStep(5);
      }
      // If only category is defined, go to step 2
      else if (category && !program && !amount && !type) {
        setStep(2);
      }

    }
  }, [isClient]);

  const resetDonation = () => {
    setStep(1);
    setSelectedCategory("");
    setSelectedProgram("");
    setAmount("");
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem("donationStep");
      localStorage.removeItem("selectedPeriod");
      localStorage.removeItem("selectedCategory");
      localStorage.removeItem("selectedProgram");
      localStorage.removeItem("selectedCountry");
      localStorage.removeItem("donationAmount");
      localStorage.removeItem("programRateId");
    }
  };

  const handlePeriodSelect = (period) => {
    console.log('Period selected:', period); // Debug log
    setSelectedPeriod(period);
    // Add a small delay before changing the step
    setTimeout(() => {
      setStep(2);
    }, 100);
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setStep(3);
    console.log(category);

  };

  const handleProgramSelect = (program, rateId) => {
    setSelectedProgram(program);
    setProgramRateId(rateId);
    setStep(4);
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setStep(5);
  };

  const handleAmountSelect = async (amount, anyAmount) => {
    setAmount(amount);
    setStep(5);
    // After selecting amount, create cart and redirect with latest values
    await handleCreateCart({
      amount,
      anyAmount,
      selectedCategory,
      selectedProgram,
      selectedCountry,
      selectedPeriod,
      programRateId
    });
  };

  const handleBack = () => {
    if (step === 5) {
      if (selectedCountry === "") {
        // If no country was selected, go back to program selection (step 3)
        setStep(3);
      } else {
        // If country was selected, go back to country selection (step 4)
        setStep(4);
      }
    } else {
      setStep(step - 1);
    }
  };

  const handleCreateCart = async ({ amount, anyAmount, selectedCategory, selectedProgram, selectedCountry, selectedPeriod, programRateId }) => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let sessionId = null;
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        sessionId = localStorage.getItem('sessionId');
      }
      const cartData = {

        donation_period: selectedPeriod,
        currency: "GBP",
        currency_id: 1,
        category_id: selectedCategory || Number(searchParams.get("category_id")),
        program_id: selectedProgram || Number(searchParams.get("program_id")),
        country_id: selectedCountry || searchParams.get("country_id") || 19,
        quantity: (typeof anyAmount !== 'undefined' && anyAmount) ? 1 : Number(searchParams.get("quantity")) || 1,
        donation_amount: amount,
        donation_pound_amount: amount,
        participant_name: "",
        program_rate_id: programRateId || Number(searchParams.get("program_rate_id")),
      };
      // Add session_id or donor_id to cartData
      if (isAuthenticated && user?.user_id) {
        cartData.donor_id = user.user_id;
      } else if (sessionId) {
        cartData.session_id = sessionId;
      }

      // Store cart data in localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        // Store as array to match checkout page expectations
        localStorage.setItem('cart', JSON.stringify([cartData]));
      }

      console.log("Creating cart with:", cartData);
      const response = await createCart(cartData);
      console.log("Cart created:", response);

      // Add to cart context (if needed)
      addToCart(cartData);
      // Track add_to_cart event
      trackEvent('add_to_cart', 'engagement', 'donation_cart_created', parseFloat(amount));

      // Reset donation state
      resetDonation();

      // Navigate to checkout immediately after success
      window.location.href = "/checkout";
    } catch (error) {
      toast.error(`Error creating cart: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (numericStep) {
      case 1:
        return (
          <DonationPeriodSelection
            selectedPeriod={selectedPeriod}
            onSelect={handlePeriodSelect}
            setStep={setStep}
          />
        );
      case 2:
        return (
          <CategorySelection
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ProgramSelection
            setSelectedProgram={setSelectedProgram}
            category={selectedCategory}
            setSelectedCountry={setSelectedCountry}
            onBack={handleBack}
            onSelect={handleProgramSelect}
            setStep={setStep}
          />

        );
      case 4:
        return (
          <CountrySelection
            program={selectedProgram}
            category={selectedCategory}
            onSelect={handleCountrySelect}
            onBack={handleBack}
            setStep={setStep}
          />
        );
      case 5:
        return (
          <AmountSelection
            prevData={{ selectedCategory, selectedCountry, selectedProgram }}
            selectedProgram={selectedProgram}
            onSelect={handleCountrySelect}
            setProgramRateId={setProgramRateId}
            setStep={setStep}
            onBack={handleBack}
            isLoading={isLoading}
            handleAmountSelect={handleAmountSelect}
          />
        );
      default:
        return null;
    }
  };



  // Modify the return statement to ensure DonationPeriodSelection is always shown first
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 ">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl p-8">
          <header className="text-center mb-8">
            <h1 className="md:text-5xl text-4xl font-bold text-primary mb-2">
              Making a Lasting Difference <br /><span className=" font-bold mb-2 -m-2">Together</span>
            </h1>

            <p className="text-gray-600">Your contribution can change lives</p>
          </header>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {step} of 5
              </span>
              <span className="text-sm font-medium text-gray-700">
                {step === 1 && "Donation Period"}
                {step === 2 && "Category"}
                {step === 3 && "Program"}
                {step === 4 && "Country"}
                {step === 5 && "Amount"}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {step > 1 && (
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-gray-600 hover:text-grey"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>
          )}

          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {!isClient ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={numericStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
