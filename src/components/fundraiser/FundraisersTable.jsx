import React, { useState, useEffect } from "react";
import { deleteFundraiser, getFundraiserById, publishFundraiser } from "../../api/fundraiser";
import { useCanvasserAuth } from "../../context/CanvasserAuthContext";
import LoadingSpinner from "../LoadingSpinner";
import FundraiserForm from "./FundraiserForm";
import FundraiserPreviewModal from "./FundraiserPreviewModal";
import toast from "react-hot-toast";


export default function FundraisersTable() {
    const { canvasser } = useCanvasserAuth();
    const [showForm, setShowForm] = useState(false);
    const [editingFundraiser, setEditingFundraiser] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewFundraiser, setPreviewFundraiser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fundraiserToDelete, setFundraiserToDelete] = useState(null);
    const [fundraisersData, setFundraisersData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);

    // Fetch fundraisers
    useEffect(() => {
        const fetchFundraisers = async () => {
            if (canvasser?.user_id) {
                try {
                    setIsLoading(true);
                    setIsError(false);
                    const result = await getFundraiserById(canvasser.user_id);
                    setFundraisersData(result);
                } catch (err) {
                    setIsError(true);
                    setError(err.message || 'Failed to fetch fundraisers');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchFundraisers();
    }, [canvasser?.user_id]);

    // Filter fundraisers by canvasser ID
    const filteredFundraisers = fundraisersData?.data?.filter(
        fundraiser => fundraiser.canvasser_id === canvasser?.user_id
    ) || [];

    // Publish fundraiser function
    const handlePublish = async (fundraiserId) => {
        try {
            const response = await publishFundraiser(fundraiserId);
            if (response.data?.success) {
                toast.success('Fundraiser published successfully!');
                // Refetch fundraisers
                const result = await getFundraiserById(canvasser?.user_id);
                setFundraisersData(result);
            } else {
                toast.error(response.data?.message || 'Failed to publish fundraiser');
            }
        } catch (error) {
            console.error('Publish fundraiser error:', error);
            toast.error(error.response?.data?.message || 'Failed to publish fundraiser. Please try again.');
        }
    };

    // Delete fundraiser function
    const handleDelete = async (fundraiserId) => {
        try {
            const response = await deleteFundraiser(fundraiserId);
            if (response.data?.success) {
                toast.success('Fundraiser deleted successfully!');
                setShowDeleteModal(false);
                setFundraiserToDelete(null);
                // Refetch fundraisers
                const result = await getFundraiserById(canvasser?.user_id);
                setFundraisersData(result);
            } else {
                toast.error(response.data?.message || 'Failed to delete fundraiser');
            }
        } catch (error) {
            console.error('Delete fundraiser error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete fundraiser. Please try again.');
        }
    };



    const openDeleteModal = (fundraiser) => {
        setFundraiserToDelete(fundraiser);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setFundraiserToDelete(null);
    };

    // Handle loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
                            Fundraisers
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl">
                            Review and manage your fundraising campaigns with detailed insights and progress tracking.
                        </p>
                    </div>

                    {/* Skeleton Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-slate-300 rounded mr-2 animate-pulse"></div>
                                                <div className="w-20 h-4 bg-slate-300 rounded animate-pulse"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-slate-300 rounded mr-2 animate-pulse"></div>
                                                <div className="w-16 h-4 bg-slate-300 rounded animate-pulse"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-slate-300 rounded mr-2 animate-pulse"></div>
                                                <div className="w-12 h-4 bg-slate-300 rounded animate-pulse"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-slate-300 rounded mr-2 animate-pulse"></div>
                                                <div className="w-14 h-4 bg-slate-300 rounded animate-pulse"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-slate-300 rounded mr-2 animate-pulse"></div>
                                                <div className="w-12 h-4 bg-slate-300 rounded animate-pulse"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-slate-300 rounded mr-2 animate-pulse"></div>
                                                <div className="w-16 h-4 bg-slate-300 rounded animate-pulse"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                            <div className="w-16 h-4 bg-slate-300 rounded animate-pulse ml-auto"></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {[...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="w-32 h-4 bg-slate-200 rounded mb-2"></div>
                                                        <div className="w-20 h-3 bg-slate-200 rounded"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-20 h-4 bg-slate-200 rounded mb-2"></div>
                                                <div className="w-16 h-3 bg-slate-200 rounded"></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-24 h-4 bg-slate-200 rounded"></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-20 h-4 bg-slate-200 rounded"></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-1 mr-3">
                                                        <div className="w-full bg-slate-200 rounded-full h-2"></div>
                                                    </div>
                                                    <div className="w-8 h-3 bg-slate-200 rounded"></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                                                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                                                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Skeleton Summary Stats */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-6 h-6 bg-slate-200 rounded mr-2 animate-pulse"></div>
                            <div className="w-40 h-6 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="w-16 h-8 bg-slate-200 rounded mx-auto mb-2 animate-pulse"></div>
                                    <div className="w-24 h-4 bg-slate-200 rounded mx-auto animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle error state
    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto bg-white">
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                            Fundraisers
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl">
                            Review and manage your fundraising campaigns with detailed insights and progress tracking.
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Error Loading Fundraisers
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {error?.response?.data?.message || error?.message || 'Failed to load fundraisers'}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            {filteredFundraisers.length === 0 ? (
                <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                                Fundraisers
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl">
                                Review and manage your fundraising campaigns with detailed insights and progress tracking.
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                No Fundraisers Yet
                            </h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                You haven't created any fundraising campaigns yet. Start your first campaign to begin raising funds for your cause.
                            </p>
                            <button className="bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md" onClick={() => {
                                setShowForm(true);
                                setEditingFundraiser(null);
                            }}>
                                Create Your First Fundraiser
                            </button>
                        </div>
                    </div>
                </div>
            ) : (<div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                                Fundraisers
                            </h1>
                            <p className="text-base text-slate-600 max-w-2xl">
                                Review and manage your fundraising campaigns with detailed insights and progress tracking.
                            </p>
                        </div>
                        <div className="mt-3 md:mt-0 flex items-center space-x-3">
                            <button
                                onClick={() => {
                                    setEditingFundraiser(null);
                                    setShowForm(true);
                                }}
                                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-primary transition-all duration-200 flex items-center text-base border-2 border-primary focus:outline-none focus:ring-4 focus:ring-primary/30"
                                
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Fundraiser
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modern Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            Fundraiser
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Created
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            Target
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Raised
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Status
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                            Progress
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredFundraisers.map((fundraiser, i) => {
                                    // Calculate progress percentage
                                    const progress = fundraiser.target_amount > 0
                                        ? Math.round((fundraiser.raised_amount || 0) / fundraiser.target_amount * 100)
                                        : 0;

                                    // Format date
                                    const createdDate = new Date(fundraiser.created_at || fundraiser.created);
                                    const formattedDate = createdDate.toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    });

                                    // Get status color
                                    const getStatusColor = (status) => {
                                        switch (status) {
                                            case 'publish':
                                                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                            case 'draft':
                                                return 'bg-slate-100 text-slate-600 border-slate-200';
                                            default:
                                                return 'bg-secondary-50 text-secondary-700 border-secondary-200';
                                        }
                                    };

                                    return (
                                        <tr key={fundraiser.id || i} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-semibold text-slate-900 hover:text-primary cursor-pointer transition-colors">
                                                            {fundraiser.title || fundraiser.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            ID: {fundraiser.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-slate-900 font-medium">{formattedDate}</div>
                                                <div className="text-xs text-slate-500">
                                                    {createdDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-900">
                                                    £{Number(fundraiser.target_amount || fundraiser.target).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-bold text-emerald-600">
                                                    £{Number(fundraiser.raised_amount || fundraiser.raised || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(fundraiser.status)}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${fundraiser.status === 'Active' ? 'bg-emerald-500' : fundraiser.status === 'Draft' ? 'bg-slate-400' : 'bg-secondary-500'}`}></div>
                                                    {fundraiser.status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-1 mr-2">
                                                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                            <div
                                                                className="bg-primary/50 h-1.5 rounded-full transition-all duration-500 ease-out"
                                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-700 min-w-[2.5rem]">
                                                        {progress}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <button
                                                        onClick={() => {
                                                            setPreviewFundraiser(fundraiser);
                                                            setShowPreview(true);
                                                        }}
                                                        className="text-primary hover:text-primary transition-colors duration-200 p-1.5 rounded-lg hover:bg-primary-50"
                                                        title="View Fundraiser Details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingFundraiser(fundraiser);
                                                            setShowForm(true);
                                                        }}
                                                        className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200 p-1.5 rounded-lg hover:bg-emerald-50"
                                                        title="Edit Fundraiser"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => openDeleteModal(fundraiser)}
                                                        className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1.5 rounded-lg hover:bg-red-50"
                                                        title="Delete Fundraiser"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Campaign Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-primary-50 rounded-lg border border-primary/20">
                            <div className="text-2xl font-bold text-primary mb-1">
                                {filteredFundraisers.length}
                            </div>
                            <div className="text-xs text-primary font-medium">Total Campaigns</div>
                        </div>
                        <div className="text-center p-3 bg-primary/20 rounded-lg border border-emerald-200">
                            <div className="text-2xl font-bold text-primary mb-1">
                                {filteredFundraisers.filter(f => f.status === 'Active').length}
                            </div>
                            <div className="text-xs text-primary font-medium">Active Campaigns</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-2xl font-bold text-slate-700 mb-1">
                                £{filteredFundraisers.reduce((sum, f) => sum + (Number(f.target_amount || f.target) || 0), 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-600 font-medium">Total Target</div>
                        </div>
                        <div className="text-center p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                            <div className="text-2xl font-bold text-secondary-700 mb-1">
                                £{filteredFundraisers.reduce((sum, f) => sum + (Number(f.raised_amount || f.raised) || 0), 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-secondary-600 font-medium">Total Raised</div>
                        </div>
                    </div>
                </div>
            </div>)}

            {/* Fundraiser Form Modal */}
            {showForm && (
                <FundraiserForm
                    fundraiser={editingFundraiser}
                    onClose={() => {
                        setShowForm(false);
                        setEditingFundraiser(null);
                    }}
                    onSuccess={(result) => {
                        // The form will automatically close and refetch data
                    }}
                />
            )}

            {/* Fundraiser Preview Modal */}
            {showPreview && (
                <FundraiserPreviewModal
                    fundraiser={previewFundraiser}
                    isOpen={showPreview}
                    onClose={() => {
                        setShowPreview(false);
                        setPreviewFundraiser(null);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && fundraiserToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={closeDeleteModal}
                        ></div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Delete Fundraiser
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete <strong>"{fundraiserToDelete.title || fundraiserToDelete.name}"</strong>? This action cannot be undone and will permanently remove the fundraiser and all associated data.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => handleDelete(fundraiserToDelete.id)}
                                    disabled={deleteMutation.isPending}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleteMutation.isPending ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </div>
                                    ) : (
                                        'Delete Fundraiser'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    disabled={deleteMutation.isPending}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Add Button */}
            <button
                onClick={() => {
                    setEditingFundraiser(null);
                    setShowForm(true);
                }}
                className="fixed bottom-8 right-8 z-50 bg-primary hover:bg-primary text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center text-3xl border-4 border-white focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-200"
                aria-label="Add Fundraiser"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>
        </div>
    );
} 