import { Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { fetchPrograms } from '../../../api/programsApi';
import DonationCard from '../common/DonationCard';
import SearchableList from '../common/SearchableList';
import ErrorMessage from '../Error/ErrorMessage';
import SkeletonCard from '../Loading/SkeletonCard';

const ProgramSelection = ({ category, onBack, setStep, setSelectedProgram, setSelectedCountry }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log(category);

        setIsError(false);
        const result = await fetchPrograms(category);
        console.log(result);

        setData(result);
      } catch (err) {
        setIsError(true);
        setError(err.message || 'Failed to fetch programs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [category]);

  const programs = data?.program;

  const handleSelect = (program) => {
    setSelectedProgram(program.program_id);
    // Always go to country selection first, let CountrySelection handle the logic
    setSelectedCountry("")
    setStep(4);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SearchableList
          items={programs}
          renderItem={(program) => (
            <div
              className="transform transition-all duration-200 hover:scale-[1.02]"
              key={program.program_id}
            >
              <DonationCard
                title={program.program_name}
                description={program.description}
                onClick={() => handleSelect(program)}
                className="h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
              />
            </div>
          )}
          searchKey="program_name"
          placeholder="Search programs..."
          className="w-full"
          searchInputClassName="w-full px-4 py-3 pl-12 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
          searchIconClassName="absolute left-4 top-3.5 text-gray-400"
          SearchIcon={Search}
        />
      </div>
    );
  };

  return (

    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Select a Program</h2>

      {renderContent()}
    </div>
  );
};

export default ProgramSelection;