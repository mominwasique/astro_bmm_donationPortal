import React, { useEffect, useState } from 'react';
import AuthModal from './fundraiser/AuthModal';
import LoginModal from './fundraiser/LoginModal';
import { addFundraiser, getAllAppeals } from '../api/fundraiser';
import useLocalStorage from '../hooks/useLocalStorage';
import { useCanvasserAuth } from '../context/CanvasserAuthContext';
import toast from 'react-hot-toast';

const Fundraiser = () => {
    const [title, setTitle] = useLocalStorage('fundraiser_title', '');
    const [appeal, setAppeal] = useLocalStorage('fundraiser_appeal', '');
    const [goal, setGoal] = useLocalStorage('fundraiser_goal', '');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [appeals, setAppeals] = useState([]);
    const { isAuthenticated } = useCanvasserAuth();
    const { canvasser } = useCanvasserAuth();

    useEffect(() => {
        const loadAppeals = async () => {
            try {
                const appealsData = await getAllAppeals();
                const appealsList = [
                    { value: '', label: 'Select an appeal' },
                    ...(appealsData?.data?.map(appeal => ({
                        value: appeal.appeal_id?.toString() || appeal.id?.toString(),
                        label: appeal.appeal_name || appeal.name
                    })) || [])
                ];
                setAppeals(appealsList);
            } catch (error) {
                console.error('Error loading appeals:', error);
                toast.error('Failed to load appeals');
            }
        };

        loadAppeals();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isAuthenticated) {
            setIsLoading(true);
            try {
                const response = await addFundraiser({
                    title,
                    appeal_id: appeal,
                    target_amount: goal,
                    canvasser_id: canvasser.user_id
                });

                if (response.data?.success) {
                    toast.success('Fundraiser created successfully');
                    window.location.href = '/account/canvasser';
                    clearFormData();
                } else {
                    toast.error(response.data?.message || 'Failed to create fundraiser');
                }
            } catch (error) {
                console.error('Add fundraiser error:', error);
                toast.error(error.response?.data?.message || 'Failed to create fundraiser. Please try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setShowAuthModal(true);
        }
    };

    const handleCloseAuthModal = () => {
        setShowAuthModal(false);
    };

    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
    };

    const handleSwitchToRegister = () => {
        setShowLoginModal(false);
        setShowAuthModal(true);
    };

    const clearFormData = () => {
        setTitle('');
        setAppeal('');
        setGoal('');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white shadow rounded-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Create Your Fundraiser
                        </h1>
                        <p className="text-gray-600">
                            Set up your fundraising campaign and start collecting donations for your cause.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Fundraiser Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your fundraiser title"
                            />
                        </div>

                        <div>
                            <label htmlFor="appeal" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Appeal *
                            </label>
                            <select
                                id="appeal"
                                value={appeal}
                                onChange={(e) => setAppeal(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {appeals.map((appealOption, index) => (
                                    <option key={index} value={appealOption.value}>
                                        {appealOption.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                                Fundraising Goal (£) *
                            </label>
                            <input
                                type="number"
                                id="goal"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                required
                                min="1"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your fundraising goal"
                            />
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating...' : 'Create Fundraiser'}
                            </button>
                        </div>
                    </form>

                    {showAuthModal && (
                        <AuthModal
                            onClose={handleCloseAuthModal}
                            onSwitchToLogin={() => {
                                setShowAuthModal(false);
                                setShowLoginModal(true);
                            }}
                        />
                    )}

                    {showLoginModal && (
                        <LoginModal
                            onClose={handleCloseLoginModal}
                            onSwitchToRegister={handleSwitchToRegister}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Fundraiser;
