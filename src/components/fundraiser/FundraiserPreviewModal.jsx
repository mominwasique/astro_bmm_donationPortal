import React, { useState } from 'react';
import { publishFundraiser } from '../../api/fundraiser';
import toast from 'react-hot-toast';

const FundraiserPreviewModal = ({ fundraiser, isOpen, onClose, onPublishSuccess }) => {
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState(null);

    if (!isOpen || !fundraiser) return null;

    // Calculate progress percentage
    const progress = fundraiser.target_amount > 0
        ? Math.round((fundraiser.raised_amount || 0) / fundraiser.target_amount * 100)
        : 0;

    // Format dates
    const createdDate = new Date(fundraiser.created_at || fundraiser.created);
    const startDate = fundraiser.start_date ? new Date(fundraiser.start_date) : null;
    const endDate = fundraiser.end_date ? new Date(fundraiser.end_date) : null;

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Get status color and icon
    const getStatusInfo = (status) => {
        switch (status) {
            case 'Active':
                return {
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: 'bg-emerald-500',
                    dot: 'bg-emerald-500'
                };
            case 'Draft':
                return {
                    color: 'bg-slate-100 text-slate-600 border-slate-200',
                    icon: 'bg-slate-400',
                    dot: 'bg-slate-400'
                };
            case 'Paused':
                return {
                    color: 'bg-secondary-50 text-secondary-700 border-secondary-200',
                    icon: 'bg-secondary-500',
                    dot: 'bg-secondary-500'
                };
            case 'Completed':
                return {
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: 'bg-blue-500',
                    dot: 'bg-blue-500'
                };
            default:
                return {
                    color: 'bg-slate-100 text-slate-600 border-slate-200',
                    icon: 'bg-slate-400',
                    dot: 'bg-slate-400'
                };
        }
    };

    const statusInfo = getStatusInfo(fundraiser.status);

    const handlePublish = async () => {
        if (isPublishing) return;

        setIsPublishing(true);
        setPublishError(null);

        try {
            await publishFundraiser(fundraiser.id);
            if (onPublishSuccess) {
                onPublishSuccess();
            }
            onClose();
        } catch (error) {
            setPublishError(error.message || 'Failed to publish fundraiser');
        } finally {
            setIsPublishing(false);
        }
    };



    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full ${statusInfo.icon} flex items-center justify-center`}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Fundraiser Preview
                            </h2>
                            <p className="text-sm text-slate-600">
                                ID: {fundraiser.id} • Created: {formatDate(createdDate)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Fundraiser Header */}
                    <div className="mb-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-slate-800 mb-1">
                                    {fundraiser.title || fundraiser.name}
                                </h1>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${statusInfo.dot}`}></div>
                                {fundraiser.status || 'draft'}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-slate-100 rounded-full h-3 mb-3">
                            <div
                                className="bg-gradient-to-r from-primary/50 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out flex items-center justify-center"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            >
                                {progress > 15 && (
                                    <span className="text-white text-xs font-semibold">
                                        {progress}%
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-primary-50 rounded-lg p-3 border border-primary/20">
                                <div className="text-xs text-primary font-medium mb-1">Target</div>
                                <div className="text-lg font-bold text-primary">
                                    £{Number(fundraiser.target_amount || fundraiser.target).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                                <div className="text-xs text-emerald-600 font-medium mb-1">Raised</div>
                                <div className="text-lg font-bold text-emerald-700">
                                    £{Number(fundraiser.raised_amount || fundraiser.raised || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                <div className="text-xs text-slate-600 font-medium mb-1">Remaining</div>
                                <div className="text-lg font-bold text-slate-700">
                                    £{Math.max(0, (Number(fundraiser.target_amount || fundraiser.target) - Number(fundraiser.raised_amount || fundraiser.raised || 0))).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Details - Compact Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        {/* Left Column */}
                        <div className="space-y-3">
                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Description
                                </h3>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                    <div className="text-sm text-slate-700 leading-relaxed">
                                        {fundraiser.description || fundraiser.story || 'No description provided'}
                                    </div>
                                </div>
                            </div>

                            {/* Category */}
                            {fundraiser.category && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Category
                                    </h3>
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            {fundraiser.category}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                            {/* Campaign Dates */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Timeline
                                </h3>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Start:</span>
                                        <span className="text-slate-800 font-medium">{formatDate(startDate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">End:</span>
                                        <span className="text-slate-800 font-medium">{formatDate(endDate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Duration:</span>
                                        <span className="text-slate-800 font-medium">
                                            {startDate && endDate ?
                                                `${Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days` :
                                                'Not set'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Details
                                </h3>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Canvasser ID:</span>
                                        <span className="text-slate-800 font-medium">{fundraiser.canvasser_id}</span>
                                    </div>
                                    {fundraiser.appeal_id && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">Appeal ID:</span>
                                            <span className="text-slate-800 font-medium">{fundraiser.appeal_id}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Updated:</span>
                                        <span className="text-slate-800 font-medium">
                                            {fundraiser.updated_at ? formatDate(new Date(fundraiser.updated_at)) : 'Not available'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Statistics - Compact */}
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Performance
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-gradient-to-br from-primary-50 to-emerald-50 rounded-lg p-3 border border-primary/20 text-center">
                                <div className="text-lg font-bold text-primary mb-1">{progress}%</div>
                                <div className="text-xs text-primary font-medium">Goal</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200 text-center">
                                <div className="text-lg font-bold text-blue-700 mb-1">
                                    {fundraiser.donations_count || 0}
                                </div>
                                <div className="text-xs text-blue-600 font-medium">Donations</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200 text-center">
                                <div className="text-lg font-bold text-purple-700 mb-1">
                                    £{Number(fundraiser.raised_amount || fundraiser.raised || 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-purple-600 font-medium">Raised</div>
                            </div>
                            <div className="bg-gradient-to-br from-secondary-50 to-red-50 rounded-lg p-3 border border-secondary-200 text-center">
                                <div className="text-lg font-bold text-secondary-700 mb-1">
                                    {fundraiser.views_count || 0}
                                </div>
                                <div className="text-xs text-secondary-600 font-medium">Views</div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {publishError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-red-700">{publishError}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                    >
                        Close
                    </button>
                    {(fundraiser.status == 'draft' || fundraiser.status == 'Draft') && (
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPublishing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Publish Fundraiser
                                </>
                            )}
                        </button>
                    )}
                    <button
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors font-medium text-sm flex items-center"
                        onClick={() => {
                            window.open(`${import.meta.env.PUBLIC_WEBSITE_URL}/fundraiser/${fundraiser.slug_url}`, '_blank');
                            toast.success(`${import.meta.env.PUBLIC_WEBSITE_URL}/fundraiser/${fundraiser.slug_url}`, '_blank')
                        }}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Public Page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FundraiserPreviewModal;