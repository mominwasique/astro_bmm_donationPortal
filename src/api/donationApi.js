import axios from "axios";
import api from "./axios";

export const getReferenceId = async (id) => {
  const response = await api.get(`/payment/reference/${id}`);
  return response;
};

// Function to create payment intent
export const createPaymentIntent = async (data) => {
  const { amount, reference_no } = data;
  try {
    const response = await api.post(`payment/stripe/paymentIntent`, data);

    if (response.status !== 200) {
      throw new Error("Failed to create payment intent.");
    }

    return response.data;
  } catch (error) {
    throw new Error(
      error.message || "An error occurred while creating the payment intent."
    );
  }
};

export const createSingleDonation = async (data) => {
  const response = await api.post(`payment/create-single-donation`, data);

  return response.data;
};

export const getDonorInfo = async (email) => {
  if (!email) {
    throw new Error("Email is required to fetch donor information");
  }

  try {
    const response = await api.post("/donor/email", { email });
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch donor information"
      );
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching donor info:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch donor information"
    );
  }
};

export const updateDonor = async (donorData) => {
  try {
    const response = await api.post("/donor/update-donor", donorData);
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to update donor information"
      );
    }
    return response.data;
  } catch (error) {
    console.error("Error updating donor info:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update donor information"
    );
  }
};

export const updateDonorPassword = async (data) => {
  try {
    const response = await api.post("/donor/update-donor-password", data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update password");
    }
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update password"
    );
  }
};

export const addNewAddress = async (addressData) => {
  try {
    const response = await api.post("/donor/add-new-address", addressData);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add address");
    }
    return response.data;
  } catch (error) {
    console.error("Error adding address:", error);
    throw new Error(error.response?.data?.message || "Failed to add address");
  }
};

export const getDonorAddress = async (donorId) => {
  try {
    const response = await api.get(`/donor/address/${donorId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch address");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch address");
  }
};

export const getOneOffTransactions = async (data) => {
  try {
    const response = await api.post("/donor/one-off-transaction", data);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch transactions"
    );
  }
};


export const getDirectDebit = async (data) => {
  try {
    const response = await api.post("/donor/direct-debit-transaction", data);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch transactions"
    );
  }
};
