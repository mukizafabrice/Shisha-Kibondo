import { axiosInstance } from "./apiConfig";

const ManagerReportService = {
  /**
   * Fetches comprehensive 6-month report
   */
  getComprehensiveReport: async () => {
    try {
      const response = await axiosInstance.get("/reports/manager/comprehensive");
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
   * Fetches beneficiary statistics report
   */
  getBeneficiaryReport: async () => {
    try {
      const response = await axiosInstance.get("/reports/manager/beneficiaries");
      return response.data;
    } catch (error) {
      console.error("Get beneficiary report error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch beneficiary report. Please try again."
      );
    }
  },

  /**
   * Fetches distribution statistics report
   * @param {Object} params - Query parameters (startDate, endDate)
   */
  getDistributionReport: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/reports/manager/distributions${queryString ? `?${queryString}` : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Get distribution report error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch distribution report. Please try again."
      );
    }
  },

  /**
   * Fetches stock levels report
   */
  getStockReport: async () => {
    try {
      const response = await axiosInstance.get("/reports/manager/stocks");
      return response.data;
    } catch (error) {
      console.error("Get stock report error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch stock report. Please try again."
      );
    }
  },

  /**
   * Fetches user activity report
   */
  getUserActivityReport: async () => {
    try {
      const response = await axiosInstance.get("/reports/manager/user-activity");
      return response.data;
    } catch (error) {
      console.error("Get user activity report error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch user activity report. Please try again."
      );
    }
  },

  /**
   * Fetches main stock transaction history
   * @param {Object} params - Query parameters (startDate, endDate)
   */
  getMainStockTransactionReport: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/reports/manager/main-stock-transactions${queryString ? `?${queryString}` : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Get main stock transaction report error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch main stock transaction report. Please try again."
      );
    }
  },
};

export default ManagerReportService;