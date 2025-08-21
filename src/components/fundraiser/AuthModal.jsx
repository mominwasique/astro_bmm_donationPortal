import React, { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const AuthModal = ({ isOpen, onClose }) => {
    const [currentView, setCurrentView] = useState('login'); // 'login' or 'register'

    const handleSwitchToRegister = () => {
        setCurrentView('register');
    };

    const handleSwitchToLogin = () => {
        setCurrentView('login');
    };

    const handleClose = () => {
        setCurrentView('login'); // Reset to login view when closing
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {currentView === 'login' && (
                <LoginModal
                    isOpen={isOpen}
                    onClose={handleClose}
                    onSwitchToRegister={handleSwitchToRegister}
                />
            )}
            {currentView === 'register' && (
                <RegisterModal
                    isOpen={isOpen}
                    onClose={handleClose}
                    onSwitchToLogin={handleSwitchToLogin}
                />
            )}
        </>
    );
};

export default AuthModal; 