import { useState, useEffect, useCallback } from "react";
import {
  getBuyers,
  createBuyer,
  updateBuyer,
  deleteBuyer,
} from "../services/buyerService";

export default function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 15,
    lastPage: 1,
    from: 0,
    to: 0,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [buyerToDelete, setBuyerToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contact_person: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    status: "active",
  });

  const fetchBuyers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 15,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const data = await getBuyers(params);

      setBuyers(data.data || []);
      setPagination({
        total: data.total || 0,
        perPage: data.per_page || 15,
        lastPage: data.last_page || 1,
        from: data.from || 0,
        to: data.to || 0,
      });
    } catch (error) {
      console.error("Error fetching buyers:", error);
      setBuyers([]);
      showToast("Error loading buyers", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenAddModal = () => {
    console.log("Add New Buyer button clicked");
    setEditingBuyer(null);
    setFormData({
      name: "",
      code: "",
      contact_person: "",
      email: "",
      phone: "",
      country: "",
      address: "",
      status: "active",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (buyer) => {
    console.log("Edit button clicked for buyer:", buyer);
    setEditingBuyer(buyer);
    setFormData({
      name: buyer.name || "",
      code: buyer.code || "",
      contact_person: buyer.contact_person || "",
      email: buyer.email || "",
      phone: buyer.phone || "",
      country: buyer.country || "",
      address: buyer.address || "",
      status: buyer.status || "active",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBuyer(null);
    setFormErrors({});
  };

  const handleOpenDeleteModal = (buyer) => {
    console.log("Delete button clicked for buyer:", buyer);
    setBuyerToDelete(buyer);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBuyerToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Helper to get error message (handles both string and array formats)
  const getErrorMessage = (error) => {
    if (!error) return null;
    if (Array.isArray(error)) return error[0];
    return error;
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Buyer name is required";
    if (!formData.code.trim()) errors.code = "Buyer code is required";
    if (!formData.status) errors.status = "Status is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingBuyer) {
        await updateBuyer(editingBuyer.id, formData);
        showToast("Buyer updated successfully");
      } else {
        await createBuyer(formData);
        showToast("Buyer created successfully");
      }
      handleCloseModal();
      fetchBuyers();
    } catch (error) {
      console.error("Error saving buyer:", error);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        showToast(error.response.data.message, "error");
      } else {
        showToast("Error saving buyer", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!buyerToDelete) return;

    setSubmitting(true);
    try {
      await deleteBuyer(buyerToDelete.id);
      showToast("Buyer deleted successfully");
      handleCloseDeleteModal();
      fetchBuyers();
    } catch (error) {
      console.error("Error deleting buyer:", error);
      if (error.response?.status === 409) {
        showToast(
          "Cannot delete buyer. It is referenced by existing contracts.",
          "error"
        );
      } else {
        showToast("Error deleting buyer", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-50 text-green-700 border-green-200",
      inactive: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status] || styles.active
        }`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4 flex items-center justify-center relative">
          <h1 className="text-2xl font-bold text-gray-900">LC Management</h1>
          <div className="flex items-center gap-3 absolute right-8">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">S.M. Refat</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              Viewer
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header with Title and Add Button */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Buyers</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage all buyer/customer records
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Add New Buyer
            </button>
          </div>

          {/* Filter Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name / code / country / email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="w-48">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : buyers.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No buyers found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || statusFilter
                    ? "Try adjusting your search or filter."
                    : "Get started by adding a new buyer."}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buyers.map((buyer) => (
                    <tr key={buyer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {buyer.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {buyer.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {buyer.country || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {buyer.contact_person || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {buyer.email || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {buyer.phone || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(buyer.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleOpenEditModal(buyer)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(buyer)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && buyers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {pagination.from} to {pagination.to} of{" "}
                {pagination.total} buyers
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.lastPage ||
                      Math.abs(page - currentPage) <= 1
                  )
                  .map((page, index, arr) => (
                    <span key={page}>
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === page
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pagination.lastPage, p + 1))
                  }
                  disabled={currentPage === pagination.lastPage}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingBuyer ? "Edit Buyer" : "Add New Buyer"}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          formErrors.name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter buyer name"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-xs text-red-500">
                          {getErrorMessage(formErrors.name)}
                        </p>
                      )}
                    </div>

                    {/* Code */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          formErrors.code ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter buyer code"
                      />
                      {formErrors.code && (
                        <p className="mt-1 text-xs text-red-500">
                          {getErrorMessage(formErrors.code)}
                        </p>
                      )}
                    </div>

                    {/* Contact Person */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter contact person"
                      />
                    </div>

                    {/* Email */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter email address"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500">
                          {getErrorMessage(formErrors.email)}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    {/* Country */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter country"
                      />
                    </div>

                    {/* Status */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          formErrors.status
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      {formErrors.status && (
                        <p className="mt-1 text-xs text-red-500">
                          {getErrorMessage(formErrors.status)}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : editingBuyer
                      ? "Update"
                      : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Buyer
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete{" "}
                        <strong>{buyerToDelete?.name}</strong>? This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {submitting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
