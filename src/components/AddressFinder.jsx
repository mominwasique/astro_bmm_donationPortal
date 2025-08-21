import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getPafData } from '../api/paf';

const AddressFinder = ({ show, onClose, postcode, onSelect, setDisable }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (show && postcode) {
            fetchAddresses();
        }
    }, [show, postcode]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const data = await getPafData(postcode);

            if (Array.isArray(data)) {
                setAddresses(data);
            } else {
                toast.error('Invalid data format received');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    // Filter addresses based on search term
    const filteredAddresses = addresses.filter((address) => {
        const fullAddress = `${address.address1 || ""} ${address.address2 || ""} ${address.post_town || ""} ${address.postcode || ""}`.toLowerCase();
        return fullAddress.includes(searchTerm.toLowerCase());
    });

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setDisable(true);
        onSelect(address);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[59990]">
            <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-xl transform transition-all duration-300">
                <div className="bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium">Find Your Address</h3>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postcode
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={postcode}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                disabled
                            />
                            <button
                                onClick={fetchAddresses}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search address..."
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredAddresses.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredAddresses.map((address, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAddressSelect(address)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${selectedAddress === address
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                                        }`}
                                >
                                    <p className="font-medium text-gray-900">{address.address1}</p>
                                    {address.address2 && (
                                        <p className="text-gray-600">{address.address2}</p>
                                    )}
                                    <p className="text-gray-600">{address.post_town}</p>
                                    <p className="text-gray-600">{address.postcode}</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No addresses found for this postcode</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-4 border-t border-gray-100 pt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressFinder; 