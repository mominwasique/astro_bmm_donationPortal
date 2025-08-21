import { useEffect, useState } from "react";

const useSessionId = () => {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedSessionId = localStorage.getItem("sessionId");

      if (!storedSessionId) {
        storedSessionId = generateSessionId(); // Generate a new session ID
        localStorage.setItem("sessionId", storedSessionId);
      }

      setSessionId(storedSessionId);
    }
  }, []);

  return sessionId;
};

// Function to generate a random session ID
const generateSessionId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  let sessionId = "";
  for (let i = 0; i < 16; i++) {
    sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sessionId;
};

export default useSessionId;
