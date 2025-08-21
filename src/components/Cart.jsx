import { motion } from 'framer-motion';
import { ChevronRight, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { deleteFromCart, getCart, updateCart } from '../api/cartApi';
import useSessionId from '../hooks/useSessionId';
import { useAuth } from '../context/AuthContext';

// Cart Component
const Cart = ({ isOpen, setIsOpen, render, setRender, websiteUrl }) => {
  const sessionId = useSessionId();
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch cart data
  const fetchCartData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      let data = [];
      
      if (isAuthenticated && user?.user_id) {
        data = await getCart({ donor_id: user.user_id, session_id: '' });
      } else if (sessionId) {
        data = await getCart({ session_id: sessionId, donor_id: '' });
      }
      
      setCartItems(data || []);
      try {
        localStorage.setItem('cart', JSON.stringify(Array.isArray(data) ? data : []));
      } catch (_) {}
      
      // Trigger render update if setRender is provided
      if (setRender) {
        setRender(prev => !prev);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setIsError(true);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.user_id, sessionId, setRender]);

  // Fetch cart when component mounts or dependencies change
  useEffect(() => {
    if (isAuthenticated ? !!user?.user_id : !!sessionId) {
      fetchCartData();
    }
  }, [fetchCartData]);

  // Refetch when cart is opened
  useEffect(() => {
    if (isOpen) {
      // Debounce re-fetch slightly to avoid rapid duplicate calls
      const id = setTimeout(() => fetchCartData(), 150);
      return () => clearTimeout(id);
    }
  }, [isOpen, fetchCartData]);

  // One line: Listen for global cart updates from other components
  useEffect(() => {
    const onCartChanged = () => fetchCartData();
    window.addEventListener('cart:changed', onCartChanged);
    return () => window.removeEventListener('cart:changed', onCartChanged);
  }, [fetchCartData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated ? !!user?.user_id : !!sessionId) {
        fetchCartData();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchCartData]);

  // Update quantity handler
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1 || isUpdating) return;

    setIsUpdating(true);
    
    try {
      toast.loading("Updating cart...");
      
      await updateCart({ id, newQuantity });
      
      toast.dismiss();
      toast.success("Cart updated successfully!");
      
      // Update local state and storage optimistically
      setCartItems(prevItems => {
        const updated = prevItems.map(item =>
          item.cart_id === id ? { ...item, quantity: newQuantity } : item
        );
        try { localStorage.setItem('cart', JSON.stringify(updated)); } catch (_) {}
        window.dispatchEvent(new Event('cart:local-changed'));
        return updated;
      });
      
      // Refetch to ensure consistency
      await fetchCartData();
      window.dispatchEvent(new Event('cart:changed'));
      
    } catch (error) {
      toast.dismiss();
      toast.error(`Error updating cart: ${error.message}`);
      console.error('Error updating cart:', error);
      // Revert optimistic update on error
      await fetchCartData();
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete item handler
  const handleDelete = async (cartId) => {
    if (isDeleting) return;

    setIsDeleting(true);
    
    try {
      toast.loading("Removing item...");
      
      await deleteFromCart(cartId);
      
      toast.dismiss();
      toast.success("Item removed from cart");
      
      // Update local state and storage optimistically
      setCartItems(prevItems => {
        const updated = prevItems.filter(item => item.cart_id !== cartId);
        try { localStorage.setItem('cart', JSON.stringify(updated)); } catch (_) {}
        window.dispatchEvent(new Event('cart:local-changed'));
        return updated;
      });
      
      // Refetch to ensure consistency
      await fetchCartData();
      window.dispatchEvent(new Event('cart:changed'));
      
    } catch (error) {
      toast.dismiss();
      toast.error(`Error removing item: ${error.message}`);
      console.error('Error removing item:', error);
      // Revert optimistic update on error
      await fetchCartData();
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle close cart
  const handleCloseCart = () => {
    if (typeof setIsOpen === 'function') {
      setIsOpen(false);
    }
  };

  return (
    <CartSidebar
      isOpen={isOpen}
      onClose={handleCloseCart}
      setIsOpen={setIsOpen}
      cartItems={cartItems}
      isLoading={isLoading}
      isError={isError}
      updateQuantity={updateQuantity}
      onDelete={handleDelete}
      websiteUrl={websiteUrl}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
    />
  );
};

// Sidebar Component
const CartSidebar = ({ 
  isOpen, 
  setIsOpen, 
  onClose,
  cartItems, 
  updateQuantity, 
  onDelete, 
  isLoading, 
  isError,
  websiteUrl,
  isUpdating,
  isDeleting
}) => {
  const sidebarRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  // Calculate total
  const calculateTotal = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      const amount = parseFloat(item.donation_amount) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (amount * quantity);
    }, 0);
  };

  // Handle navigation to checkout
  const handleCheckoutClick = () => {
    onClose();
    window.location.href = "/checkout";
  };

  // Handle add more programs
  const handleAddMorePrograms = () => {
    if (websiteUrl) {
      window.location.href = websiteUrl;
    } else {
      window.location.href = "/";
    }
    onClose();
  };

  // Render error state
  if (isError) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[60]">
            <motion.div
              ref={sidebarRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-96 max-w-full md:w-96 bg-gray-50/95 backdrop-blur-xl shadow-2xl z-[60]"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-grey">Your Cart</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>Error loading cart</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[60]">
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 max-w-full md:w-96 bg-gray-50/95 backdrop-blur-xl shadow-2xl z-[60]"
          >
            <div className="flex flex-col h-[100vh] md:h-full">
              {/* Header */}
              <div className="flex flex-col p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-grey">Your Cart</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    disabled={isUpdating || isDeleting}
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {cartItems?.length || 0} {cartItems?.length === 1 ? 'Program Added' : 'Programs Added'}
                </p>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4">
                {isLoading ? (
                  <>
                    <SkeletonLoader />
                    <SkeletonLoader />
                    <SkeletonLoader />
                  </>
                ) : Array.isArray(cartItems) && cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <CartItem
                      key={item.cart_id || item.id}
                      item={item}
                      updateQuantity={updateQuantity}
                      onDelete={onDelete}
                      isUpdating={isUpdating}
                      isDeleting={isDeleting}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ShoppingCart className="w-12 h-12 mb-2" />
                    <p>Your cart is empty.</p>
                  </div>
                )}
              </div>

              {/* Add More Programs Button */}
              <div className="border-gray-200 p-6 space-y-4">
                <button
                  onClick={handleAddMorePrograms}
                  className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-medium hover:bg-primaryHover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={isUpdating || isDeleting}
                >
                  Add More Programs <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Footer - Show Checkout Only If Cart Has Items */}
              {Array.isArray(cartItems) && cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>£{calculateTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-medium hover:bg-primaryHover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={isUpdating || isDeleting}
                  >
                    Checkout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

// Cart Item Component
const CartItem = ({ item, updateQuantity, onDelete, isUpdating, isDeleting }) => {
  const [localQuantity, setLocalQuantity] = useState(item?.quantity || 1);

  useEffect(() => {
    setLocalQuantity(item?.quantity || 1);
  }, [item?.quantity]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || !item?.cart_id) return;
    setLocalQuantity(newQuantity);
    updateQuantity(item.cart_id, newQuantity);
  };

  const handleDelete = () => {
    if (item?.cart_id) {
      onDelete(item.cart_id);
    }
  };

  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-4 p-4 hover:bg-gray-100/50 transition-colors group"
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={item.program_image || "/no-image-logo.png"}
          alt={item.program_name || "Program"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/no-image-logo.png";
          }}
        />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-grey">{item.program_name || "Unknown Program"}</h3>
        </div>
        <p className="text-sm text-gray-500">£{parseFloat(item.donation_amount || 0).toFixed(2)}</p>
        
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => handleQuantityChange(localQuantity - 1)}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            disabled={localQuantity <= 1 || isUpdating}
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>

          <span className="text-sm font-medium w-8 text-center">
            {localQuantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(localQuantity + 1)}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            disabled={isUpdating}
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors group-hover:opacity-100 disabled:opacity-50"
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse flex items-center gap-4 p-4">
    <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

export default Cart;