import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated as isAuthenticatedFn, logoutUser } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check auth state on mount using API helper
        const checkAuthState = () => {
            if (isAuthenticatedFn()) {
                setUser(getCurrentUser());
            }
            setIsLoading(false);
        };

        checkAuthState();
    }, []);

    const login = (userData) => {
        // One line: Update user state when login succeeds
        setUser(userData);
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user
    };

    if (isLoading) {
        return <div>Loading...</div>; // Or your loading component
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        // Return default values for SSR
        return {
            user: null,
            login: () => { },
            logout: () => { },
            isLoading: false,
            isAuthenticated: false
        };
    }
    return context;
};