import React, { useState, useEffect } from 'react';
import { User, Lock, MapPin, Heart, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { getDonorInfo, updateDonor, updateDonorPassword, addNewAddress, getDonorAddress, getOneOffTransactions, getDirectDebit } from '../api/donationApi';
import { fetchCities } from '../api/citiesApi';
import { fetchCountriesList } from '../api/countiesApi';
import AddressFinder from './AddressFinder';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressFormData, setAddressFormData] = useState({
        address1: '',
        address2: '',
        city_id: '',
        post_code: '',
        donor_id: '',
        country: ''
    });
    const {user, logout} = useAuth();

    const [cities, setCities] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [countries, setCountries] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [disable, setDisable] = useState(false);

    // Mock user data - replace with your auth context or state management
    // const [user, setUser] = useState({
    //     user_email: 'john.doe@example.com',
    //     user_id: '123',
    //     first_name: 'John',
    //     last_name: 'Doe',
    //     phone: '+44 123 456 789'
    // });

    // State for data that would come from API calls
    const [donorInfo, setDonorInfo] = useState(null);
    const [addressData, setAddressData] = useState(null);
    const [transactionsData, setTransactionsData] = useState(null);
    const [directDebitData, setDirectDebitData] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(false);

    const userEmail = user?.user_email || JSON.parse(localStorage.getItem('user'))?.user_email;
    const donorId = user?.user_id || JSON.parse(localStorage.getItem('user'))?.user_id;

    // const userEmail = user?.user_email;
    // const donorId = user?.user_id;

    // Password state
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [profileData, setProfileData] = useState({
        title: donorInfo?.data?.title || 'Mr',
        firstName: donorInfo?.data?.first_name || user?.first_name || '',
        lastName: donorInfo?.data?.last_name || user?.last_name || '',
        email: donorInfo?.data?.email || userEmail || '',
        phone: donorInfo?.data?.mobile || user?.phone || '',
    });

    useEffect(() => {
                const loadData = async () => {
                    if (userEmail) {
                        try {
                            const donor = await getDonorInfo(userEmail);
                            setDonorInfo(donor);
                        } catch (error) {
                            toast.error('Failed to fetch donor information');
                        }
                    }
        
                    if (donorId) {
                        try {
                            const address = await getDonorAddress(donorId);
                            setAddressData(address);
                        } catch (error) {
                            console.error('Error loading address:', error);
                        }
                    }
        
                    try {
                        const countriesData = await fetchCountriesList();
                        setCountries(countriesData);
                    } catch (error) {
                        console.error('Error loading countries:', error);
                    }
                };
        
                loadData();
            }, [userEmail, donorId]);

            useEffect(() => {
                        if (activeSection === 'donations' && donorId) {
                            const loadTransactions = async () => {
                                try {
                                    const transactions = await getOneOffTransactions({ donor_id: donorId });
                                    setTransactionsData(transactions);
                                } catch (error) {
                                    console.error('Error loading transactions:', error);
                                }
                
                                try {
                                    const directDebit = await getDirectDebit({ donor_id: donorId });
                                    setDirectDebitData(directDebit);
                                } catch (error) {
                                    console.error('Error loading direct debit:', error);
                                }
                            };
                
                            loadTransactions();
                        }
                    }, [activeSection, donorId]);

                    useEffect(() => {
                        if (addressFormData.country) {
                            setIsLoadingCities(true);
                            fetchCities(addressFormData.country)
                                .then(data => {
                                    setCities(data.data);
                                    setIsLoadingCities(false);
                                })
                                .catch(() => setIsLoadingCities(false));
                        }
                    }, [addressFormData.country]);

    // useEffect(() => {
    //     if (donorInfo?.data) {
    //         setProfileData({
    //             title: donorInfo.data.title || 'Mr',
    //             firstName: donorInfo.data.first_name || user?.first_name || '',
    //             lastName: donorInfo.data.last_name || user?.last_name || '',
    //             email: donorInfo.data.email || userEmail || '',
    //             phone: donorInfo.data.mobile || user?.phone || '',
    //         });
    //     }
    // }, [donorInfo, user, userEmail]);

    // Mock API functions - replace with your actual API calls
    // const mockApiCall = (data) => {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             resolve({ success: true, message: 'Operation successful', data });
    //         }, 1000);
    //     });
    // };

    // // const getDonorInfo = async (email) => {
    // //     setIsDataLoading(true);
    // //     try {
    // //         // Mock API call
    // //         const response = await mockApiCall({
    // //             title: 'Mr',
    // //             first_name: 'John',
    // //             last_name: 'Doe',
    // //             email: email,
    // //             mobile: '+44 123 456 789'
    // //         });
    // //         setDonorInfo(response);
    // //     } catch (error) {
    // //         console.error('Failed to fetch donor info:', error);
    // //     } finally {
    // //         setIsDataLoading(false);
    // //     }
    // // };

    // const getDonorAddress = async (donorId) => {
    //     try {
    //         // Mock API call
    //         const response = await mockApiCall({
    //             address1: '123 Main Street',
    //             address2: 'Apartment 4B',
    //             city_name: 'London',
    //             post_code: 'SW1A 1AA',
    //             country_name: 'United Kingdom'
    //         });
    //         setAddressData(response);
    //     } catch (error) {
    //         console.error('Failed to fetch address:', error);
    //     }
    // };

    // const getOneOffTransactions = async (data) => {
    //     try {
    //         // Mock API call
    //         const response = await mockApiCall([
    //             {
    //                 donation_detail_id: '1',
    //                 program_name: 'Water Well Project',
    //                 country_name: 'Bangladesh',
    //                 donation_amount: '100.00',
    //                 donation_date: '2024-01-15'
    //             },
    //             {
    //                 donation_detail_id: '2',
    //                 program_name: 'Education Support',
    //                 country_name: 'Kenya',
    //                 donation_amount: '50.00',
    //                 donation_date: '2024-01-10'
    //             }
    //         ]);
    //         setTransactionsData(response);
    //     } catch (error) {
    //         console.error('Failed to fetch transactions:', error);
    //     }
    // };

    // const getDirectDebit = async (data) => {
    //     try {
    //         // Mock API call
    //         const response = await mockApiCall([
    //             {
    //                 donation_detail_id: '3',
    //                 program_name: 'Monthly Sponsorship',
    //                 country_name: 'Somalia',
    //                 donation_amount: '25.00',
    //                 donation_date: '2024-01-01'
    //             }
    //         ]);
    //         setDirectDebitData(response);
    //     } catch (error) {
    //         console.error('Failed to fetch direct debits:', error);
    //     }
    // };

    // const fetchCountriesList = async () => {
    //     try {
    //         // Mock countries data
    //         const countries = [
    //             { country_id: '1', country_name: 'United Kingdom' },
    //             { country_id: '2', country_name: 'United States' },
    //             { country_id: '3', country_name: 'Canada' },
    //             { country_id: '4', country_name: 'Australia' }
    //         ];
    //         setCountries(countries);
    //     } catch (error) {
    //         console.error('Failed to fetch countries:', error);
    //     }
    // };

    // const fetchCities = async (countryId) => {
    //     setIsLoadingCities(true);
    //     try {
    //         // Mock cities data
    //         const cities = [
    //             { city_id: '1', city_name: 'London' },
    //             { city_id: '2', city_name: 'Manchester' },
    //             { city_id: '3', city_name: 'Birmingham' },
    //             { city_id: '4', city_name: 'Liverpool' }
    //         ];
    //         setCities(cities);
    //     } catch (error) {
    //         console.error('Failed to fetch cities:', error);
    //     } finally {
    //         setIsLoadingCities(false);
    //     }
    // };

    // // Initialize data on component mount
    // useEffect(() => {
    //     if (userEmail) {
    //         getDonorInfo(userEmail);
    //     }
    //     if (donorId) {
    //         getDonorAddress(donorId);
    //     }
    //     fetchCountriesList();
    // }, [userEmail, donorId]);

    // // Load transaction data when donations section is active
    // useEffect(() => {
    //     if (activeSection === 'donations' && donorId) {
    //         getOneOffTransactions({ donor_id: donorId });
    //     }
    // }, [activeSection, donorId]);

    // // Load direct debit data when debits section is active
    // useEffect(() => {
    //     if (activeSection === 'debits' && donorId) {
    //         getDirectDebit({ donor_id: donorId });
    //     }
    // }, [activeSection, donorId]);

    // // Update profile data when donor info is loaded
    // useEffect(() => {
    //     if (donorInfo?.data) {
    //         setProfileData({
    //             title: donorInfo.data.title || 'Mr',
    //             firstName: donorInfo.data.first_name || user?.first_name || '',
    //             lastName: donorInfo.data.last_name || user?.last_name || '',
    //             email: donorInfo.data.email || userEmail || '',
    //             phone: donorInfo.data.mobile || user?.phone || '',
    //         });
    //     }
    // }, [donorInfo, user, userEmail]);

    // // Fetch cities when country changes
    // useEffect(() => {
    //     if (addressFormData.country) {
    //         fetchCities(addressFormData.country);
    //     }
    // }, [addressFormData.country]);



    const validateField = (name, value) => {
        if (!value || value.trim() === "") {
            return "This field is required";
        }

        switch (name) {
            case "postcode":
                if (addressFormData.country === "1") { // UK
                    const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
                    if (!ukPostcodeRegex.test(value)) {
                        return "Please enter a valid UK postcode";
                    }
                }
                break;
        }
        return "";
    };

    const showToast = (message, type = 'success') => {
        // Mock toast function - replace with your preferred toast library
        alert(`${type.toUpperCase()}: ${message}`);
    };

    const handleAddressInputChange = (e) => {
        const { name, value } = e.target;
        setAddressFormData(prev => ({
            ...prev,
            [name]: value,
            donor_id: donorId
        }));

        // Validate on change if field has been touched
        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const getFieldError = (name) => {
        return touched[name] && errors[name];
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updateData = {
                donor_id: donorId,
                title: profileData.title,
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                phone: profileData.phone
            };

            await updateDonor(updateData);
            showToast('Profile updated successfully');
            // Refresh donor info
            await getDonorInfo(userEmail);
        } catch (error) {
            showToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        // Validate password length
        if (passwordData.newPassword.length < 8) {
            showToast('Password must be at least 8 characters long', 'error');
            return;
        }

        setLoading(true);

        try {
            const updateData = {
                donor_id: donorId,
                password: passwordData.newPassword
            };

            await updateDonorPassword(updateData);
            showToast('Password updated successfully');
            // Reset password fields
            setPasswordData({
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            showToast('Failed to update password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        const requiredFields = ['address1', 'city_id', 'post_code', 'country'];
        const validationErrors = {};

        requiredFields.forEach(field => {
            if (!addressFormData[field]) {
                validationErrors[field] = 'This field is required';
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const response = await addNewAddress({
                ...addressFormData,
                donor_id: donorId
            });

            if (response.success) {
                showToast('Address added successfully');
                setShowAddressForm(false);
                await getDonorAddress(donorId); // Refresh address data
                // Reset form
                setAddressFormData({
                    address1: '',
                    address2: '',
                    city_id: '',
                    post_code: '',
                    donor_id: '',
                    country: ''
                });
                setErrors({});
                setTouched({});
                setDisable(false);
            } else {
                showToast(response.message || 'Failed to add address', 'error');
            }
        } catch (error) {
            showToast(error.message || 'Failed to add address', 'error');
        }
    };

    const handleLogout = () => {
        // Mock logout function - replace with your auth logic
        if (confirm('Are you sure you want to logout?')) {
            // For Astro, you might want to redirect to login page
            window.location.href = '/login';
        }
    };

    const navigateToHome = () => {
        // For Astro routing, use window.location or your preferred routing method
        window.location.href = '/';
    };

    const menuItems = [
        { id: 'profile', label: 'Profile details', icon: User },
        { id: 'password', label: 'Change Password', icon: Lock },
        { id: 'address', label: 'Your Address', icon: MapPin },
        { id: 'donations', label: 'My Donations', icon: Heart },
        { id: 'debits', label: 'My Direct Debits', icon: CreditCard },
    ];

    const handleSelectAddress = (address) => {
        // Find matching city by post_town
        const matchedCity = cities.find(
            (city) => city.city_name.toLowerCase() === (address.post_town || "").toLowerCase()
        );

        setAddressFormData(prev => ({
            ...prev,
            address1: address.address1 || "",
            address2: address.address2 || "",
            city_id: matchedCity ? matchedCity.city_id : "",
            post_code: address.postcode || ""
        }));

        setShowPopup(false);
        setDisable(true);

        // Validate fields
        const fieldsToValidate = ['address1', 'city_id', 'post_code'];
        const newErrors = {};
        fieldsToValidate.forEach(field => {
            const error = validateField(field, addressFormData[field]);
            if (error) {
                newErrors[field] = error;
            }
        });

        setErrors(prev => ({
            ...prev,
            ...newErrors
        }));

        setTouched(prev => ({
            ...prev,
            address1: true,
            city_id: true,
            post_code: true
        }));
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-[#333132]">Profile Details</h2>
                            <button
                                onClick={navigateToHome}
                                className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                            >
                                Go to Donation Page
                            </button>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="max-w-3xl">
                            <div className="bg-white rounded-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                    <div>
                                        <label className="block text-[#333132] font-medium mb-2">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="title"
                                            value={profileData.title}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all duration-200"
                                            required
                                        >
                                            <option value="MR">Mr</option>
                                            <option value="MRS">Mrs</option>
                                            <option value="MS">Ms</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[#333132] font-medium mb-2">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={profileData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                            placeholder="Enter your first name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#333132] font-medium mb-2">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={profileData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                            placeholder="Enter your last name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#333132] font-medium mb-2">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                            placeholder="Enter your phone number"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[#333132] font-medium mb-2">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                                            disabled
                                        />
                                        <p className="text-sm text-gray-500 mt-2">Email cannot be changed</p>
                                    </div>
                                </div>
                                <div className="flex justify-end border-t border-gray-100 pt-6 px-6 pb-6">
                                    <button
                                        type="submit"
                                        disabled={loading || isDataLoading}
                                        className={`bg-blue-600 text-white px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center font-medium shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:translate-y-[-1px] active:translate-y-0 ${(loading || isDataLoading) ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : isDataLoading ? (
                                            'Loading...'
                                        ) : (
                                            'UPDATE YOUR INFORMATION'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                );
            case 'password':
                return (
                    <div className="p-6">
                        <h2 className="text-3xl font-semibold text-[#333132] mb-6">Change Password</h2>
                        <form onSubmit={handlePasswordUpdate} className="max-w-md">
                            <div className="mb-4">
                                <label className="block text-[#333132] mb-2">New Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    placeholder="New Password"
                                    required
                                    minLength={8}
                                />
                                <p className="text-sm text-[#333132] mt-2">Use at least 8 characters. Don't use a password from another site, or something too obvious like your pet's name.</p>
                            </div>
                            <div className="mb-6">
                                <label className="block text-[#333132] mb-2">Confirm Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    placeholder="Confirm Password"
                                    required
                                    minLength={8}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 transition-colors flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating Password...
                                    </>
                                ) : (
                                    'CHANGE PASSWORD'
                                )}
                            </button>
                        </form>
                    </div>
                );
            case 'address':
                return (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-semibold text-[#333132] mb-2">Address</h2>
                                <p className="text-gray-500">Manage your addresses for donations</p>
                            </div>
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20 hover:translate-y-[-1px] active:translate-y-0 flex items-center"
                            >
                                <span className="mr-2">+</span> Add New Address
                            </button>
                        </div>

                        {addressData?.data ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group bg-white border-2 border-blue-600 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/10">
                                    <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="w-2 h-2 bg-white animate-pulse rounded-full mr-2"></span>
                                            <span className="text-sm font-medium">Active Address</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="space-y-1.5 text-[#333132]">
                                            <p className="font-medium">{addressData.data.address1}</p>
                                            {addressData.data.address2 && (
                                                <p className="text-gray-600">{addressData.data.address2}</p>
                                            )}
                                            <p className="text-gray-600">{addressData.data.city_name}</p>
                                            <p className="text-gray-600">{addressData.data.post_code}</p>
                                            <p className="text-gray-600">{addressData.data.country_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No address found. Add a new address to get started.</p>
                            </div>
                        )}

                        <AddressFinder
                            show={showPopup}
                            onClose={() => setShowPopup(false)}
                            postcode={addressFormData.post_code}
                            onSelect={handleSelectAddress}
                            setDisable={setDisable}
                        />
                    </div>
                );
            case 'donations':
                return (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-semibold text-[#333132]">My Donations</h2>
                        </div>

                        {transactionsData?.data?.length > 0 ? (
                            <div className="space-y-4">
                                {transactionsData.data.map((transaction) => (
                                    <div key={transaction.donation_detail_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-[#333132]">{transaction.program_name}</h3>
                                                <p className="text-gray-600">{transaction.country_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-blue-600">£{transaction.donation_amount}</p>
                                                <p className="text-sm text-gray-500">{new Date(transaction.donation_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-center text-[#333132] uppercase mb-4">YOU DON'T HAVE ANY DONATIONS.</p>
                                <h3 className="text-2xl text-[#333132] mb-4">Become a sponsor</h3>
                                <button 
                                    onClick={navigateToHome}
                                    className="bg-white text-[#333132] px-8 py-3 rounded border border-gray-200 hover:border-blue-600 transition-colors"
                                >
                                    MAKE A DONATION
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'debits':
                return (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-semibold text-[#333132]">My Direct Debits</h2>
                        </div>

                        {directDebitData?.data?.length > 0 ? (
                            <div className="space-y-4">
                                {directDebitData.data.map((transaction) => (
                                    <div key={transaction.donation_detail_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-[#333132]">{transaction.program_name}</h3>
                                                <p className="text-gray-600">{transaction.country_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-blue-600">£{transaction.donation_amount}</p>
                                                <p className="text-sm text-gray-500">{new Date(transaction.donation_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-center text-[#333132] uppercase mb-4">YOU DON'T HAVE ANY DIRECT DEBITS.</p>
                                <h3 className="text-2xl text-[#333132] mb-4">Become a sponsor</h3>
                                <button 
                                    onClick={navigateToHome}
                                    className="bg-white text-[#333132] px-8 py-3 rounded border border-gray-200 hover:border-blue-600 transition-colors"
                                >
                                    MAKE A DONATION
                                </button>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center space-x-2 py-4 text-sm">
                        <button onClick={navigateToHome} className="text-gray-500 hover:text-blue-600 transition-colors">Home</button>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-[#333132] font-medium">Profile</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="md:w-1/4">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white">
                                <div className="flex flex-col items-center">
                                    <div className="w-28 h-28 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 ring-4 ring-white/20 shadow-xl">
                                        <User className="w-14 h-14 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-semibold">{donorInfo?.data?.first_name || user?.first_name || 'Loading...'}</h2>
                                    <p className="text-white/90 text-sm mt-2">{donorInfo?.data?.email || user?.email}</p>
                                </div>
                            </div>
                            <nav className="p-4">
                                <ul className="space-y-2">
                                    {menuItems.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => setActiveSection(item.id)}
                                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${activeSection === item.id
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-y-[-1px]'
                                                    : 'text-[#333132] hover:bg-gray-50 hover:translate-y-[-1px]'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 ${activeSection === item.id ? 'scale-110' : ''}`} />
                                                    <span className="font-medium">{item.label}</span>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                    <li className="pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-3.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                                        >
                                            <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:rotate-12" />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:w-3/4">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Address Form Modal */}
            {showAddressForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-xl transform transition-all duration-300">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-medium">Add New Address</h3>
                            <button
                                onClick={() => {
                                    setShowAddressForm(false);
                                    setAddressFormData({
                                        address1: '',
                                        address2: '',
                                        city_id: '',
                                        post_code: '',
                                        donor_id: '',
                                        country: ''
                                    });
                                    setErrors({});
                                    setTouched({});
                                    setDisable(false);
                                }}
                                className="text-white/80 hover:text-white transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddressSubmit} className="p-6">
                            <div className="grid grid-cols-1 gap-4 mb-6">
                                {/* Country Selection */}
                                <div>
                                    <label className="block text-[#333132] text-sm mb-2">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="country"
                                        value={addressFormData.country}
                                        onChange={handleAddressInputChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${getFieldError("country") ? "border-red-500" : ""}`}
                                        required
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(({ country_id, country_name }) => (
                                            <option key={country_id} value={country_id}>{country_name}</option>
                                        ))}
                                    </select>
                                    {getFieldError("country") && (
                                        <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                                    )}
                                </div>

                                {/* Postcode and City */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[#333132] text-sm mb-2">
                                            Postal Code <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="post_code"
                                                value={addressFormData.post_code}
                                                onChange={handleAddressInputChange}
                                                onBlur={handleBlur}
                                                className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${getFieldError("post_code") ? "border-red-500" : ""}`}
                                                placeholder="Enter postal code"
                                                required
                                            />
                                            {addressFormData.country === "1" && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPopup(true)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    Find
                                                </button>
                                            )}
                                        </div>
                                        {getFieldError("post_code") && (
                                            <p className="mt-1 text-sm text-red-600">{errors.post_code}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[#333132] text-sm mb-2">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        {disable ? (
                                            <input
                                                type="text"
                                                name="city_id"
                                                value={addressFormData.city_id}
                                                onChange={handleAddressInputChange}
                                                onBlur={handleBlur}
                                                disabled={disable}
                                                className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${getFieldError("city_id") ? "border-red-500" : ""}`}
                                                required
                                            />
                                        ) : (
                                            <select
                                                name="city_id"
                                                value={addressFormData.city_id}
                                                onChange={handleAddressInputChange}
                                                onBlur={handleBlur}
                                                disabled={isLoadingCities}
                                                className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${getFieldError("city_id") ? "border-red-500" : ""}`}
                                                required
                                            >
                                                <option value="">Select City</option>
                                                {cities.map(city => (
                                                    <option key={city.city_id} value={city.city_id}>
                                                        {city.city_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {getFieldError("city_id") && (
                                            <p className="mt-1 text-sm text-red-600">{errors.city_id}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address Lines */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[#333132] text-sm mb-2">
                                            Address Line 1 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="address1"
                                            value={addressFormData.address1}
                                            onChange={handleAddressInputChange}
                                            onBlur={handleBlur}
                                            disabled={disable}
                                            className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 ${getFieldError("address1") ? "border-red-500" : ""}`}
                                            placeholder="Street address or P.O. box"
                                            required
                                        />
                                        {getFieldError("address1") && (
                                            <p className="mt-1 text-sm text-red-600">{errors.address1}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[#333132] text-sm mb-2">
                                            Address Line 2
                                        </label>
                                        <input
                                            type="text"
                                            name="address2"
                                            value={addressFormData.address2}
                                            onChange={handleAddressInputChange}
                                            disabled={disable}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                                            placeholder="Apartment, suite, unit, building, floor, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddressForm(false);
                                        setAddressFormData({
                                            address1: '',
                                            address2: '',
                                            city_id: '',
                                            post_code: '',
                                            donor_id: '',
                                            country: ''
                                        });
                                        setErrors({});
                                        setTouched({});
                                        setDisable(false);
                                    }}
                                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-[#333132] hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20 hover:translate-y-[-1px] active:translate-y-0 flex items-center"
                                >
                                    Save Address
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
