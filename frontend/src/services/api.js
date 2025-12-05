import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // For Sanctum CSRF protection
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", error.message);
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Contract API endpoints
export const contractsApi = {
  // Get all contracts with pagination
  getAll: (page = 1, perPage = 15) => {
    return api.get(`/contracts?page=${page}&per_page=${perPage}`);
  },

  // Get single contract by ID
  getById: (id) => {
    return api.get(`/contracts/${id}`);
  },

  // Create new contract
  create: (data) => {
    return api.post("/contracts", data);
  },

  // Update existing contract
  update: (id, data) => {
    return api.put(`/contracts/${id}`, data);
  },

  // Get next contract number for a year
  getNextNumber: (year) => {
    return api.get(`/contracts/next-number?year=${year}`);
  },
};

// Buyer API endpoints
export const buyersApi = {
  // Get all buyers
  getAll: () => {
    return api.get("/buyers");
  },
};

export default api;
