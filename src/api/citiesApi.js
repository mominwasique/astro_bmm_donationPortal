import api from './axios';

export const fetchCities = async (id) => {  
  const {data} = await api.get(`city/${id}`)
  return data;
};
