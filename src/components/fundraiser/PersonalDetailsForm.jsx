import React, { useEffect, useState } from "react";
import { fetchCities } from "../../api/citiesApi.js";
import { fetchCountriesList } from "../../api/countiesApi";
import { getDonorAddress, getDonorInfo } from "../../api/donationApi";
import { useAuth } from "../../context/AuthContext";
import { FindAddressPopup } from "../CheckoutPage/FindAddressPopup";

const PersonalDetailsForm = ({ addressData }) => {
    const { user, isAuthenticated } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [disable, setDisable] = useState(false);
    const [cities, setCities] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [countries, setCountries] = useState([]);
    const [donorInfo, setDonorInfo] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        displayName: "DEMO@gmail.com",
        email: "DEMO@gmail.com",
        password: "************",
        phone: "+44 07400 123456",
        address1: "",
        address2: "",
        city: "",
        city_id: "",
        county: "",
        postcode: "",
        country: "",
        address_id: null
    });

    // Get user email from localStorage if not available in auth context
    const userEmail = user?.user_email || JSON.parse(localStorage.getItem('user'))?.user_email;

    // Fetch countries list
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const result = await fetchCountriesList();
                setCountries(result);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        fetchCountries();
    }, []);

    // Fetch donor info if user is authenticated
    useEffect(() => {
        const fetchDonorInfo = async () => {
            if (userEmail) {
                try {
                    const result = await getDonorInfo(userEmail);
                    setDonorInfo(result);
                } catch (error) {
                    console.error('Error fetching donor info:', error);
                }
            }
        };

        fetchDonorInfo();
    }, [userEmail]);

    // Initialize form with user data if authenticated
    useEffect(() => {
        if (donorInfo?.data) {
            setFormData((prev) => ({
                ...prev,
                firstName: donorInfo.data.first_name || "",
                lastName: donorInfo.data.last_name || "",
                email: donorInfo.data.email || "",
                phone: donorInfo.data.mobile || "",
            }));
        }
    }, [donorInfo]);

    // Initialize address if authenticated
    useEffect(() => {
        if (addressData?.data) {
            setFormData((prev) => ({
                ...prev,
                address1: addressData.data.address1 || "",
                address2: addressData.data.address2 || "",
                city_id: addressData.data.city_id || "",
                city: addressData.data.city_id || "",
                postcode: addressData.data.post_code || "",
                country: addressData.data.country_id?.toString() || "",
                address_id: addressData.data.address_id || null,
            }));
        }
    }, [addressData]);

    // Fetch cities when country changes
    useEffect(() => {
        if (formData.country) {
            setIsLoadingCities(true);
            fetchCities(formData.country)
                .then(data => {
                    setCities(data.data);
                    setIsLoadingCities(false);
                })
                .catch(() => setIsLoadingCities(false));
        }
    }, [formData.country]);

    // Initialize default country if not set and countries are available
    useEffect(() => {
        if (!formData.country && countries.length > 0) {
            setFormData((prev) => ({
                ...prev,
                country: countries[0].country_id.toString(),
            }));
        }
    }, [countries, formData.country]);

    const validateField = (name, value) => {
        if (!value || value.trim() === "") {
            return "This field is required";
        }

        switch (name) {
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return "Please enter a valid email address";
                }
                break;
            case "phone":
                const phoneRegex = /^[\d\s+()-]{10,}$/;
                if (!phoneRegex.test(value)) {
                    return "Please enter a valid phone number";
                }
                break;
            case "postcode":
                if (formData.country === "1") { // UK
                    const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
                    if (!ukPostcodeRegex.test(value)) {
                        return "Please enter a valid UK postcode";
                    }
                }
                break;
        }
        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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

    const handleSelectAddress = (address) => {
        // Find matching city by post_town
        const matchedCity = cities.find(
            (city) => city.city_name.toLowerCase() == (address.post_town || "").toLowerCase()
        );
        if (!matchedCity) {
            console.warn(`No city found matching post town: ${address.post_town}`);
        }

        setFormData((prev) => ({
            ...prev,
            address1: address.address1 || "",
            address2: address.address2 || "",
            city: address.post_town || "",
            city_id: matchedCity ? matchedCity.city_id : null,
            postcode: address.postcode || "",
        }));

        setShowPopup(false);
        setDisable(true);

        // Validate address field
        const error = validateField("address1", address.address1);
        setErrors(prev => ({
            ...prev,
            address1: error
        }));
        setTouched(prev => ({
            ...prev,
            address1: true
        }));
    };

    const getFieldError = (name) => {
        return touched[name] && errors[name];
    };

    const formFields = [
        { label: "First Name", name: "firstName", type: "text", required: true },
        { label: "Last Name", name: "lastName", type: "text", required: true },
        { label: "Display Name", name: "displayName", type: "text", required: true, value: "ayaz@tnxn.agency" },
        { label: "Email Address", name: "email", type: "email", value: "ayaz@tnxn.agency" },
        { label: "Password", name: "password", type: "password", value: "************", extra: <a href="#" className="ml-2 text-sm text-gray-600 underline">Change Password</a> },
        { label: "Phone Number", name: "phone", type: "tel", value: "+44 07400 123456", prefix: <span className="inline-flex items-center px-2 border-r bg-gray-50 text-gray-500">🇬🇧 +44</span> },
    ];

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mx-auto">
            <h1 className="text-2xl font-bold mb-2 text-primary/90">Your Details</h1>
            <p className="mb-4 text-gray-600 text-base">Manage your account and personal details.</p>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                {/* Personal Information Fields */}
                {formFields.map((field) => (
                    <div key={field.name} className="mb-0 col-span-1">
                        <label className="block text-gray-700 mb-1 font-medium text-sm">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="flex items-center">
                            {field.prefix && (
                                <span className="rounded-l border border-r-0 border-gray-200 bg-gray-50 px-2 py-2 text-gray-500 text-xs">
                                    {field.prefix}
                                </span>
                            )}
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name] || field.value || ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-3 py-2 border rounded text-sm ${field.prefix ? "rounded-l-none" : ""} ${getFieldError(field.name)
                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-200 focus:ring-primary/50 focus:border-primary/50"
                                    } ${field.name === "email" ? "bg-gray-50" : "bg-white"}`}
                                placeholder={field.label}
                                disabled={field.name === "email"}
                            />
                            {field.extra && field.extra}
                        </div>
                        {getFieldError(field.name) && (
                            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                        )}
                    </div>
                ))}

                {/* Address Section */}
                <div className="col-span-1 md:col-span-2">
                    <h2 className="text-lg font-semibold mt-6 mb-3 text-primary/90">Address Details</h2>
                </div>

                {/* Country Selection */}
                <div className="col-span-1 md:col-span-2 mb-3">
                    <label className="block text-gray-700 mb-1 font-medium text-sm">
                        Country <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                        name="country"
                        value={formData.country || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 border rounded text-sm appearance-none cursor-pointer ${getFieldError("country")
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-200 focus:ring-primary/50 focus:border-primary/50"
                            }`}
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

                {/* Postcode & City */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium text-sm">
                            Postcode <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="postcode"
                                value={formData.postcode || ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-3 py-2 border rounded text-sm ${getFieldError("postcode")
                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-200 focus:ring-primary/50 focus:border-primary/50"
                                    }`}
                                placeholder="Enter postcode"
                            />
                            {formData.country === "1" && (
                                <button
                                    type="button"
                                    onClick={() => setShowPopup(true)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm bg-primary/90 text-white px-3 py-1 rounded hover:bg-primary transition-colors"
                                >
                                    Find
                                </button>
                            )}
                        </div>
                        {getFieldError("postcode") && (
                            <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1 font-medium text-sm">
                            City <span className="text-red-500 ml-1">*</span>
                        </label>
                        {disable ? (
                            <input
                                type="text"
                                name="city"
                                value={formData.city || ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={disable}
                                className={`w-full px-3 py-2 border rounded text-sm ${getFieldError("city")
                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-200 focus:ring-primary/50 focus:border-primary/50"
                                    } ${disable ? "bg-gray-50 cursor-not-allowed" : ""}`}
                                placeholder="Enter city"
                            />
                        ) : (
                            <select
                                name="city_id"
                                value={formData.city_id || ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isLoadingCities}
                                className={`w-full px-3 py-2 border rounded text-sm ${getFieldError("city")
                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-200 focus:ring-primary/50 focus:border-primary/50"
                                    } ${isLoadingCities ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            >
                                <option value="">Select City</option>
                                {cities.map(city => (
                                    <option key={city.city_id} value={city.city_id}>
                                        {city.city_name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {getFieldError("city") && (
                            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                        )}
                    </div>
                </div>

                {/* Address Lines */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium text-sm">
                            Address Line 1 <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            name="address1"
                            value={formData.address1 || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={disable}
                            className={`w-full px-3 py-2 border rounded text-sm ${getFieldError("address1")
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-200 focus:ring-primary/50 focus:border-primary/50"
                                } ${disable ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            placeholder="Enter address line 1"
                        />
                        {getFieldError("address1") && (
                            <p className="mt-1 text-sm text-red-600">{errors.address1}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1 font-medium text-sm">
                            Address Line 2
                        </label>
                        <input
                            type="text"
                            name="address2"
                            value={formData.address2 || ""}
                            onChange={handleChange}
                            disabled={disable}
                            className={`w-full px-3 py-2 border rounded text-sm border-gray-200 focus:ring-primary/50 focus:border-primary/50 ${disable ? "bg-gray-50 cursor-not-allowed" : ""
                                }`}
                            placeholder="Enter address line 2"
                        />
                    </div>
                </div>


                {/* Action Buttons */}
                <div className="col-span-1 md:col-span-2 flex justify-end space-x-2 pt-4">
                    <button type="button" className="px-5 py-2 rounded bg-red-600 text-white font-bold text-sm hover:bg-red-500">
                        CANCEL
                    </button>
                    <button type="submit" className="px-5 py-2 rounded bg-primary text-white font-bold text-sm hover:bg-primary/90">
                        SAVE CHANGES
                    </button>
                </div>
            </form>

            {/* Find Address Popup Component */}
            {formData.country === "1" && (
                <FindAddressPopup
                    show={showPopup}
                    setDonation={(updater) => {
                        if (typeof updater === 'function') {
                            setFormData(prev => ({
                                ...prev,
                                personalInfo: updater({ personalInfo: prev })
                            }));
                        }
                    }}
                    cities={cities}
                    postcode={formData.postcode}
                    onSelect={handleSelectAddress}
                    donation={{ personalInfo: formData }}
                    onClose={() => setShowPopup(false)}
                    disable={disable}
                    setDisable={setDisable}
                />
            )}
        </div>
    );
};

export default PersonalDetailsForm; 