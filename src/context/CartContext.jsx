import React, { createContext, useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

// Create the CartContext
const CartContext = createContext();

// Function to play the cart sound
const playCartSound = () => {
  const audio = new Audio("/sounds/cart-add.mp3"); // Replace with your sound file
  audio.play().catch((err) => console.error("Audio play error:", err));
};

// Hook to use cart anywhere
const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        // Return default values for SSR
        return {
            cartCount: 0,
            addToCart: () => {},
            showAnimation: false,
            setShowAnimation: () => {}
        };
    }
    return context;
};

// Cart Provider Component
const CartProvider = ({ children }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Function to call when an item is added to cart
  const addToCart = () => {
    setShowAnimation(true);
    setCartCount((prev) => prev + 1);
    playCartSound();
  };

  return (
    <CartContext.Provider value={{ cartCount, addToCart, showAnimation, setShowAnimation }}>
      {children}
    </CartContext.Provider>
  );
};

// Cart Animation Component
const CartAnimation = () => {
  const context = useContext(CartContext);
  const [isClient, setIsClient] = useState(false);
  
  // Provide default values if context is not available (SSR)
  const { showAnimation = false, setShowAnimation = () => {} } = context || {};

  useEffect(() => {
    setIsClient(true);
  }, []);

  const cartVariants = {
    initial: { opacity: 0, scale: 0.5, top: "50%", left: "50%", x: "-50%", y: "-50%" },
    animate: {
      opacity: [1, 1, 1, 1, 0],
      scale: [0.5, 2, 2, 1, 0.5],
      top: ["50%", "50%", "50%", "20%", "0%"],
      left: ["50%", "50%", "50%", "70%", "100%"],
      x: ["-50%", "-50%", "-50%", "-20%", "10%"],
      y: ["-50%", "-50%", "-50%", "-50%", "-50%"],
      transition: { duration: 2, times: [0, 0.5, 0.5, 0.7, 1], ease: "easeInOut" },
    },
  };

  if (!isClient) return null;

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          className="fixed z-50"
          variants={cartVariants}
          initial="initial"
          animate="animate"
          onAnimationComplete={() => setShowAnimation(false)}
        >
          <div className="bg-white rounded-full p-4 shadow-lg">
            <ShoppingCart className="text-primary w-8 h-8" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { CartProvider, CartAnimation, useCart };
