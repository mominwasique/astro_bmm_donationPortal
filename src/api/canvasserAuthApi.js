import api from './axios';

export const loginCanvasser = async credentials => {
  try {
    const response = await api.post('/login-canvasser', {
      email: credentials.email,
      password: credentials.password,
    });

    // Check if login was successful
    if (response.data.success) {
      // Store the canvasser data in localStorage with a different key
      localStorage.setItem('canvasser', JSON.stringify(response.data.canvasser));

      // Set the canvasser ID in the API headers for subsequent requests
      api.defaults.headers.common['canvasser_id'] = response.data.canvasser.id;
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const registerCanvasser = async userData => {
  try {
    const response = await api.post('/signup-canvasser', {
      email: userData.email,
      password: userData.password,
      first_name: userData.first_name,
      last_name: userData.last_name,
    });

    if (response.data.success) {
      localStorage.setItem('canvasser', JSON.stringify(response.data.canvasser));
      api.defaults.headers.common['canvasser_id'] = response.data.canvasser.id;
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logoutCanvasser = async () => {
  try {
    // Call logout endpoint if your API has one
    await api.post('/logout-canvasser');
  } catch (error) {
    console.error('Canvasser logout error:', error);
  } finally {
    // Clear local storage and reset axios header
    localStorage.removeItem('canvasser');
    delete api.defaults.headers.common['canvasser_id'];
  }
};

export const getCurrentCanvasser = () => {
  const canvasser = localStorage.getItem('canvasser');
  return canvasser ? JSON.parse(canvasser) : null;
};

export const isCanvasserAuthenticated = () => {
  const canvasser = localStorage.getItem('canvasser');
  return !!canvasser;
};

export const forgotCanvasserPassword = async email => {
  try {
    const response = await api.post('/forgot-password-canvasser', {
      email: email,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send password reset link');
  }
};

// Initialize canvasser auth header if canvasser exists (only in browser)
if (typeof window !== 'undefined') {
  try {
    const canvasser = localStorage.getItem('canvasser');
    if (canvasser) {
      const canvasserData = JSON.parse(canvasser);
      api.defaults.headers.common['canvasser_id'] = canvasserData.id;
    }
  } catch (error) {
    console.error('Error initializing canvasser auth header:', error);
  }
}
