import axios from "axios";

export const getPafData = async (postcode) => {
  const api_route = `https://paf.tscube.co.in/paf-test.php?client_ref=DA4B9237BACCCDF19C0760CAB7AEC4A8359010B0&post_code=${postcode}`;
  const { data } = await axios.post(api_route);
  return data;
};