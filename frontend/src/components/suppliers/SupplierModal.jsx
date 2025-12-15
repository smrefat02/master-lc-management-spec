import { useState, useEffect } from "react";
import supplierService from "../../services/supplierService";
import SupplierForm from "./SupplierForm";
import { toast } from "react-toastify";

const SupplierModal = ({ supplier, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initializeForm = async () => {
      if (supplier) {
        // Edit mode - populate with existing data
        setFormData({
          name: supplier.name || "",
          code: supplier.code || "",
          contact_person: supplier.contact_person || "",
          email: supplier.email || "",
          phone: supplier.phone || "",
          country: supplier.country || "",
          address: supplier.address || "",
          status: supplier.status || "active",
        });
      } else {
        // Add mode - generate code
        await generateCode();
      }
    };

    initializeForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier]);

  const generateCode = async () => {
    try {
      const response = await supplierService.generateCode();
      setFormData((prev) => ({ ...prev, code: response.code }));
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error("Failed to generate supplier code");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (supplier) {
        // Update existing supplier
        await supplierService.update(supplier.id, formData);
        toast.success("Supplier updated successfully");
      } else {
        // Create new supplier
        await supplierService.create(formData);
        toast.success("Supplier created successfully");
      }
      onSuccess();
    } catch (error) {
      if (error.response?.status === 422) {
        // Validation errors
        setErrors(error.response.data.errors || {});
        toast.error("Please fix the validation errors");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
                  {supplier ? "Edit Supplier" : "Add New Supplier"}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
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

              <SupplierForm
                formData={formData}
                errors={errors}
                onChange={handleChange}
                isEdit={!!supplier}
              />
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving..." : supplier ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierModal;
