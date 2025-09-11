import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// This file centralizes your API configuration, making it easy to manage.

const API_BASE_URL = "http://192.168.1.89:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to add the JWT token to the headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Handle specific HTTP errors here
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // You can add logic here to refresh the token or log the user out
      console.log("Authentication failed, token might be expired.");
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };
