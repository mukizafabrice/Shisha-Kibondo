import { axiosInstance } from "./apiConfig";

// Create stock
export const getTransactions = async () => {
  try {
    const response = await axiosInstance.get("/mainStock-transactions");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get all stocks (optionally filter by user)
// export const getAllStocks = async (userId = null) => {
//   try {
//     const url = userId ? `/stock?userId=${userId}` : "/stock";
//     const response = await axiosInstance.get(url);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || { message: error.message };
//   }
// };
