import React, { useState, useEffect } from "react";
import bankService from "../../services/bankService";
import masterLCService from "../../services/masterLCService";

const IssuingBankPanel = ({ masterLc, onUpdate }) => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    issuing_bank_id: masterLc?.issuing_bank_id || "",
    issuing_bank_reference_no: masterLc?.issuing_bank_reference_no || "",
    issuing_bank_issue_date: masterLc?.issuing_bank_issue_date || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (masterLc) {
      setFormData({
        issuing_bank_id: masterLc.issuing_bank_id || "",
        issuing_bank_reference_no: masterLc.issuing_bank_reference_no || "",
        issuing_bank_issue_date: masterLc.issuing_bank_issue_date || "",
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
      const response = await masterLCService.issueBank(masterLc.id, formData);
      setSuccess("LC issued successfully by issuing bank");
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue LC by bank");
    } finally {
      setLoading(false);
    }
  };

  const canIssue = masterLc?.status === "draft";
  const isIssued = masterLc?.status !== "draft";

  // Check if v3.0 workflow is active
  // v3.0 LCs have the lc_status field; v2.0 LCs don't
  const isV3Workflow = masterLc?.lc_status !== undefined;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Issuing Bank Information
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
              htmlFor="issuing_bank_id"
              className="block text-sm font-medium text-gray-700"
            >
              Issuing Bank <span className="text-red-500">*</span>
            </label>
            <select
              id="issuing_bank_id"
              name="issuing_bank_id"
              value={formData.issuing_bank_id}
              onChange={handleInputChange}
              disabled={isIssued || loading}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Issuing Bank</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name} ({bank.swift_code})
                </option>
              ))}
            </select>
          </div>

          {/* Reference Number */}
          <div>
            <label
              htmlFor="issuing_bank_reference_no"
              className="block text-sm font-medium text-gray-700"
            >
              Bank Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="issuing_bank_reference_no"
              name="issuing_bank_reference_no"
              value={formData.issuing_bank_reference_no}
              onChange={handleInputChange}
              disabled={isIssued || loading}
              required
              maxLength={100}
              placeholder="e.g., HSBC-LC-2025-001"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Issue Date */}
          <div>
            <label
              htmlFor="issuing_bank_issue_date"
              className="block text-sm font-medium text-gray-700"
            >
              Bank Issue Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="issuing_bank_issue_date"
              name="issuing_bank_issue_date"
              value={formData.issuing_bank_issue_date}
              onChange={handleInputChange}
              disabled={isIssued || loading}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-gray-500">
              Must be between LC issue date and today
            </p>
          </div>

          {/* Submit Button */}
          {canIssue && !isV3Workflow && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Issuing..." : "Issue LC by Bank"}
              </button>
            </div>
          )}

          {isIssued && (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    This LC has been issued by the bank. No further changes
                    allowed.
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

export default IssuingBankPanel;
