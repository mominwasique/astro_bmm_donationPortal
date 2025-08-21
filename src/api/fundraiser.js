import api from "./axios";

export const getAllAppeals = async () => {
    const response = await api.get(`/featured-appeal`);
    return response;
}

export const addFundraiser = async (data) => {
    const response = await api.post(`/add-fundraiser`, data);
    return response;
}

export const getFundraiserById = async (id) => {
    const response = await api.get(`/fundraser-by-canvasser/${id}`);
    return response;
}

export const getFundraiserBySlug = async (slug) => {
    const response = await api.get(`/fundrasing/${slug}`);
    return response;
}

export const publishFundraiser = async (id) => {
    const response = await api.post(`/publish-fundraiser/${id}`);
    return response;
}

export const deleteFundraiser = async (id) => {
    const response = await api.post(`/delete-fundrasing/${id}`);
    return response;
}