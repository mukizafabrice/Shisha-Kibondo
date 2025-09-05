import { axiosInstance } from "./apiConfig";

const DistributeToUmunyabuzimaService = {
  /**
   * Creates a new distribution record.
   * @param {object} distributionData - The distribution data.
   * @returns {Promise<object>} A promise that resolves with the created distribution data on success.
   */
  createDistribution: async (distributionData) => {
    try {
      const response = await axiosInstance.post("/distribute-to-umunyabuzima", distributionData);
      return response.data;
    } catch (error) {
      console.error("Create distribution error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to create distribution. Please try again."
      );
    }
  },

  /**
   * Fetches all distribution records from the server.
   * @param {object} params - Query parameters (userId, page, limit).
   * @returns {Promise<object>} A promise that resolves with the list of distributions on success.
   */
  getDistributions: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/distribute-to-umunyabuzima", { params });
      return response.data;
    } catch (error) {
      console.error("Get distributions error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch distributions. Please try again."
      );
    }
  },

  /**
   * Fetches a single distribution by ID.
   * @param {string} id - The distribution's ID.
   * @returns {Promise<object>} A promise that resolves with the distribution data on success.
   */
  getDistribution: async (id) => {
    try {
      const response = await axiosInstance.get(`/distribute-to-umunyabuzima/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get distribution error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch distribution. Please try again."
      );
    }
  },

  /**
   * Updates a distribution by ID.
   * @param {string} id - The distribution's ID.
   * @param {object} distributionData - The updated distribution data.
   * @returns {Promise<object>} A promise that resolves with the updated distribution data on success.
   */
  updateDistribution: async (id, distributionData) => {
    try {
      const response = await axiosInstance.put(`/distribute-to-umunyabuzima/${id}`, distributionData);
      return response.data;
    } catch (error) {
      console.error("Update distribution error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to update distribution. Please try again."
      );
    }
  },

  /**
   * Deletes a distribution by ID.
   * @param {string} id - The distribution's ID.
   * @returns {Promise<object>} A promise that resolves with a success message on deletion.
   */
  deleteDistribution: async (id) => {
    try {
      const response = await axiosInstance.delete(`/distribute-to-umunyabuzima/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete distribution error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to delete distribution. Please try again."
      );
    }
  },

  /**
   * Fetches distribution statistics.
   * @returns {Promise<object>} A promise that resolves with the statistics data on success.
   */
  getDistributionStats: async () => {
    try {
      const response = await axiosInstance.get("/distribute-to-umunyabuzima/stats");
      return response.data;
    } catch (error) {
      console.error("Get distribution stats error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch distribution statistics. Please try again."
      );
    }
  },

  /**
   * Get distributions by user.
   * @param {string} userId - The user's ID.
   * @param {number} page - Page number.
   * @param {number} limit - Items per page.
   * @returns {Promise<object>} A promise that resolves with filtered distributions.
   */
  getDistributionsByUser: async (userId, page = 1, limit = 10) => {
    return DistributeToUmunyabuzimaService.getDistributions({ userId, page, limit });
  }
};

export default DistributeToUmunyabuzimaService;