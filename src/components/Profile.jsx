import React, { useState, useEffect } from 'react';
import { User, Lock, MapPin, Heart, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getDonorInfo, updateDonor, updateDonorPassword, addNewAddress, getDonorAddress, getOneOffTransactions, getDirectDebit } from '../api/donationApi';
import { fetchCities } from '../api/citiesApi';
import { fetchCountriesList } from '../api/countiesApi';
import AddressFinder from './AddressFinder';

const Profile = () => {
    const { user, logout } = useAuth();
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

    const [cities, setCities] = useState([]);
    const [countries, setCountries] = useState([]);
    const [donorInfo, setDonorInfo] = useState(null);
    const [addressData, setAddressData] = useState(null);
    const [transactionsData, setTransactionsData] = useState(null);
    const [directDebitData, setDirectDebitData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const userEmail = user?.user_email || JSON.parse(localStorage.getItem('user'))?.user_email;
    const donorId = user?.user_id || JSON.parse(localStorage.getItem('user'))?.user_id;

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
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

    const validateField = (name, value) => {
        switch (name) {
            case 'email':
                return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address';
            case 'phone':
                return value && value.length >= 10 ? '' : 'Please enter a valid phone number';
            case 'post_code':
                return value && value.length >= 5 ? '' : 'Please enter a valid post code';
            default:
                return value ? '' : 'This field is required';
        }
    };

    const handleAddressInputChange = (e) => {
        const { name, value } = e.target;
        setAddressFormData(prev => ({
            ...prev,
            [name]: value
        }));

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
            await updateDonor(donorInfo);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDonorInfo(prev => ({
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
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await updateDonorPassword({
                donor_id: donorId,
                new_password: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addNewAddress({
                ...addressFormData,
                donor_id: donorId
            });
            toast.success('Address added successfully');
            setShowAddressForm(false);
            setAddressFormData({
                address1: '',
                address2: '',
                city_id: '',
                post_code: '',
                donor_id: '',
                country: ''
            });

            // Reload address data
            const address = await getDonorAddress(donorId);
            setAddressData(address);
        } catch (error) {
            toast.error(error.message || 'Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAddress = (address) => {
        setAddressFormData({
            address1: address.line_1 || '',
            address2: address.line_2 || '',
            city_id: address.city || '',
            post_code: address.postcode || '',
            donor_id: donorId,
            country: address.country || ''
        });
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Personal Information</h2>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={donorInfo?.first_name || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={donorInfo?.last_name || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={donorInfo?.email || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={donorInfo?.phone || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>

                    </div>
                );

            case 'password':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Change Password</h2>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                );

            case 'address':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Addresses</h2>
                            <button
                                onClick={() => setShowAddressForm(!showAddressForm)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                {showAddressForm ? 'Cancel' : 'Add Address'}
                            </button>
                        </div>

                        {showAddressForm && (
                            <form onSubmit={handleAddressSubmit} className="space-y-4 p-4 border rounded-md">
                                <AddressFinder onSelectAddress={handleSelectAddress} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                        <input
                                            type="text"
                                            name="address1"
                                            value={addressFormData.address1}
                                            onChange={handleAddressInputChange}
                                            onBlur={handleBlur}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {getFieldError('address1') && (
                                            <p className="text-red-500 text-sm mt-1">{getFieldError('address1')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                                        <input
                                            type="text"
                                            name="address2"
                                            value={addressFormData.address2}
                                            onChange={handleAddressInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <input
                                            type="text"
                                            name="city_id"
                                            value={addressFormData.city_id}
                                            onChange={handleAddressInputChange}
                                            onBlur={handleBlur}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {getFieldError('city_id') && (
                                            <p className="text-red-500 text-sm mt-1">{getFieldError('city_id')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Post Code</label>
                                        <input
                                            type="text"
                                            name="post_code"
                                            value={addressFormData.post_code}
                                            onChange={handleAddressInputChange}
                                            onBlur={handleBlur}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {getFieldError('post_code') && (
                                            <p className="text-red-500 text-sm mt-1">{getFieldError('post_code')}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add Address'}
                                </button>
                            </form>
                        )}

                        {addressData && addressData.length > 0 && (
                            <div className="space-y-4">
                                {addressData.map((address, index) => (
                                    <div key={index} className="p-4 border rounded-md">
                                        <p className="font-medium">{address.address1}</p>
                                        {address.address2 && <p>{address.address2}</p>}
                                        <p>{address.city}, {address.post_code}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'donations':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Donation History</h2>

                        {transactionsData && transactionsData.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium mb-4">One-off Donations</h3>
                                <div className="space-y-2">
                                    {transactionsData.map((transaction, index) => (
                                        <div key={index} className="p-4 border rounded-md">
                                            <p className="font-medium">£{transaction.amount}</p>
                                            <p className="text-sm text-gray-600">{transaction.created_at}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {directDebitData && directDebitData.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium mb-4">Direct Debit</h3>
                                <div className="space-y-2">
                                    {directDebitData.map((debit, index) => (
                                        <div key={index} className="p-4 border rounded-md">
                                            <p className="font-medium">£{debit.amount} per {debit.frequency}</p>
                                            <p className="text-sm text-gray-600">Next payment: {debit.next_payment_date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6">
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveSection('profile')}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left ${activeSection === 'profile' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <User className="w-5 h-5" />
                                    <span>Profile</span>
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                </button>

                                <button
                                    onClick={() => setActiveSection('password')}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left ${activeSection === 'password' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Lock className="w-5 h-5" />
                                    <span>Password</span>
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                </button>

                                <button
                                    onClick={() => setActiveSection('address')}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left ${activeSection === 'address' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <MapPin className="w-5 h-5" />
                                    <span>Addresses</span>
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                </button>

                                <button
                                    onClick={() => setActiveSection('donations')}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left ${activeSection === 'donations' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Heart className="w-5 h-5" />
                                    <span>Donations</span>
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-red-700 hover:bg-red-100"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        <div className="bg-white rounded-lg shadow p-6">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
