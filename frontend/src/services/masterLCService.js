import api from "./api";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const masterLCService = {
  /**
   * Get all Master LCs
   */
  async getAll(params = {}) {
    try {
      const response = await api.get(`${API_BASE_URL}/master-lc`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching master LCs:", error);
      throw error;
    }
  },

  /**
   * Get Master LC by ID
   */
  async getById(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/master-lc/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching master LC:", error);
      throw error;
    }
  },

  /**
   * Generate new Master LC number
   */
  async generateNumber() {
    try {
      const response = await api.get(
        `${API_BASE_URL}/master-lc-generate-number`
      );
      return response.data;
    } catch (error) {
      console.error("Error generating LC number:", error);
      throw error;
    }
  },

  /**
   * Get dropdown data for Master LC form
   */
  async getDropdownData() {
    try {
      const response = await api.get(`${API_BASE_URL}/master-lc-dropdown-data`);
      return response.data;
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      throw error;
    }
  },

  /**
   * Create new Master LC
   */
  async create(data) {
    try {
      const response = await api.post(`${API_BASE_URL}/master-lc`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating master LC:", error);
      throw error;
    }
  },

  /**
   * Update existing Master LC
   */
  async update(id, data) {
    try {
      const response = await api.put(`${API_BASE_URL}/master-lc/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating master LC:", error);
      throw error;
    }
  },

  /**
   * Delete Master LC
   */
  async delete(id) {
    try {
      const response = await api.delete(`${API_BASE_URL}/master-lc/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting master LC:", error);
      throw error;
    }
  },

  /**
   * Upload attachment
   */
  async uploadAttachment(id, file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post(
        `${API_BASE_URL}/master-lc/${id}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error;
    }
  },

  /**
   * Delete attachment
   */
  async deleteAttachment(id, attachmentId) {
    try {
      const response = await api.delete(
        `${API_BASE_URL}/master-lc/${id}/attachment/${attachmentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting attachment:", error);
      throw error;
    }
  },

  /**
   * Download attachment
   */
  downloadAttachment(id, attachmentId) {
    return `${API_BASE_URL}/master-lc/${id}/attachment/${attachmentId}/download`;
  },

  /**
   * Banking Workflow: Issue LC by Issuing Bank
   */
  async issueBank(id, data) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lcs/${id}/issue-bank`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error issuing LC by bank:", error);
      throw error;
    }
  },

  /**
   * Banking Workflow: Advise LC by Advising Bank
   */
  async adviseBank(id, data) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lcs/${id}/advise-bank`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error advising LC by bank:", error);
      throw error;
    }
  },

  /**
   * Banking Workflow: Update Document Tracking
   */
  async updateDocuments(id, data) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lcs/${id}/documents`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating documents:", error);
      throw error;
    }
  },

  // ============================================
  // v3.0 Workflow Methods (8-step LC lifecycle)
  // ============================================

  /**
   * Step 2: Apply for LC (Draft → Applied)
   */
  async apply(id, data = {}) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lc/${id}/apply`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error applying for LC:", error);
      throw error;
    }
  },

  /**
   * Step 3: Issue LC (Applied → Issued by Issuing Bank)
   */
  async issue(id, data) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lc/${id}/issue`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error issuing LC:", error);
      throw error;
    }
  },

  /**
   * Step 4: Advise/Verify LC (Issued → Verified by Advising Bank)
   */
  async advise(id, data) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lc/${id}/advise`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error advising LC:", error);
      throw error;
    }
  },

  /**
   * Step 5: Ship Goods (Verified → Goods Shipped)
   */
  async shipGoods(id, data) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lc/${id}/ship-goods`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error recording goods shipment:", error);
      throw error;
    }
  },

  /**
   * Step 6: Receive Documents (Goods Shipped → Documents Received)
   */
  async receiveDocuments(id, data) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lc/${id}/documents/receive`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error receiving documents:", error);
      throw error;
    }
  },

  /**
   * Step 7: Forward Documents (Documents Received → Documents Forwarded)
   */
  async forwardDocuments(id, data = {}) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lc/${id}/documents/forward`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error forwarding documents:", error);
      throw error;
    }
  },

  /**
   * Step 8: Verify Documents (Documents Forwarded → Documents Verified)
   */
  async verifyDocuments(id, data) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lc/${id}/documents/verify`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying documents:", error);
      throw error;
    }
  },

  /**
   * Activate LC (Documents Verified → Active)
   */
  async activate(id) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lc/${id}/activate`
      );
      return response.data;
    } catch (error) {
      console.error("Error activating LC:", error);
      throw error;
    }
  },

  /**
   * Reject LC (Can be done at any stage)
   */
  async reject(id, data) {
    try {
      const response = await api.put(
        `${API_BASE_URL}/master-lc/${id}/reject`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error rejecting LC:", error);
      throw error;
    }
  },

  /**
   * Get LC Timeline
   */
  async getTimeline(id) {
    try {
      const response = await api.get(
        `${API_BASE_URL}/master-lc/${id}/timeline`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching LC timeline:", error);
      throw error;
    }
  },
};

export default masterLCService;
