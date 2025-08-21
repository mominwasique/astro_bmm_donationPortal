import React, { useState, useRef, useEffect } from 'react';
import { Loader2, PoundSterling } from 'lucide-react';
import ErrorMessage from '../Error/ErrorMessage';
import SkeletonCard from '../Loading/SkeletonCard';
import { fetchProgramRate } from '../../../api/programsApi';

const AmountSelection = ({
  onBack,
  prevData,
  handleAmountSelect,
  setStep,
  setProgramRateId,
  isLoading,
  counties = [],

}) => {

  const { selectedCategory, selectedCountry, selectedProgram } = prevData;

  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [amountError, setAmountError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef(null);
  const [programRate, setProgramRate] = useState(null);
  const [programRateLoading, setProgramRateLoading] = useState(true);
  const [programRateError, setProgramRateError] = useState(false);
  const [programRateErrorMessage, setProgramRateErrorMessage] = useState(null);

  const searchParams = window.location.href

  const predefinedAmounts = [10, 20, 50, 100, 200];

  useEffect(() => {
    const fetchProgramRateData = async () => {
      try {
        setProgramRateLoading(true);
        setProgramRateError(false);
        
        // If no country is selected, we can still proceed with amount selection
        if (!selectedCountry) {
          setProgramRate(null);
          setProgramRateLoading(false);
          return;
        }
        
        const result = await fetchProgramRate(selectedCategory, selectedCountry, selectedProgram);
        setProgramRate(result);
        if (result?.program_rate?.program_rate_id) {
          setProgramRateId(result.program_rate.program_rate_id);
        }
      } catch (err) {
        setProgramRateError(true);
        setProgramRateErrorMessage(err.message || 'Failed to fetch program rate');
      } finally {
        setProgramRateLoading(false);
      }
    };

    if (selectedCategory && selectedProgram) {
      fetchProgramRateData();
    }
  }, [selectedCategory, selectedCountry, selectedProgram, setProgramRateId]);

  const handleCustomAmountChange = e => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
      setAmountError('');
    }
  };

  const handleAmountClick = amount => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setAmountError('');
  };

  const handleConfirm = () => {
    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      return;
    }

    if (!selectedAmount && !customAmount) {
      setAmountError('Please select or enter an amount.');
      return;
    }

    // Set submitting state to prevent multiple clicks
    setIsSubmitting(true);

    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    // Add a small delay to prevent rapid successive clicks
    submitTimeoutRef.current = setTimeout(() => {
      handleAmountSelect(
        selectedAmount || customAmount,
        parseInt(selectedAmount) !== parseInt(programRate?.program_rate?.program_rate)
      );
      // Reset submitting state after a delay to allow for API response
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
    }, 300);
  };

  if (programRateLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-grey">Select or Enter an Amount</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(index => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (programRateError) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-grey">Select or Enter an Amount</h2>
        <ErrorMessage message={programRateErrorMessage} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const recommendedAmount = programRate?.program_rate?.program_rate;
  const allowCustom =
    !programRate || // Allow custom when no program rate (no country selected)
    counties.length == 0 ||
    !recommendedAmount ||
    programRate?.program_rate?.any_amount == 'Y' ||
    !programRate?.program_rate?.any_amount == 'N';

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-grey mb-2">Select or Enter an Amount</h2>
        <p className="text-gray-600">Select how much you'd like to donate</p>
      </div>

      {/* Recommended Amount */}
      {recommendedAmount && (
        <div className="bg-white rounded-xl border-2 border-secondary p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between flex-col  md:flex-row">
            <div>
              <h3 className="text-lg font-semibold text-grey">Recommended Amount</h3>
              <p className="text-sm text-gray-600 mt-1">
                This is the suggested donation amount for this program
              </p>
            </div>
            <button
              onClick={() => handleAmountClick(recommendedAmount)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all mt-5 md:t-0 ${selectedAmount === recommendedAmount
                ? 'bg-secondary text-white'
                : 'bg-primary text-white hover:bg-primary/90 border-2 '
                }`}
            >
              <PoundSterling size={20} />
              <span className="font-semibold">{`${Number(recommendedAmount) * Number(searchParams.includes('quantity') || 1)}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom & Predefined Amounts */}
      {allowCustom && (
        <div className="space-y-6">
          {programRate?.program_rate?.any_amount && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-grey">Or Choose a Custom Amount</h3>
              <p className="text-sm text-gray-600 mt-1">
                Select from our predefined amounts or enter your own
              </p>
            </div>
          )}

          {/* Predefined Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-5">
            {predefinedAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => handleAmountClick(amount)}
                className={`flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all ${selectedAmount === amount
                  ? 'border-secondary bg-white text-grey shadow-[0_0_15px_rgba(196,146,97,0.3)]'
                  : 'border-gray-200 bg-white text-grey hover:border-secondary hover:shadow-[0_0_15px_rgba(196,146,97,0.2)]'
                  }`}
              >
                <PoundSterling className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">{amount} </span>
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="space-y-4 bg-white rounded-xl border-2  border-secondary p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-grey">Enter a Custom Amount</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Specify exactly how much you'd like to donate
                </p>
              </div>
              <div className="bg-secondary/10 p-2 rounded-lg">
                <PoundSterling size={24} className="text-secondary" />
              </div>
            </div>

            <div className="relative mt-4">
              <div className="flex items-center shadow-sm border-2 rounded-xl overflow-hidden transition-all focus-within:shadow-[0_0_15px_rgba(196,146,97,0.2)] text-sm sm:text-base">
                <span className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-r border-gray-200 text-grey">
                  <PoundSterling className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <input
                  id="customAmount"
                  type="text"
                  value={customAmount || selectedAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="Enter your preferred amount"
                  className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 text-base sm:text-lg focus:outline-none`}
                />
              </div>
              {amountError && (
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">{amountError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={handleConfirm}
        disabled={(!selectedAmount && !customAmount) || isLoading || isSubmitting}
        className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all ${(!selectedAmount && !customAmount) || isSubmitting
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-primary text-white hover:bg-primary/90'
          }`}
      >
        {isLoading || isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin m-auto" />
        ) : (
          'Confirm Amount'
        )}
      </button>
    </div>
  );
};

export default AmountSelection;
