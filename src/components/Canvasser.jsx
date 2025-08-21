import React from 'react';
import { useCanvasserAuth } from '../context/CanvasserAuthContext';

const Canvasser = () => {
    const { isAuthenticated, canvasser } = useCanvasserAuth();

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Access Denied
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            You need to be logged in as a canvasser to access this page.
                        </p>
                        <div className="mt-6">
                            <a
                                href="/fundraiser"
                                className="text-indigo-600 hover:text-indigo-500"
                            >
                                Go to Fundraiser Page
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow rounded-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Canvasser Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Welcome back, {canvasser?.first_name || 'Canvasser'}!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                Create Fundraiser
                            </h3>
                            <p className="text-blue-700 mb-4">
                                Start a new fundraising campaign for your cause.
                            </p>
                            <a
                                href="/fundraiser"
                                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Create New Fundraiser
                            </a>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-900 mb-2">
                                View Campaigns
                            </h3>
                            <p className="text-green-700 mb-4">
                                Manage your existing fundraising campaigns.
                            </p>
                            <button className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                View Campaigns
                            </button>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-900 mb-2">
                                Analytics
                            </h3>
                            <p className="text-purple-700 mb-4">
                                View detailed analytics and reports.
                            </p>
                            <button className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                                View Analytics
                            </button>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Recent Activity
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600">
                                No recent activity to display.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Canvasser;
