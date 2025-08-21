import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentCanvasser, isCanvasserAuthenticated, logoutCanvasser } from '../api/canvasserAuthApi';

const CanvasserAuthContext = createContext(null);

export const CanvasserAuthProvider = ({ children }) => {
    const [canvasser, setCanvasser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if canvasser is logged in on mount
        const checkAuth = () => {
            if (isCanvasserAuthenticated()) {
                setCanvasser(getCurrentCanvasser());
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = (canvasserData) => {
        setCanvasser(canvasserData);
    };

    const logout = async () => {
        await logoutCanvasser();
        setCanvasser(null);
        window.location.href = '/account/canvasser';
    };

    const value = {
        canvasser,
        setCanvasser: login,
        logout,
        isLoading,
        isAuthenticated: !!canvasser
    };

    if (isLoading) {
        return <div>Loading...</div>; // Or your loading component
    }

    return (
        <CanvasserAuthContext.Provider value={value}>
            {children}
        </CanvasserAuthContext.Provider>
    );
};

export const useCanvasserAuth = () => {
    const context = useContext(CanvasserAuthContext);
    if (!context) {
        throw new Error('useCanvasserAuth must be used within a CanvasserAuthProvider');
    }
    return context;
}; 