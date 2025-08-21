import React from 'react';

const DonationPeriodSelection = ({ selectedPeriod, onSelect, setStep }) => {
    const periods = [
        {
            id: 'one-off',
            name: 'One-off Donation',
            description: 'Make a single donation to support our cause',
        },
        {
            id: 'direct-debit',
            name: 'Monthly Donation',
            description: 'Set up a recurring monthly donation to provide continuous support',
        },
    ];

    const handlePeriodSelect = (period) => {
        onSelect(period);
        setStep(2);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-grey mb-2">Choose Donation Period</h2>
                <p className="text-gray-600">Select how you would like to make your donation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {periods.map((period) => (
                    <button
                        key={period.id}
                        onClick={() => handlePeriodSelect(period.id)}
                        className={`p-6 rounded-lg border-2 text-left ${selectedPeriod === period.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-secondary'
                            }`}
                    >
                        <h3 className="text-lg font-semibold text-grey mb-2">{period.name}</h3>
                        <p className="text-gray-600 text-sm">{period.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DonationPeriodSelection; 