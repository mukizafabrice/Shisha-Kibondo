import { axiosInstance } from "./apiConfig";

const AuthService = {
  /**
   * Handles user login with either an email or a phone number.
   * @param {string} emailOrPhone - The user's email address or phone number.
   * @param {string} password - The user's password.
   * @returns {Promise<object>} A promise that resolves with user data and a JWT token on success.
   */
  login: async (emailOrPhone, password) => {
    try {
      const response = await axiosInstance.post("/users/login", {
        emailOrPhone, // Simplified syntax to match the variable name
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Login error:", error.message);
      // The backend should return a clear error message.
      throw new Error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  },

  /**
   * Handles the 'Forgot Password' flow.
   * @param {string} email - The user's email address.
   * @returns {Promise<object>} A promise that resolves with a success message.
   */
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post("/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error.message);
      throw new Error(
        error.response?.data?.message ||
          "Failed to send password reset link. Please try again."
      );
    }
  },

  /**
   * Handles Google Sign-In.
   * @returns {Promise<object>} A promise that resolves with user data on success or rejects with an error.
   */
  googleSignIn: async () => {
    try {
      // You would implement your Google Sign-In logic here.
      // This function would typically get a token from the Google API
      // and then send it to your backend for verification.

      // For example, if your backend has a Google auth endpoint:
      // const response = await axiosInstance.post('/auth/google', { idToken: googleIdToken });
      // return response.data;

      // This is a placeholder. You'll need to replace it with your actual logic.
      console.log("Google Sign-In simulation: Authenticating with Google...");
      return {
        success: true,
        user: { name: "Google User", email: "google.user@example.com" },
      };
    } catch (error) {
      console.error("Google Sign-In error:", error.message);
      throw error;
    }
  },
};

export default AuthService;
