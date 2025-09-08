import { axiosInstance } from "./apiConfig";

// Create a new distribution
export const addDistribution = async (distributionData) => {
  try {
    const response = await axiosInstance.post(
      "/distributions",
      distributionData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get all distributions
export const getAllDistributions = async () => {
  try {
    const response = await axiosInstance.get("/distributions");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get distributions by beneficiary
export const getDistributionsByBeneficiary = async (beneficiaryId) => {
  try {
    const response = await axiosInstance.get(
      `/distributions/beneficiary/${beneficiaryId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Update a distribution
export const updateDistribution = async (id, distributionData) => {
  try {
    const response = await axiosInstance.put(
      `/distributions/${id}`,
      distributionData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Delete a distribution
export const deleteDistribution = async (id) => {
  try {
    const response = await axiosInstance.delete(`/distributions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};
