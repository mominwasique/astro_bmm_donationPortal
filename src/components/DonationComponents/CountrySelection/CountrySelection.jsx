import React, { useEffect, useState } from 'react';
import DonationCard from '../common/DonationCard';
import SkeletonCard from '../Loading/SkeletonCard';
import ErrorMessage from '../Error/ErrorMessage';
import SearchableList from '../common/SearchableList';
import { fetchCountries } from '../../../api/countiesApi';

const CountrySelection = ({ category, onSelect, onBack, setStep, program }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const result = await fetchCountries(program);
        console.log(result);
        setData(result);
      } catch (err) {
        setIsError(true);
        setError(err.message || 'Failed to fetch countries');
      } finally {
        setIsLoading(false);
      }
    };

    if (program) {
      fetchData();
    }
  }, [program]);

  const counties = data?.country;

  // Move the state update to useEffect to avoid updating state during render
  useEffect(() => {
    if (counties?.length === 0) {
      setStep(5);
    }
  }, [counties, setStep]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
    }

    return (
      <SearchableList
        items={counties}
        renderItem={(country) => (
          <DonationCard
            key={country.country_id}
            title={country.country_name}
            description={country.description}
            onClick={() => onSelect(country.country_id)}
          />
        )}
        searchKey="country_name"
        placeholder="Search counties..."
      />
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Choose a Country</h2>
      {renderContent()}
    </div>
  );
};

export default CountrySelection;
