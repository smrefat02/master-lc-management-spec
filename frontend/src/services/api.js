import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Disabled for now - enable when using Sanctum
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
  getAll: (params = {}) => {
    const { page = 1, per_page = 15, search, status } = params;
    let url = `/contracts?page=${page}&per_page=${per_page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
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

// Bank API endpoints
export const banksAPI = {
  // Get all banks
  getAll: async () => {
    try {
      const response = await api.get("/banks");
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error("Failed to fetch banks:", error);
      return { success: false, data: [] };
    }
  },

  // Get single bank by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/banks/${id}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error("Failed to fetch bank:", error);
      return { success: false, data: null };
    }
  },
};

export default api;
