import { axiosInstance } from "./apiConfig";

const BeneficiaryService = {
  /**
   * Creates a new beneficiary.
   * @param {object} beneficiaryData - The beneficiary data.
   * @returns {Promise<object>} A promise that resolves with the created beneficiary data on success.
   */
  createBeneficiary: async (beneficiaryData) => {
    try {
      const response = await axiosInstance.post("/beneficiaries", beneficiaryData);
      return response.data;
    } catch (error) {
      console.error("Create beneficiary error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to create beneficiary. Please try again."
      );
    }
  },

  /**
   * Fetches all beneficiaries from the server.
   * @param {object} params - Query parameters (status, type, village, page, limit).
   * @returns {Promise<object>} A promise that resolves with the list of beneficiaries on success.
   */
  getBeneficiaries: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/beneficiaries", { params });
      return response.data;
    } catch (error) {
      console.error("Get beneficiaries error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch beneficiaries. Please try again."
      );
    }
  },

  /**
   * Fetches a single beneficiary by ID.
   * @param {string} id - The beneficiary's ID.
   * @returns {Promise<object>} A promise that resolves with the beneficiary data on success.
   */
  getBeneficiary: async (id) => {
    try {
      const response = await axiosInstance.get(`/beneficiaries/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get beneficiary error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch beneficiary. Please try again."
      );
    }
  },

  /**
   * Updates a beneficiary by ID.
   * @param {string} id - The beneficiary's ID.
   * @param {object} beneficiaryData - The updated beneficiary data.
   * @returns {Promise<object>} A promise that resolves with the updated beneficiary data on success.
   */
  updateBeneficiary: async (id, beneficiaryData) => {
    try {
      const response = await axiosInstance.put(`/beneficiaries/${id}`, beneficiaryData);
      return response.data;
    } catch (error) {
      console.error("Update beneficiary error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to update beneficiary. Please try again."
      );
    }
  },

  /**
   * Deletes a beneficiary by ID.
   * @param {string} id - The beneficiary's ID.
   * @returns {Promise<object>} A promise that resolves with a success message on deletion.
   */
  deleteBeneficiary: async (id) => {
    try {
      const response = await axiosInstance.delete(`/beneficiaries/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete beneficiary error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to delete beneficiary. Please try again."
      );
    }
  },

  /**
   * Fetches beneficiary statistics.
   * @returns {Promise<object>} A promise that resolves with the statistics data on success.
   */
  getBeneficiaryStats: async () => {
    try {
      const response = await axiosInstance.get("/beneficiaries/stats");
      return response.data;
    } catch (error) {
      console.error("Get beneficiary stats error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch beneficiary statistics. Please try again."
      );
    }
  },

  /**
   * Adds a program day for a beneficiary.
   * @param {string} beneficiaryId - The beneficiary's ID.
   * @param {object} dayData - The program day data.
   * @returns {Promise<object>} A promise that resolves with the created program day data on success.
   */
  addProgramDay: async (beneficiaryId, dayData) => {
    try {
      const response = await axiosInstance.post(`/beneficiaries/${beneficiaryId}/days`, dayData);
      return response.data;
    } catch (error) {
      console.error("Add program day error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to add program day. Please try again."
      );
    }
  },

  /**
   * Fetches program days for a beneficiary.
   * @param {string} beneficiaryId - The beneficiary's ID.
   * @param {object} params - Query parameters (page, limit).
   * @returns {Promise<object>} A promise that resolves with the list of program days on success.
   */
  getProgramDays: async (beneficiaryId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/beneficiaries/${beneficiaryId}/days`, { params });
      return response.data;
    } catch (error) {
      console.error("Get program days error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch program days. Please try again."
      );
    }
  },

  /**
   * Updates program day attendance.
   * @param {string} beneficiaryId - The beneficiary's ID.
   * @param {string} dayId - The program day's ID.
   * @param {object} attendanceData - The attendance data (attended, notes).
   * @returns {Promise<object>} A promise that resolves with the updated program day data on success.
   */
  updateProgramDayAttendance: async (beneficiaryId, dayId, attendanceData) => {
    try {
      const response = await axiosInstance.put(
        `/beneficiaries/${beneficiaryId}/days/${dayId}`,
        attendanceData
      );
      return response.data;
    } catch (error) {
      console.error("Update program day attendance error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to update attendance. Please try again."
      );
    }
  },

  /**
   * Removes a program day.
   * @param {string} beneficiaryId - The beneficiary's ID.
   * @param {string} dayId - The program day's ID.
   * @returns {Promise<object>} A promise that resolves with a success message on deletion.
   */
  removeProgramDay: async (beneficiaryId, dayId) => {
    try {
      const response = await axiosInstance.delete(`/beneficiaries/${beneficiaryId}/days/${dayId}`);
      return response.data;
    } catch (error) {
      console.error("Remove program day error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to remove program day. Please try again."
      );
    }
  },

  /**
   * Bulk update attendance for multiple days.
   * @param {string} beneficiaryId - The beneficiary's ID.
   * @param {Array} attendanceUpdates - Array of {dayId, attended, notes} objects.
   * @returns {Promise<Array>} A promise that resolves with an array of update results.
   */
  bulkUpdateAttendance: async (beneficiaryId, attendanceUpdates) => {
    try {
      const promises = attendanceUpdates.map(({ dayId, attended, notes }) =>
        BeneficiaryService.updateProgramDayAttendance(beneficiaryId, dayId, { attended, notes })
      );
      
      const results = await Promise.allSettled(promises);
      return results.map((result, index) => ({
        dayId: attendanceUpdates[index].dayId,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      }));
    } catch (error) {
      console.error("Bulk update attendance error:", error.message);
      throw new Error("Failed to update attendance records. Please try again.");
    }
  },

  /**
   * Get beneficiaries by status with pagination.
   * @param {string} status - The status to filter by.
   * @param {number} page - Page number.
   * @param {number} limit - Items per page.
   * @returns {Promise<object>} A promise that resolves with filtered beneficiaries.
   */
  getBeneficiariesByStatus: async (status, page = 1, limit = 10) => {
    return BeneficiaryService.getBeneficiaries({ status, page, limit });
  },

  /**
   * Get beneficiaries by type with pagination.
   * @param {string} type - The type to filter by.
   * @param {number} page - Page number.
   * @param {number} limit - Items per page.
   * @returns {Promise<object>} A promise that resolves with filtered beneficiaries.
   */
  getBeneficiariesByType: async (type, page = 1, limit = 10) => {
    return BeneficiaryService.getBeneficiaries({ type, page, limit });
  },

  /**
   * Search beneficiaries by village.
   * @param {string} village - The village to search for.
   * @param {number} page - Page number.
   * @param {number} limit - Items per page.
   * @returns {Promise<object>} A promise that resolves with filtered beneficiaries.
   */
  searchBeneficiariesByVillage: async (village, page = 1, limit = 10) => {
    return BeneficiaryService.getBeneficiaries({ village, page, limit });
  },

  /**
   * Get beneficiaries assigned to a specific user.
   * @param {string} userId - The user's ID.
   * @param {number} page - Page number.
   * @param {number} limit - Items per page.
   * @returns {Promise<object>} A promise that resolves with filtered beneficiaries.
   */
  getBeneficiariesByUser: async (userId, page = 1, limit = 10) => {
    return BeneficiaryService.getBeneficiaries({ userId, page, limit });
  },

  /**
   * Get beneficiaries by user and status.
   * @param {string} userId - The user's ID.
   * @param {string} status - The status to filter by.
   * @param {number} page - Page number.
   * @param {number} limit - Items per page.
   * @returns {Promise<object>} A promise that resolves with filtered beneficiaries.
   */
  getBeneficiariesByUserAndStatus: async (userId, status, page = 1, limit = 10) => {
    return BeneficiaryService.getBeneficiaries({ userId, status, page, limit });
  }
};

export default BeneficiaryService;