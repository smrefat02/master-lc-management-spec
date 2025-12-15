import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const bankService = {
  /**
   * Get all banks
   */
  async getAllBanks(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/banks`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching banks:", error);
      throw error;
    }
  },

  /**
   * Get bank by ID
   */
  async getBankById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/banks/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching bank:", error);
      throw error;
    }
  },
};

export default bankService;
