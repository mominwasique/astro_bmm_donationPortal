import axios from 'axios';

const apiURL = import.meta.env.PUBLIC_API_BASE_URL
const apiToken = import.meta.env.PUBLIC_API_TOKEN



const api = axios.create({
  baseURL: apiURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiToken}`,
  },
});

export default api;
