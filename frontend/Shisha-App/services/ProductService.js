import { axiosInstance } from "./apiConfig";

// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post("/products", productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Get all products
export const getAllProducts = async () => {
  try {
    const response = await axiosInstance.get("/products");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Update a product by ID
export const updateProduct = async (id, productData) => {
  try {
    const response = await axiosInstance.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Delete a product by ID
export const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};
