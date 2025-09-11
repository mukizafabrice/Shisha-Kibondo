import { axiosInstance } from "./apiConfig";

const UserService = {
  /**
   * Fetches all users from the server.
   */
  getUsers: async () => {
    try {
      const response = await axiosInstance.get("/users");
      return response.data;
    } catch (error) {
      console.error("Get users error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch users. Please try again."
      );
    }
  },

  /**
   * Updates a user by ID.
   */
  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/users/update/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Update user error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to update user. Please try again."
      );
    }
  },

  /**
   * Adds a new user.
   */
  addUser: async (userData) => {
    try {
      const response = await axiosInstance.post("/users/register", userData);
      return response.data;
    } catch (error) {
      console.error("Add user error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to add user. Please try again."
      );
    }
  },

  /**
   * Deletes a user by ID.
   */
  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete user error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
    }
  },

  // 🔑 Password Reset Services

  /**
   * Request a password reset (sends OTP to email).
   */
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post("/users/forgot-password", {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to request password reset. Please try again."
      );
    }
  },

  /**
   * Verify OTP for password reset.
   */
  verifyOtp: async (email, otp) => {
    try {
      const response = await axiosInstance.post("/users/verify-otp", {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      console.error("Verify OTP error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to verify OTP. Please try again."
      );
    }
  },

  /**
   * Reset password using OTP.
   */
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await axiosInstance.post("/users/reset-password", {
        email,
        otp,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Reset password error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    }
  },
};

export default UserService;
