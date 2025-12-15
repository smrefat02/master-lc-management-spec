import api from "./api";

/**
 * Get paginated list of buyers
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search term
 * @param {string} params.status - Filter by status (active/inactive)
 * @param {number} params.page - Page number
 * @param {number} params.per_page - Items per page
 */
export const getBuyers = async (params = {}) => {
  const { page = 1, per_page = 15, search, status } = params;
  let url = `/buyers?page=${page}&per_page=${per_page}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Get a single buyer by ID
 * @param {number} id - Buyer ID
 */
export const getBuyer = async (id) => {
  const response = await api.get(`/buyers/${id}`);
  return response.data;
};

/**
 * Create a new buyer
 * @param {Object} data - Buyer data
 */
export const createBuyer = async (data) => {
  const response = await api.post("/buyers", data);
  return response.data;
};

/**
 * Update an existing buyer
 * @param {number} id - Buyer ID
 * @param {Object} data - Updated buyer data
 */
export const updateBuyer = async (id, data) => {
  const response = await api.put(`/buyers/${id}`, data);
  return response.data;
};

/**
 * Delete a buyer
 * @param {number} id - Buyer ID
 */
export const deleteBuyer = async (id) => {
  const response = await api.delete(`/buyers/${id}`);
  return response.data;
};

/**
 * Get buyers for dropdown (active only)
 */
export const getBuyersDropdown = async () => {
  const response = await api.get("/buyers/dropdown");
  return response.data;
};

export default {
  getBuyers,
  getBuyer,
  createBuyer,
  updateBuyer,
  deleteBuyer,
  getBuyersDropdown,
};
