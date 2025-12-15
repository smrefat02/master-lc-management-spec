import React, { useState, useEffect } from "react";
import bankService from "../../services/bankService";
import masterLCService from "../../services/masterLCService";

const AdvisingBankPanel = ({ masterLc, onUpdate }) => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    advising_bank_id: masterLc?.advising_bank_id || "",
    advising_bank_confirmation_status:
      masterLc?.advising_bank_confirmation_status || "pending",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (masterLc) {
      setFormData({
        advising_bank_id: masterLc.advising_bank_id || "",
        advising_bank_confirmation_status:
          masterLc.advising_bank_confirmation_status || "pending",
      });
    }
  }, [masterLc]);

  const fetchBanks = async () => {
    try {
      const response = await bankService.getAllBanks({ status: "active" });
      setBanks(response.data || []);
    } catch (err) {
      console.error("Error fetching banks:", err);
      setError("Failed to load banks");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await masterLCService.adviseBank(masterLc.id, formData);
      setSuccess(
        formData.advising_bank_confirmation_status === "verified"
          ? "LC verified successfully by advising bank"
          : "LC rejected by advising bank"
      );
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to advise LC by bank");
    } finally {
      setLoading(false);
    }
  };

  const canAdvise = masterLc?.status === "issued";
  const isAdvised = ["verified", "active", "rejected", "expired"].includes(
    masterLc?.status
  );

  // Check if v3.0 workflow is active
  // v3.0 LCs have the lc_status field; v2.0 LCs don't
  const isV3Workflow = masterLc?.lc_status !== undefined;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Advising Bank Information
      </h3>

      {isV3Workflow && (
        <div className="mb-4 rounded-md bg-blue-50 p-4 border border-blue-200">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                INFO: This LC is using the new v3.0 workflow. Use the "LC
                Workflow (v3.0)" section above to manage this LC.
              </h3>
            </div>
          </div>
        </div>
      )}

      {!canAdvise && !isAdvised && !isV3Workflow && (
        <div className="rounded-md bg-yellow-50 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                LC must be issued by the issuing bank before it can be advised.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && !isV3Workflow && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}

      {!isV3Workflow && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bank Selection */}
          <div>
            <label
              htmlFor="advising_bank_id"
              className="block text-sm font-medium text-gray-700"
            >
              Advising Bank <span className="text-red-500">*</span>
            </label>
            <select
              id="advising_bank_id"
              name="advising_bank_id"
              value={formData.advising_bank_id}
              onChange={handleInputChange}
              disabled={isAdvised || loading || !canAdvise}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Advising Bank</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name} ({bank.swift_code})
                </option>
              ))}
            </select>
          </div>

          {/* Confirmation Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmation Status <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="status-pending"
                  name="advising_bank_confirmation_status"
                  type="radio"
                  value="pending"
                  checked={
                    formData.advising_bank_confirmation_status === "pending"
                  }
                  onChange={handleInputChange}
                  disabled={isAdvised || loading || !canAdvise}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="status-pending"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Pending - Awaiting verification
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="status-verified"
                  name="advising_bank_confirmation_status"
                  type="radio"
                  value="verified"
                  checked={
                    formData.advising_bank_confirmation_status === "verified"
                  }
                  onChange={handleInputChange}
                  disabled={isAdvised || loading || !canAdvise}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="status-verified"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Verified - LC is valid and confirmed
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="status-rejected"
                  name="advising_bank_confirmation_status"
                  type="radio"
                  value="rejected"
                  checked={
                    formData.advising_bank_confirmation_status === "rejected"
                  }
                  onChange={handleInputChange}
                  disabled={isAdvised || loading || !canAdvise}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="status-rejected"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Rejected - LC has discrepancies or issues
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {canAdvise && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Confirm Advising Bank Status"}
              </button>
            </div>
          )}

          {isAdvised && (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    This LC has been processed by the advising bank. No further
                    changes allowed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default AdvisingBankPanel;
