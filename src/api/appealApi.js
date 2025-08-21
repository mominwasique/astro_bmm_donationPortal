import api from './axios';

export const getFeaturedAppeals = async () => {
  try {
    const response = await api.get('/featured-appeal');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured appeals:', error);
    return [];
  }
};
