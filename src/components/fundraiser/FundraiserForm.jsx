import React, { useState, useEffect } from 'react';
import { useCanvasserAuth } from '../../context/CanvasserAuthContext';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import api from '../../api/axios';
import { getFeaturedAppeals } from '../../api/appealApi';
import toast from 'react-hot-toast';

const FundraiserForm = ({ fundraiser = null, onClose, onSuccess }) => {
    const { canvasser } = useCanvasserAuth();
    const isEditing = !!fundraiser;

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        story: '',
        target_amount: '',
        status: 'draft',
        start_date: '',
        end_date: '',
        appeal_id: '',
        image: null,
        imageUrl: null,
        ...fundraiser,
        story: fundraiser?.description || fundraiser?.story || '',
        image: null,
        imageUrl: fundraiser?.image_url || fundraiser?.image || fundraiser?.image_path || null,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [appeals, setAppeals] = useState([]);
    const [loadingAppeals, setLoadingAppeals] = useState(true);


    // Fetch appeals on component mount
    useEffect(() => {
        const fetchAppeals = async () => {
            try {
                setLoadingAppeals(true);
                const appealsData = await getFeaturedAppeals();
                setAppeals(appealsData);
            } catch (error) {
                console.error('Error fetching appeals:', error);
                setAppeals([]);
            } finally {
                setLoadingAppeals(false);
            }
        };

        fetchAppeals();
    }, []);



    // Reset form when fundraiser prop changes
    useEffect(() => {
        if (fundraiser) {
            setFormData({
                title: fundraiser.title || '',
                story: fundraiser.description || fundraiser.story || '',
                target_amount: fundraiser.target_amount || fundraiser.target || '',
                status: fundraiser.status || 'draft',
                start_date: fundraiser.start_date || '',
                end_date: fundraiser.end_date || '',
                appeal_id: fundraiser.appeal_id || '',
                image: null,
                imageUrl: fundraiser.image_url || fundraiser.image || fundraiser.image_path || null,
            });
        }
    }, [fundraiser]);


    // Validation function
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.story.trim()) {
            newErrors.story = 'Description is required';
        }

        if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
            newErrors.target_amount = 'Target amount must be greater than 0';
        }

        if (!formData.start_date) {
            newErrors.start_date = 'Start date is required';
        }

        if (!formData.end_date) {
            newErrors.end_date = 'End date is required';
        }

        if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
            newErrors.end_date = 'End date must be after start date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('story', formData.story);
            payload.append('target_amount', formData.target_amount);
            payload.append('status', formData.status);
            payload.append('start_date', formData.start_date);
            payload.append('end_date', formData.end_date);
            payload.append('canvasser_id', canvasser?.user_id);
            if (formData.appeal_id) payload.append('appeal_id', formData.appeal_id);
            if (formData.image) payload.append('image', formData.image);
            // Add other fields as needed

            const url = isEditing
                ? `/update-fundrasing/${fundraiser.id}`
                : '/add-fundraiser';
            const method = isEditing ? 'POST' : 'POST'; // Use POST for both, or PUT for edit if backend supports

            const response = await fetch(import.meta.env.PUBLIC_API_BASE_URL + url, {
                method,
                headers: {
                    'Authorization': `Bearer ${import.meta.env.PUBLIC_API_TOKEN}`,
                },
                body: payload,
            });
            if (!response.ok) throw new Error('Failed to save fundraiser');
            const result = await response.json();
            queryClient.invalidateQueries(['fundraisers', canvasser?.user_id]);
            onSuccess?.(result);
            onClose();
            toast.success('Fundraiser saved successfully');
        } catch (error) {
            setErrors({ submit: 'Failed to save fundraiser. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle file upload (for image)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                image: file,
                imageUrl: imageUrl
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {isEditing ? 'Edit Fundraiser' : 'Create New Fundraiser'}
                        </h2>
                        <p className="text-slate-600 mt-1">
                            {isEditing ? 'Update your fundraising campaign details' : 'Set up a new fundraising campaign'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Basic Information
                        </h3>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                                Campaign Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors ${errors.title ? 'border-red-300' : 'border-slate-300'
                                    }`}
                                placeholder="Enter campaign title"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* Description (now Story) */}
                        <div>
                            <label htmlFor="story" className="block text-sm font-medium text-slate-700 mb-2">
                                Description *
                            </label>
                            <div className={`border rounded-lg ${errors.story ? 'border-red-300' : 'border-slate-300'}`}>
                                <ReactQuill
                                    id="story"
                                    theme="snow"
                                    value={formData.story || ''}
                                    onChange={value => {
                                        setFormData(prev => ({ ...prev, story: value }));
                                        if (errors.story) setErrors(prev => ({ ...prev, story: '' }));
                                    }}
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['link', 'image'],
                                            ['clean']
                                        ]
                                    }}
                                    style={{
                                        background: 'white',
                                        borderRadius: '0.5rem',
                                        minHeight: '120px'
                                    }}
                                />
                            </div>
                            {errors.story && (
                                <p className="text-red-500 text-sm mt-1">{errors.story}</p>
                            )}
                        </div>

                        {/* Appeal Selection */}
                        <div>
                            <label htmlFor="appeal_id" className="block text-sm font-medium text-slate-700 mb-2">
                                Associated Appeal
                            </label>
                            {loadingAppeals ? (
                                <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50">
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading appeals...
                                    </div>
                                </div>
                            ) : (
                                <select
                                    id="appeal_id"
                                    name="appeal_id"
                                    value={formData.appeal_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                                >
                                    <option value="">Select an appeal </option>
                                    {appeals.map((appeal) => (
                                        <option key={appeal.appeal_id} value={appeal.appeal_id}>
                                            {appeal.appeal_title || appeal.appeal_name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <p className="text-slate-500 text-sm mt-1">
                                Choose an appeal to associate with this fundraiser (optional)
                            </p>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            Financial Information
                        </h3>

                        {/* Target Amount */}
                        <div>
                            <label htmlFor="target_amount" className="block text-sm font-medium text-slate-700 mb-2">
                                Target Amount (£) *
                            </label>
                            <input
                                type="number"
                                id="target_amount"
                                name="target_amount"
                                value={formData.target_amount}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors ${errors.target_amount ? 'border-red-300' : 'border-slate-300'
                                    }`}
                                placeholder="0.00"
                            />
                            {errors.target_amount && (
                                <p className="text-red-500 text-sm mt-1">{errors.target_amount}</p>
                            )}
                        </div>
                    </div>

                    {/* Campaign Dates */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Campaign Dates
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    id="start_date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors ${errors.start_date ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                />
                                {errors.start_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                                )}
                            </div>

                            {/* End Date */}
                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-slate-700 mb-2">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors ${errors.end_date ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                />
                                {errors.end_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Campaign Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Campaign Settings
                        </h3>

                        {/* Status */}
                        {/* <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Paused">Paused</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div> */}

                        {/* Image Upload */}
                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-2">
                                Campaign Image
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                            />
                            <p className="text-slate-500 text-sm mt-1">
                                Upload an image to represent your campaign (optional)
                            </p>

                            {/* Display chosen image */}
                            {formData.imageUrl && (
                                <div className="mt-3">
                                    <p className="text-sm text-gray-500 mb-2">Current image:</p>
                                    <img
                                        src={formData.imageUrl}
                                        alt="Campaign image"
                                        className="max-w-full h-48 object-cover rounded-lg border border-slate-200"
                                        onError={(e) => {
                                            console.error('Image failed to load:', formData.imageUrl);
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            {!formData.imageUrl && (
                                <div className="mt-3 text-sm text-gray-400">
                                    No image selected
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            style={{ boxShadow: '0 6px 24px 0 rgba(16, 185, 129, 0.15)', background: 'linear-gradient(to right, #059669, #059669)' }}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isEditing ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                isEditing ? 'Update Fundraiser' : 'Create Fundraiser'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FundraiserForm; 