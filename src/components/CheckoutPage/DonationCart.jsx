import React, { useEffect, useState, useCallback, useMemo } from "react";
import ItemCard from "./ItemCard";
import { deleteFromCart, getCart, updateCart } from "../../api/cartApi";
import useSessionId from "../../hooks/useSessionId";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { ShoppingCart, AlertCircle, Loader2, ChevronRight, Info, User, Users, Plus } from "lucide-react";
import { motion } from "framer-motion";

const DonationCart = ({ cartData, setCart, participantNames, setParticipantNames, countries, isLoading }) => {
  const sessionId = useSessionId();
  const { user, isAuthenticated } = useAuth();
  const [selfDonateItems, setSelfDonateItems] = useState({});
  const [guestName, setGuestName] = useState("");
  const [applyToAllItems, setApplyToAllItems] = useState(false);

  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);

  // Memoize processed cart data
  const processedCartData = useMemo(() => {
    return cartData.map(item => ({
      ...item,
      // Add any cart item processing here
    }));
  }, [cartData]);

  // Use cartData from props instead of fetching internally
  useEffect(() => {
    console.log('DonationCart received cartData:', cartData);
    console.log('DonationCart isLoading:', isLoading);

    if (cartData && Array.isArray(cartData) && !isLoading) {
      // Only update if the data has actually changed
      setData(prevData => {
        return JSON.stringify(prevData) !== JSON.stringify(cartData) ? cartData : prevData;
      });
      setIsError(false);
    } else {
      setData([]);
      setIsError(true);
    }
  }, [cartData, isLoading]); // Only depend on cartData and isLoading

  // Update cart in localStorage and parent component
  useEffect(() => {
    if (data.length > 0) {
      // Avoid unnecessary localStorage updates
      const currentCart = localStorage.getItem("cart");
      const newCartString = JSON.stringify(data);

      if (currentCart !== newCartString) {
        localStorage.setItem("cart", newCartString);
      }
    }
  }, [data]); // Only depend on data changes

  // Initialize participant names when cart changes
  useEffect(() => {
    if (data.length > 0) {
      setParticipantNames(prevNames => {
        const initialNames = { ...prevNames };
        let hasChanges = false;

        data.forEach((item) => {
          if (!initialNames[item.cart_id]) {
            const totalParticipants = item.quantity * (item.animal_share || 1);
            const shouldUseName = isAuthenticated && user?.first_name;
            initialNames[item.cart_id] = Array(totalParticipants).fill(
              shouldUseName ? user.first_name : ""
            );
            hasChanges = true;
          }
        });

        return hasChanges ? initialNames : prevNames;
      });

      setSelfDonateItems(prevItems => {
        const initialSelfDonate = { ...prevItems };
        let hasChanges = false;

        data.forEach((item) => {
          if (!initialSelfDonate.hasOwnProperty(item.cart_id)) {
            initialSelfDonate[item.cart_id] = isAuthenticated && user?.first_name ? true : false;
            hasChanges = true;
          }
        });

        return hasChanges ? initialSelfDonate : prevItems;
      });
    }
  }, [data, isAuthenticated, user?.first_name]); // Add specific dependencies

  const handleParticipantNameChange = useCallback((itemId, index, value) => {
    setParticipantNames((prev) => {
      const updated = { ...prev };
      if (!updated[itemId]) {
        updated[itemId] = Array(1).fill("");
      }
      updated[itemId][index] = value;
      return updated;
    });
  }, [setParticipantNames]);

  // New function to apply guest name to all participant fields
  const applyGuestNameToAll = useCallback(() => {
    if (!guestName.trim()) {
      toast.error("Please enter a name first");
      return;
    }

    if (applyToAllItems) {
      // Apply to all items in cart
      const updatedNames = {};
      data.forEach(item => {
        if (item.participant_required === "Y") {
          const totalParticipants = item.quantity * (item.animal_share || 1);
          updatedNames[item.cart_id] = Array(totalParticipants).fill(guestName);
        }
      });
      setParticipantNames(prev => ({ ...prev, ...updatedNames }));

    } else {
      // Apply to empty fields only
      setParticipantNames(prev => {
        const updated = { ...prev };
        data.forEach(item => {
          if (item.participant_required === "Y") {
            if (!updated[item.cart_id]) {
              const totalParticipants = item.quantity * (item.animal_share || 1);
              updated[item.cart_id] = Array(totalParticipants).fill(guestName);
            } else {
              updated[item.cart_id] = updated[item.cart_id].map(name =>
                name.trim() ? name : guestName
              );
            }
          }
        });
        return updated;
      });
    }

    toast.success("Name applied successfully!");
  }, [guestName, applyToAllItems, data, setParticipantNames]);

  const updateQuantity = useCallback(async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      toast.loading("Updating cart...");
      await updateCart({ id, newQuantity });
      toast.dismiss();
      toast.success("Cart updated successfully!");

      // Refetch cart data
      const fetchCart = async () => {
        try {
          let cartData;
          if (isAuthenticated && user?.user_id) {
            cartData = await getCart({ donor_id: user.user_id, session_id: '' });
          } else if (sessionId) {
            cartData = await getCart({ session_id: sessionId, donor_id: '' });
          } else {
            cartData = [];
          }
          setData(cartData);
          try { localStorage.setItem('cart', JSON.stringify(cartData || [])); } catch (_) {}
          window.dispatchEvent(new Event('cart:local-changed'));
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      };
      fetchCart();
    } catch (error) {
      toast.dismiss();
      toast.error(`Error updating cart: ${error.message}`);
    }

    const item = data.find(item => item.cart_id === id);
    const totalParticipants = newQuantity * (item?.animal_share || 1);

    setParticipantNames((prev) => {
      const updated = { ...prev };
      updated[id] = Array(totalParticipants).fill("");
      return updated;
    });
  }, [data, isAuthenticated, user?.user_id, sessionId, setParticipantNames]);

  // Update the removeItem function
  const removeItem = useCallback(async (cartId) => {
    const toastId = toast.loading("Removing item...");
    try {
      // Clear from local storage first
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updatedCart = currentCart.filter(item => item.cart_id !== cartId);
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      // Call API to delete
      const response = await deleteFromCart(cartId);
      if (response?.success === false && response?.message === 'Rate limited') {
        // Keep local optimistic deletion and warn user but do not spam API
        toast.custom(t => (
          <div className="bg-amber-600 text-white px-3 py-2 rounded">Server is busy. Cart will sync shortly.</div>
        ));
      }

      // Update local state
      setData(prevData => prevData.filter(item => item.cart_id !== cartId));

      // Update participant names
      setParticipantNames(prev => {
        const updated = { ...prev };
        delete updated[cartId];
        return updated;
      });

      // Refetch cart data
      if (isAuthenticated && user?.user_id) {
        const cartData = await getCart({ donor_id: user.user_id, session_id: '' });
        setData(cartData);
      } else if (sessionId) {
        const cartData = await getCart({ session_id: sessionId, donor_id: '' });
        setData(cartData);
      }

      // Persist snapshot and notify listeners
      try { localStorage.setItem('cart', JSON.stringify(Array.isArray(cartData) ? cartData : [])); } catch (_) {}
      window.dispatchEvent(new Event('cart:local-changed'));

      toast.dismiss(toastId);
      toast.success("Item removed from cart");

    } catch (error) {
      console.error('Delete cart error:', error);
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to remove item. Please try again.");

      // Restore from localStorage if API call failed
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setData(JSON.parse(savedCart));
      }
    }
  }, [isAuthenticated, user?.user_id, sessionId, setParticipantNames]);

  const getTotalAmount = useCallback(() => {
    return data.reduce((sum, item) => sum + item.donation_amount * item.quantity, 0);
  }, [data]);

  const handleCartUpdate = (updatedItem) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      );
      return newCart;
    });
  };

  // Check if all participant names are filled
  const areAllParticipantNamesFilled = useCallback(() => {
    for (const item of data) {
      if (item.participant_required === "Y") {
        const names = participantNames[item.cart_id] || [];
        const totalParticipants = item.quantity * (item.animal_share || 1);
        // Check if the number of filled names matches the total participants
        if (names.filter(name => name.trim()).length !== totalParticipants) {
          return false;
        }
      }
    }
    return true;
  }, [data, participantNames]);

  // Calculate total number of participant fields needed
  const totalParticipantFields = useCallback(() => {
    return data.reduce((sum, item) => {
      if (item.participant_required === "Y") {
        return sum + (item.quantity * (item.animal_share || 1));
      }
      return sum;
    }, 0);
  }, [data]);

  // Calculate filled participant fields
  const filledParticipantFields = useCallback(() => {
    let filled = 0;
    data.forEach(item => {
      if (item.participant_required === "Y") {
        const names = participantNames[item.cart_id] || [];
        filled += names.filter(name => name.trim()).length;
      }
    });
    return filled;
  }, [data, participantNames]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Your Donation Cart
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={`skeleton-${index}`} className="animate-pulse space-y-2 p-4 border border-gray-100 rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="h-8 bg-gray-100 rounded w-1/4 mt-4"></div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Your Donation Cart
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">Error loading the cart</p>
          <p className="text-sm text-gray-500 mt-2">Please try again later</p>
        </div>
      </motion.div>
    );
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Your Donation Cart
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <ShoppingCart className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="text-sm mt-2">Add some items to your cart to continue</p>
          <p className="text-xl mt-2">↓</p>
        </div>
      </motion.div>
    );
  }

  // Check if there are any items that require participant names
  const hasParticipantRequiredItems = data.some(item => item.participant_required === "Y");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-black flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          Your Donation Cart
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {data.length} {data.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Quick Participant Name Entry for Guest Users */}
      {!isAuthenticated && hasParticipantRequiredItems && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-primary/10 border-l-4 border-l-primary rounded-lg">
          <div className="flex items-start">
            <div className="bg-secondary/10 p-2 rounded-full mr-3">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-primary">Quick Participant Name Entry</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-3">
            <div className="flex-grow">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              />
            </div>
            <button
              onClick={applyGuestNameToAll}
              disabled={!guestName.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-primary/30 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <span>Apply Name</span>
              <Users className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="apply-to-all"
              checked={applyToAllItems}
              onChange={(e) => setApplyToAllItems(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="apply-to-all" className="ml-2 text-sm text-gray-600">
              Apply to all fields (overwrite existing names)
            </label>
          </div>

          {hasParticipantRequiredItems && (
            <div className="mt-3 flex items-center text-sm text-gray-600">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, (filledParticipantFields() / totalParticipantFields()) * 100)}%` }}
                ></div>
              </div>
              <span className="ml-2 whitespace-nowrap">
                {filledParticipantFields()}/{totalParticipantFields()} filled
              </span>
            </div>
          )}
        </motion.div>
      )}

      <div className="space-y-6">
        {data.map((item, index) => (
          <motion.div
            key={`cart-${item.cart_id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-primary rounded-lg p-4  transition-colors hover:shadow-sm"
          >
            <ItemCard
              item={item}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              showParticipantInput={true}
            />

            {/* Self Donate Option */}
            {isAuthenticated && item.participant_required === "Y" && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selfDonateItems[item.cart_id] || false}
                    onChange={(e) => {
                      setSelfDonateItems(prev => ({
                        ...prev,
                        [item.cart_id]: e.target.checked
                      }));
                      if (e.target.checked && user?.first_name) {
                        setParticipantNames(prev => ({
                          ...prev,
                          [item.cart_id]: Array(item.quantity * (item.animal_share || 1)).fill(user.first_name)
                        }));
                      } else {
                        setParticipantNames(prev => ({
                          ...prev,
                          [item.cart_id]: Array(item.quantity * (item.animal_share || 1)).fill("")
                        }));
                      }
                    }}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Donate on behalf of myself</span>
                </label>
              </div>
            )}

            {/* Participant Name Inputs */}
            {item.participant_required === "Y" && !selfDonateItems[item.cart_id] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <label className="block font-medium text-gray-700">
                    Participant Names <span className="text-red-500">*</span>
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      Please enter the names of all participants for this donation.
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: item.quantity * (item.animal_share || 1) }).map((_, index) => (
                    <div key={`${item.cart_id}-participant-${index}`} className="relative">
                      <input
                        type="text"
                        value={participantNames[item.cart_id]?.[index] || ""}
                        onChange={(e) =>
                          handleParticipantNameChange(item.cart_id, index, e.target.value)
                        }
                        placeholder={`Participant ${index + 1}`}
                        className={`w-full px-4 py-2 border ${participantNames[item.cart_id]?.[index]
                          ? 'border-primary focus:ring-primary/50'

                          : 'border-gray-300 focus:ring-primary/20'
                          } rounded-lg focus:ring-2 focus:border-primary outline-none transition-colors`}
                      />
                      {participantNames[item.cart_id]?.[index] && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Copy Button for individual items */}
                {!isAuthenticated && guestName.trim() && (
                  <button
                    onClick={() => {
                      const totalParticipants = item.quantity * (item.animal_share || 1);
                      setParticipantNames(prev => ({
                        ...prev,
                        [item.cart_id]: Array(totalParticipants).fill(guestName)
                      }));
                      toast.success(`Applied name to this item`);
                    }}
                    className="mt-3 text-sm text-primary hover:text-p flex items-center gap-1"
                  >
                    <User className="w-3 h-3" />
                    <span>Apply "{guestName}" to all fields in this item</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-primary">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Items: {data.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Amount:</p>
          </div>
          <p className="text-2xl font-bold text-primary">
            £{getTotalAmount().toFixed(2)}
          </p>
        </div>
      </div>

      {!areAllParticipantNamesFilled() && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <p className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Please fill in all participant names before proceeding.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      {/* <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Previous Button */}
      {/* <button
        onClick={() => window.location.href = "/"}
        className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
      >
        <span>← Back to Programs</span>
      </button> */}

      {/* Add More Programs Button */}
      {/* <button
        onClick={() => window.location.href = "/"}
        className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 bg-secondary text-white hover:bg-secondary/90"
      >
        <span>Add More Programs</span>
        <Plus className="w-4 h-4" />
      </button> */}

      {/* Next Button */}
      {/* <button
        onClick={onNext}
        disabled={data.length === 0 || (data.some(item => item.participant_required === "Y") && !areAllParticipantNamesFilled())}
        className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${data.length === 0 || (data.some(item => item.participant_required === "Y") && !areAllParticipantNamesFilled())
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90'
          }`}
      >
        <span>Continue to Personal Information</span>
        <ChevronRight className="w-4 h-4" />
      </button> */}
      {/* </div> */}
    </motion.div>
  );
};

export default DonationCart;