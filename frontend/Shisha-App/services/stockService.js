import { axiosInstance } from "./apiConfig";

// Create stock
export const createStock = async (data) => {
  try {
    const response = await axiosInstance.post("/stock", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get all stocks (optionally filter by user)
export const getAllStocks = async (userId = null) => {
  try {
    const url = userId ? `/stock?userId=${userId}` : "/stock";
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Update stock by ID
export const updateStock = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/stock/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Delete stock by ID
export const deleteStock = async (id) => {
  try {
    const response = await axiosInstance.delete(`/stock/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

