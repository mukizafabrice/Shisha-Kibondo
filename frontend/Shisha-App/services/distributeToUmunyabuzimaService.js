// src/services/distributionService.js
import { axiosInstance } from "./apiConfig";

const API_URL = "/distibute-umunyabuzima";
// Base URL is already in apiConfig (e.g., http://localhost:5000/api)

const distributionService = {
  // Create a new distribution
  createDistribution: async (data) => {
    console.log("Sending data to API:", data); // <-- Add this line
    try {
      const response = await axiosInstance.post(API_URL, data);
      return response.data;
    } catch (error) {
      // Log the server's specific error message if available
      console.error("API Error:", error.response?.data);
      throw error;
    }
  },

  // Get all distributions (with optional pagination / filtering)
  getDistributions: async (params = {}) => {
    const response = await axiosInstance.get(API_URL, { params });
    return response.data;
  },

  // Get single distribution by ID
  getDistributionById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Update a distribution
  updateDistribution: async (id, data) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Delete a distribution
  deleteDistribution: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },
};

export default distributionService;
