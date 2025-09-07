import { axiosInstance } from "./apiConfig";

// Create a new main stock
export const createMainStock = async (stockData) => {
  try {
    const response = await axiosInstance.post("/main-stock", stockData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get all main stock records (with product info populated)
export const getAllMainStock = async () => {
  try {
    const response = await axiosInstance.get("/main-stock");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Update a main stock by ID
export const updateMainStock = async (id, stockData) => {
  try {
    const response = await axiosInstance.put(`/main-stock/${id}`, stockData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// (Optional) Delete stock
export const deleteMainStock = async (id) => {
  try {
    const response = await axiosInstance.delete(`/main-stock/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};
