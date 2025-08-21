import { useEffect, useState } from "react";
import { fetchCities } from "../../api/citiesApi.js";
import { getDonorAddress, getDonorInfo } from "../../api/donationApi";
import { useAuth } from "../../context/AuthContext";
import { titleOptions } from "../../utils/data";
import { FindAddressPopup } from "./FindAddressPopup";
import { formatSortCode } from "../../api/cartApi.js";

const PersonalInfo = ({ donation, setDonation, countries, paymentGateway, setPaymentGateway, submitted, addressData }) => {
  const { user, isAuthenticated } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [disable, setDisable] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [donorInfo, setDonorInfo] = useState(null);

  // Get user email and donor ID from localStorage if not available in auth context
  const userEmail = user?.user_email || JSON.parse(localStorage.getItem('user'))?.user_email;

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

  console.log(donation.personalInfo, "donorInfo");

  const cartData = JSON.parse(localStorage.getItem('cart'));


  // Fetch donor address if user is authenticated


  // Initialize form with user data if authenticated
  useEffect(() => {
    if (donorInfo?.data && !submitted) {
      setDonation((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          title: donorInfo.data.title || "Mr",
          firstName: donorInfo.data.first_name || "",
          lastName: donorInfo.data.last_name || "",
          email: donorInfo.data.email || "",
          phone: donorInfo.data.mobile || "",
        }
      }));
    }
  }, [donorInfo, setDonation, submitted]);


  // Initialize address if authenticated
  useEffect(() => {
    if (addressData?.data && !submitted) {
      setDonation((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          address1: addressData.data.address1 || "",
          address2: addressData.data.address2 || "",
          city_id: addressData.data.city_id || "",
          city: addressData.data.city_id || "",
          postcode: addressData.data.post_code || "",
          country: addressData.data.country_id?.toString() || "",
          address_id: addressData.data.address_id || null,
        }
      }));
    }
  }, [addressData, setDonation, submitted]);

  useEffect(() => {
    if (donation.personalInfo.country) {
      setIsLoadingCities(true);
      fetchCities(donation.personalInfo.country)
        .then(data => {
          setCities(data.data);
          setIsLoadingCities(false);
        })
        .catch(() => setIsLoadingCities(false));
    }
  }, [donation.personalInfo.country]);



  useEffect(() => {
    if (!donation.paymentMethod) {
      setDonation((prev) => ({ ...prev, paymentMethod: "stripe" }));
    }
    if (!donation.personalInfo.country && countries.length > 0) {
      setDonation((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          country: countries[0].country_id.toString(),
          title: "Mr"
        }
      }));
    }
  }, [donation.paymentMethod, countries, setDonation]);

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
        if (donation.personalInfo.country === "1") { // UK
          const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
          if (!ukPostcodeRegex.test(value)) {
            return "Please enter a valid UK postcode";
          }
        }
        break;
      // case "bank_sort_code":
      //   // Must be in 00-00-00 format
      //   const sortCodeRegex = /^\d{2}-\d{2}-\d{2}$/;
      //   if (!sortCodeRegex.test(value)) {
      //     return "Sort code must be in 00-00-00 format";
      //   }
      //   break;
      case "bank_ac_no":
        // Must be at least 8 digits
        const acNoDigits = value.replace(/\D/g, "");
        if (acNoDigits.length < 8) {
          return "Account number must be at least 8 digits";
        }
        break;
    }
    return "";
  };

  const handleChange = (e) => {
    if (submitted) return;

    const { name, value } = e.target;
    setDonation((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value },
    }));

    // Validate on change if field has been touched
    // if (touched[name]) {
    //   const error = validateField(name, value);
    //   setErrors(prev => ({
    //     ...prev,
    //     [name]: error
    //   }));
    // }
  };

  const handleBlur = (e) => {
    if (submitted) return;

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
    if (submitted) return;

    setDonation((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, address1: address },
    }));
    setShowPopup(false);

    // Validate address field
    const error = validateField("address1", address);
    setErrors(prev => ({
      ...prev,
      address1: error
    }));
    setTouched(prev => ({
      ...prev,
      address1: true
    }));
  };

  const handleSelectPaymentGateway = (gateway) => {
    if (submitted) return;

    setPaymentGateway(gateway);
    setDonation((prev) => ({ ...prev, paymentMethod: gateway }));
  };

  const getFieldError = (name) => {
    return touched[name] && errors[name];
  };

  console.log(donation.personalInfo.title);


  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-secondary">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="text-center sm:text-left">
              <h3 className="text-base font-semibold text-gray-900">Already have an account?</h3>
              <p className="text-sm text-gray-600">Sign in to speed up your donation process</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <a
                href="/login"
                className="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors text-center"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Register
              </a>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-lg font-semibold mb-4 text-black">Personal Details</h2>

      {/* User Information Fields */}
      <div className="grid grid-cols-1 gap-3">
        {/* Name Fields - Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3">
          {/* Title Dropdown */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <select
              name="title"
              value={donation.personalInfo.title.replace(/^\w/, c => c.toUpperCase()) || "Mr"}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted}
              className={`w-full rounded-lg border h-9 px-2 appearance-none cursor-pointer ${getFieldError("title")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">Select Title</option>
              {titleOptions.map((title) => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
            {getFieldError("title") && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* First Name */}
          <div className="col-span-1 md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={donation.personalInfo.firstName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted}
              className={`w-full rounded-lg border h-10 px-3 ${getFieldError("firstName")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="Enter your first name"
            />
            {getFieldError("firstName") && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="col-span-1 md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={donation.personalInfo.lastName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted}
              className={`w-full rounded-lg border h-10 px-3 ${getFieldError("lastName")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="Enter your last name"
            />
            {getFieldError("lastName") && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Contact Fields - Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={donation.personalInfo.email || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted || !!userEmail}
              className={`w-full rounded-lg border h-10 px-3 ${getFieldError("email")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${(submitted || !!userEmail) ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="Enter your email"
            />
            {getFieldError("email") && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
            {!!userEmail && (
              <p className="mt-1 text-sm text-gray-500">Email cannot be changed for logged-in users</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="text"
              name="phone"
              value={donation.personalInfo.phone || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted}
              className={`w-full rounded-lg border h-10 px-3 ${getFieldError("phone")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="Enter your phone"
            />
            {getFieldError("phone") && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>
      {/* Address Section */}
      <h2 className="text-lg font-semibold mt-6 mb-3 text-black">Address Details</h2>
      {/* Country Selection */}
      <div className=" mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
        <select
          name="country"
          value={donation.personalInfo.country || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={submitted}
          className={`w-full rounded-lg border h-9 px-2 appearance-none cursor-pointer ${getFieldError("country")
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-200 focus:ring-black focus:border-black"
            } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
      {/* City & Postcode */}
      <div className="grid grid-cols-1 md:grid-cols-2 mb-3 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Postcode *</label>
          <div className="relative">
            <input
              type="text"
              name="postcode"
              value={donation.personalInfo.postcode || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted}
              className={`w-full rounded-lg border h-9 px-2 ${getFieldError("postcode")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${(submitted) ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {donation.personalInfo.country === "1" && !submitted && (
              <button
                type="button"
                onClick={() => setShowPopup(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm bg-black text-white px-3 py-1 rounded hover:bg-gray-900 transition-colors"
              >
                Find
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          {disable ? (
            <input
              type="text"
              name="city"
              value={donation.personalInfo.city || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted || disable}
              className={`w-full rounded-lg border h-9 px-2 ${getFieldError("city")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${(submitted || disable) ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          ) : (
            <select
              name="city_id"
              value={donation.personalInfo.city_id || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted || isLoadingCities}
              className={`w-full rounded-lg border h-9 px-2 ${getFieldError("city")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${(submitted || isLoadingCities) ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city.city_id} value={city.city_id}>
                  {city.city_name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-1 gap-2">
        {/* Address Line 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
            <input
              type="text"
              name="address1"
              value={donation.personalInfo.address1 || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted || disable}
              className={`w-full rounded-lg border h-9 px-2 ${getFieldError("address1")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${(submitted || disable) ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input
              type="text"
              name="address2"
              value={donation.personalInfo.address2 || ""}
              onChange={handleChange}
              disabled={submitted || disable}
              className={`
                ck ${(submitted || disable) ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Bank Details Section */}
      {cartData?.some(item => item.donation_period === "direct-debit") && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3 text-black">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            {/* Bank Sort Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Sort Code *</label>
              <input
                type="text"
                name="bank_sort_code"
                value={formatSortCode(donation.personalInfo.bank_sort_code) || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={submitted}
                maxLength={6}
                className={`w-full rounded-lg border h-10 px-3 ${getFieldError("bank_sort_code")
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-black focus:border-black"
                  } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="Enter bank sort code"
              />
              {getFieldError("bank_sort_code") && (
                <p className="mt-1 text-sm text-red-600">{errors.bank_sort_code}</p>
              )}
            </div>

            {/* Bank Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number *</label>
              <input
                type="text"
                name="bank_ac_no"
                value={donation.personalInfo.bank_ac_no || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={submitted}
                className={`w-full rounded-lg border h-10 px-3 ${getFieldError("bank_ac_no")
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-black focus:border-black"
                  } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="Enter bank account number"
              />
              {getFieldError("bank_ac_no") && (
                <p className="mt-1 text-sm text-red-600">{errors.bank_ac_no}</p>
              )}
            </div>

            {/* DD Run */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <select
                name="dd_run"
                value={donation.personalInfo.dd_run || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={submitted}
                className={`w-full rounded-lg border h-10 px-3 ${getFieldError("dd_run")
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-black focus:border-black"
                  } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <option value="">Select DD Run</option>
                <option value="1">1st Date</option>
                <option value="8">8th Date</option>
                <option value="15">15th Date</option>
                <option value="25">25th Date</option>
              </select>
              {getFieldError("dd_run") && (
                <p className="mt-1 text-sm text-red-600">{errors.dd_run}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Selection */}
     { cartData?.some(item => item.donation_period === "one-off") && <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Methods</label>
        <div className="flex gap-2">
          {["stripe"].map((gateway) => (
            <div
              key={gateway}
              onClick={() => !submitted && handleSelectPaymentGateway(gateway)}
              className={`border rounded-lg p-2.5 flex items-center gap-1.5 flex-1 ${!submitted ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed"
                } transition-all ${donation.paymentMethod === gateway
                  ? "border-black ring-1 ring-black bg-gray-50"
                  : "border-gray-200"
                } ${submitted ? "opacity-75" : ""}`}
            >
              <img src={gateway === "stripe" ? "/stripe.png" : "/paypal.png"} className="h-4 w-4" alt="" />
              <span className="font-medium capitalize text-sm">{gateway}</span>
            </div>
          ))}
        </div>
      </div>}

      {/* Find Address Popup Component */}
      {donation.personalInfo.country === "1" && <FindAddressPopup
        show={showPopup && !submitted}
        setDonation={setDonation}
        cities={cities}
        postcode={donation.personalInfo.postcode}
        onSelect={handleSelectAddress}
        donation={donation}
        onClose={() => setShowPopup(false)}
        disable={disable}
        setDisable={setDisable}
      />}
    </div>
  );
};

export default PersonalInfo;