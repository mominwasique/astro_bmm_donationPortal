import React, { useState, useEffect, useCallback } from 'react';
import useSessionId from '../hooks/useSessionId';
import { LogIn, UserPlus, ShoppingCart, User, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../api/cartApi';

const Header = ({ setIsOpen, cartItems, refreshTrigger }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const sessionId = useSessionId();
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set current path after component mounts to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Fetch cart data function
  const fetchCartData = useCallback(async () => {
    // Don't fetch if we don't have required identifiers
    if (!isAuthenticated && !sessionId) {
      setCartCount(0);
      return;
    }

    setIsLoading(true);

    try {
      let cartData = [];

      if (isAuthenticated && user?.user_id) {
        // For authenticated users
        cartData = await getCart({
          donor_id: user.user_id,
          session_id: ''
        });
      } else if (sessionId) {
        // For guest users
        cartData = await getCart({
          session_id: sessionId,
          donor_id: ''
        });
      }

      // Handle different response formats
      if (Array.isArray(cartData)) {
        setCartCount(cartData.length);
      } else if (cartData && Array.isArray(cartData.data)) {
        setCartCount(cartData.data.length);
      } else if (cartData && typeof cartData.count === 'number') {
        setCartCount(cartData.count);
      } else {
        setCartCount(0);
      }

      // console.log('Cart data fetched successfully:', cartData);

    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartCount(0); // Reset count on error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.user_id, sessionId]);

  // Fetch cart data when dependencies change
  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  // One line: React to global cart updates
  useEffect(() => {
    const onChanged = () => fetchCartData();
    window.addEventListener('cart:changed', onChanged);
    return () => window.removeEventListener('cart:changed', onChanged);
  }, [fetchCartData]);

  // Refetch when refresh trigger changes (for external updates)
  useEffect(() => {
    if (refreshTrigger) {
      fetchCartData();
    }
  }, [refreshTrigger, fetchCartData]);

  // If cartItems are passed as props, use them instead
  useEffect(() => {
    if (cartItems && Array.isArray(cartItems)) {
      setCartCount(cartItems.length);
    }
  }, [cartItems]);

  // Periodically refresh cart count (every 30 seconds)
  // Reduce polling to avoid API throttling (429)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCartData();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchCartData]);

  const handleCartClick = (e) => {
    e.preventDefault();
    setIsOpen(true);
    // One line: Notify others that cart was opened
    window.dispatchEvent(new CustomEvent('cart:toggle', { detail: { isOpen: true } }));
  };

  const handleNavigation = (path) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const MobileNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 py-4 px-6 z-40">
      <div className="flex justify-between items-center bg-white">
        <button
          onClick={() => handleNavigation('/')}
          className={`flex flex-col items-center ${currentPath === '/' ? 'text-primary' : 'text-grey'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Home</span>
        </button>

        {isAuthenticated ? (
          <button
            onClick={() => handleNavigation('/profile')}
            className={`flex flex-col items-center ${currentPath === '/profile' ? 'text-primary' : 'text-grey'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-1">Profile</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => handleNavigation('/login')}
              className={`flex flex-col items-center ${currentPath === '/login' ? 'text-primary' : 'text-grey'}`}
            >
              <LogIn className="w-5 h-5" />
              <span className="text-[10px] mt-1">Login</span>
            </button>

            <button
              onClick={() => handleNavigation('/signup')}
              className={`flex flex-col items-center ${currentPath === '/signup' ? 'text-primary' : 'text-grey'}`}
            >
              <UserPlus className="w-5 h-5" />
              <span className="text-[10px] mt-1">Signup</span>
            </button>
          </>
        )}

        <button
          onClick={handleCartClick}
          className="flex flex-col items-center text-grey relative"
          disabled={isLoading}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] mt-1">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );

  return (
    <>
      <header className="w-full bg-white shadow-md z-30">
        <div className="container mx-auto px-4 select-none">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center justify-center"
            >
              <img
                src="/logo-icon.png"
                alt="Al Wahab Foundation Logo"
                className="h-12 md:h-20"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </button>

            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="group relative p-2 text-grey hover:text-secondary transition-colors flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm font-medium text-grey">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Profile'}
                    </span>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Profile
                    </span>
                  </button>
                  <button
                    onClick={logout}
                    className="group relative p-2 text-grey hover:text-secondary transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="group relative p-2 text-grey hover:text-secondary transition-colors"
                    title="Login"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Login
                    </span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/signup')}
                    className="group relative p-2 text-grey hover:text-secondary transition-colors"
                    title="Sign up"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Sign up
                    </span>
                  </button>
                </>
              )}

              <button
                onClick={handleCartClick}
                className="group relative p-2 text-grey hover:text-secondary transition-colors"
                disabled={isLoading}
              >
                <ShoppingCart className="w-5 h-5" />
                {(cartCount || 0) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {(cartCount || 0) > 99 ? '99+' : (cartCount || 0)}
                  </span>
                )}
                {isLoading && (
                  <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Cart {(cartCount || 0) > 0 ? `(${cartCount})` : '(0)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobileNav />
    </>
  );
};

export default Header;