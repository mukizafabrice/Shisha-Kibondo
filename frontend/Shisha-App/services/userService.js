import { axiosInstance } from "./apiConfig";

const UserService = {
  /**
   * Fetches all users from the server.
   * @returns {Promise<object>} A promise that resolves with the list of users on success.
   */
  getUsers: async () => {
    try {
      const response = await axiosInstance.get("/users");
      return response.data;
    } catch (error) {
      console.error("Get users error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch users. Please try again."
      );
    }
  },

  /**
   * Updates a user by ID.
   * @param {string} id - The user's ID.
   * @param {object} userData - The updated user data.
   * @returns {Promise<object>} A promise that resolves with the updated user data on success.
   */
  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/users/update/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Update user error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to update user. Please try again."
      );
    }
  },

  /**
   * Deletes a user by ID.
   * @param {string} id - The user's ID.
   * @returns {Promise<object>} A promise that resolves with a success message on deletion.
   */
  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete user error:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to delete user. Please try again."
      );
    }
  },
};

export default UserService;