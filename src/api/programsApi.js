import api from "./axios";

export const fetchPrograms = async (category_id) => {
  const { data } = await api.get(`/program/${category_id}`);
  console.log(data);

  return data;
};

export const fetchProgramRate = async (selectedCategory, selectedCountry, selectedProgram) => {
  if (!selectedProgram || !selectedCountry) return null;
  const response = await api.get(`/program-rate/${selectedProgram}/${selectedCountry}`);
  return response.data; // ✅ Return entire object, including program_rate
};