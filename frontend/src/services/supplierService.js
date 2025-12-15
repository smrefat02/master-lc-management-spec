import api from "./api";

const API_BASE_URL = "/suppliers";

const supplierService = {
  /**
   * Get all suppliers with optional filters
   */
  async getAll(params = {}) {
    const response = await api.get(API_BASE_URL, { params });
    return response.data;
  },

  /**
   * Get a single supplier by ID
   */
  async getById(id) {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new supplier
   */
  async create(data) {
    const response = await api.post(API_BASE_URL, data);
    return response.data;
  },

  /**
   * Update an existing supplier
   */
  async update(id, data) {
    const response = await api.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a supplier
   */
  async delete(id) {
    const response = await api.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Generate next supplier code
   */
  async generateCode() {
    const response = await api.get(`${API_BASE_URL}/generate-code`);
    return response.data;
  },
};

export default supplierService;
