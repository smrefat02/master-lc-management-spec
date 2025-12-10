import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function B2BLCDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [b2blc, setB2blc] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  // Form data for editing
  const [formData, setFormData] = useState({
    pi_number: "",
    supplier: "",
    order_qty: "",
    fob_value: "",
    order_value: "",
    post_pi_value: "",
    b2b_percent: "",
    director_command: "",
    status: "draft",
  });

  useEffect(() => {
    fetchB2BLCDetails();
  }, [id]);

  const fetchB2BLCDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/b2b-lc/${id}`);
      if (!response.ok) throw new Error("Failed to fetch B2B LC");

      const data = await response.json();
      setB2blc(data);

      // Initialize form data
      const initialData = {
        pi_number: data.pi_number,
        supplier: data.supplier,
        order_qty: data.order_qty,
        fob_value: data.fob_value,
        order_value: data.order_value,
        post_pi_value: data.post_pi_value,
        b2b_percent: data.b2b_percent,
        director_command: data.director_command || "",
        status: data.status,
      };
      setFormData(initialData);
      setOriginalData(initialData);
    } catch (error) {
      console.error("Error fetching B2B LC:", error);
      alert("Failed to load B2B LC details");
      navigate("/b2b-lc");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle order quantity change with auto-calculation
  const handleOrderQtyChange = (e) => {
    const qty = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, order_qty: qty };

      if (qty && prev.fob_value) {
        newData.order_value = (
          parseFloat(qty) * parseFloat(prev.fob_value)
        ).toFixed(2);

        if (prev.post_pi_value && newData.order_value > 0) {
          newData.b2b_percent = (
            (parseFloat(prev.post_pi_value) / parseFloat(newData.order_value)) *
            100
          ).toFixed(2);
        }
      }

      return newData;
    });
  };

  // Handle FOB value change with auto-calculation
  const handleFobValueChange = (e) => {
    const fob = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, fob_value: fob };

      if (prev.order_qty && fob) {
        newData.order_value = (
          parseFloat(prev.order_qty) * parseFloat(fob)
        ).toFixed(2);

        if (prev.post_pi_value && newData.order_value > 0) {
          newData.b2b_percent = (
            (parseFloat(prev.post_pi_value) / parseFloat(newData.order_value)) *
            100
          ).toFixed(2);
        }
      }

      return newData;
    });
  };

  // Handle Post PI value change with auto-calculation
  const handlePostPIChange = (e) => {
    const postPI = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, post_pi_value: postPI };

      if (postPI && prev.order_value && parseFloat(prev.order_value) > 0) {
        newData.b2b_percent = (
          (parseFloat(postPI) / parseFloat(prev.order_value)) *
          100
        ).toFixed(2);
      }

      return newData;
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(originalData);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/b2b-lc/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update B2B LC");

      const data = await response.json();
      setB2blc(data);
      setOriginalData(formData);
      setIsEditing(false);
      alert("B2B LC updated successfully!");
    } catch (error) {
      console.error("Error updating B2B LC:", error);
      alert("Failed to update B2B LC");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this B2B LC?")) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/b2b-lc/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete B2B LC");

      alert("B2B LC deleted successfully!");
      navigate("/b2b-lc");
    } catch (error) {
      console.error("Error deleting B2B LC:", error);
      alert("Failed to delete B2B LC");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!b2blc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">B2B LC not found</p>
          <button
            onClick={() => navigate("/b2b-lc")}
            className="mt-4 text-indigo-600 hover:text-indigo-900"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                B2B LC Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                PI Number: {b2blc.pi_number}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCancelEdit}
                  className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => navigate("/b2b-lc")}
                className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
              >
                Back to List
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleUpdate}>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-8">
                {/* Left Column - Reference Information (1/3) */}
                <div className="col-span-1 space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Reference Information
                  </h3>

                  {/* Contract Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Number
                    </label>
                    <div className="text-sm text-gray-900">
                      {b2blc.contract?.contract_no || "N/A"}
                    </div>
                  </div>

                  {/* Buyer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buyer
                    </label>
                    <div className="text-sm text-gray-900">
                      {b2blc.contract?.buyer?.name || "N/A"}
                    </div>
                  </div>

                  {/* Order Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Number
                    </label>
                    <div className="text-sm text-gray-900">
                      {b2blc.order?.order_number || "N/A"}
                    </div>
                  </div>

                  {/* Costing Detail ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costing Detail ID
                    </label>
                    <div className="text-sm text-gray-900">
                      {b2blc.costing_detail_id}
                    </div>
                  </div>
                </div>

                {/* Right Column - B2B LC Information (2/3) */}
                <div className="col-span-2">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    B2B LC Information
                  </h3>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                    {/* Row 1 - Order Qty, FOB Value, Order Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Quantity
                      </label>
                      <input
                        type="number"
                        name="order_qty"
                        value={formData.order_qty}
                        onChange={handleOrderQtyChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                          isEditing
                            ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            : "bg-gray-50 cursor-not-allowed"
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {b2blc.order_qty} pcs
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FOB Value
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="fob_value"
                        value={formData.fob_value}
                        onChange={handleFobValueChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                          isEditing
                            ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            : "bg-gray-50 cursor-not-allowed"
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ${parseFloat(b2blc.fob_value).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Value (Auto-calculated)
                      </label>
                      <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                        <div className="text-base font-bold text-gray-900">
                          ${formData.order_value}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ${parseFloat(b2blc.order_value).toFixed(2)}
                      </p>
                    </div>

                    {/* Row 2 - PI Number (span 2), Supplier */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PI Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pi_number"
                        value={formData.pi_number}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                          isEditing
                            ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            : "bg-gray-50 cursor-not-allowed"
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {b2blc.pi_number}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supplier <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                          isEditing
                            ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            : "bg-gray-50 cursor-not-allowed"
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {b2blc.supplier}
                      </p>
                    </div>

                    {/* Row 3 - Post PI Value (span 2), B2B % */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Post Costing / Received PI Value ($){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="post_pi_value"
                        value={formData.post_pi_value}
                        onChange={handlePostPIChange}
                        disabled={!isEditing}
                        required
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                          isEditing
                            ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            : "bg-gray-50 cursor-not-allowed"
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ${parseFloat(b2blc.post_pi_value).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        B2B %
                      </label>
                      <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                        <div className="text-base font-bold text-indigo-600">
                          {formData.b2b_percent}%
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Calc: 0.00% = Post PI / Order Value × 100
                      </p>
                      <p className="text-xs text-gray-500">
                        {parseFloat(b2blc.b2b_percent).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Director Sir Command - Full Width */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Director Sir Command
                    </label>
                    <textarea
                      name="director_command"
                      value={formData.director_command}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="3"
                      placeholder="-"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                        isEditing
                          ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          : "bg-gray-50 cursor-not-allowed"
                      }`}
                    />
                  </div>

                  {/* Status */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    {isEditing ? (
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          formData.status === "draft"
                            ? "bg-gray-100 text-gray-700"
                            : formData.status === "active"
                            ? "bg-green-100 text-green-700"
                            : formData.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {formData.status.charAt(0).toUpperCase() +
                          formData.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Only show in Edit Mode */}
            {isEditing && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save B2B LC"}
                </button>
              </div>
            )}
          </form>

          {/* Created/Updated Timestamps */}
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div>Created: {formatDate(b2blc.created_at)}</div>
            <div>Last Updated: {formatDate(b2blc.updated_at)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
