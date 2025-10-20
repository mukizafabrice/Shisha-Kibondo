import { axiosInstance } from "./apiConfig";

const HealthWorkerReportService = {
  /**
   * Fetches comprehensive 6-month report for health worker
   */
  getComprehensiveReport: async () => {
    try {
      const response = await axiosInstance.get("/reports/health-worker/comprehensive");
      return response.data;
    } catch (error) {
      console.error("Get comprehensive report error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch comprehensive report. Please try again."
      );
    }
  },

  /**
   * Fetches beneficiaries assigned to the health worker
   */
  getAssignedBeneficiaries: async () => {
    try {
      const response = await axiosInstance.get("/reports/health-worker/beneficiaries");
      return response.data;
    } catch (error) {
      console.error("Get assigned beneficiaries error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch assigned beneficiaries. Please try again."
      );
    }
  },

  /**
   * Fetches detailed information about a specific beneficiary
   * @param {string} beneficiaryId - The beneficiary ID
   */
  getBeneficiaryDetails: async (beneficiaryId) => {
    try {
      const response = await axiosInstance.get(`/reports/health-worker/beneficiaries/${beneficiaryId}/details`);
      return response.data;
    } catch (error) {
      console.error("Get beneficiary details error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch beneficiary details. Please try again."
      );
    }
  },


  /**
   * Fetches distribution history for the health worker
   * @param {Object} params - Query parameters (startDate, endDate, page, limit)
   */
  getDistributionHistory: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/reports/health-worker/distributions${queryString ? `?${queryString}` : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Get distribution history error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch distribution history. Please try again."
      );
    }
  },

  /**
   * Fetches beneficiary attendance report
   */
  getBeneficiaryAttendanceReport: async () => {
    try {
      const response = await axiosInstance.get("/reports/health-worker/attendance");
      return response.data;
    } catch (error) {
      console.error("Get attendance report error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch attendance report. Please try again."
      );
    }
  },

  /**
   * Fetches program day summary
   * @param {Object} params - Query parameters (startDate, endDate)
   */
  getProgramDaySummary: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/reports/health-worker/program-days${queryString ? `?${queryString}` : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Get program day summary error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch program day summary. Please try again."
      );
    }
  },
};

export default HealthWorkerReportService;