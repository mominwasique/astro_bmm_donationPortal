import api from './axios';

export const loginCanvasser = async data => {
  const response = await api.post(`/login-canvasser`, data);
  return response;
};

export const signupCanvasser = async data => {
  const response = await api.post(`/signup-canvasser`, data);
  return response;
};

export const verifyCanvasser = async data => {
  const response = await api.post(`/email-verification`, data);
  return response;
};
