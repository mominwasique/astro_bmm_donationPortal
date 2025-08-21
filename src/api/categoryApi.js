import api from './axios';

export const fetchCategories = async () => {
  const { data } = await api.get(`/category`)
  return data;
};
