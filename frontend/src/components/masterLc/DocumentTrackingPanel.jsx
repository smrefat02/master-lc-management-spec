import React, { useState, useEffect } from "react";
import masterLCService from "../../services/masterLCService";

const DocumentTrackingPanel = ({ masterLc, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    documents_received_at: masterLc?.documents_received_at || "",
    documents_forwarded_to_bank_at:
      masterLc?.documents_forwarded_to_bank_at || "",
    documents_verified_at: masterLc?.documents_verified_at || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (masterLc) {
      setFormData({
        documents_received_at: masterLc.documents_received_at
          ? masterLc.documents_received_at.split("T")[0] +
            "T" +
            masterLc.documents_received_at.split("T")[1]?.substring(0, 5)
          : "",
        documents_forwarded_to_bank_at: masterLc.documents_forwarded_to_bank_at
          ? masterLc.documents_forwarded_to_bank_at.split("T")[0] +
            "T" +
            masterLc.documents_forwarded_to_bank_at
              .split("T")[1]
              ?.substring(0, 5)
          : "",
        documents_verified_at: masterLc.documents_verified_at
          ? masterLc.documents_verified_at.split("T")[0] +
            "T" +
            masterLc.documents_verified_at.split("T")[1]?.substring(0, 5)
          : "",
      });
    }
  }, [masterLc]);

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
      // Convert datetime-local to ISO format
      const payload = {};
      if (formData.documents_received_at) {
        payload.documents_received_at = new Date(
          formData.documents_received_at
        ).toISOString();
      }
      if (formData.documents_forwarded_to_bank_at) {
        payload.documents_forwarded_to_bank_at = new Date(
          formData.documents_forwarded_to_bank_at
        ).toISOString();
      }
      if (formData.documents_verified_at) {
        payload.documents_verified_at = new Date(
          formData.documents_verified_at
        ).toISOString();
      }

      const response = await masterLCService.updateDocuments(
        masterLc.id,
        payload
      );
      setSuccess("Document tracking updated successfully");
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update document tracking"
      );
    } finally {
      setLoading(false);
    }
  };

  const canUpdate = ["verified", "active"].includes(masterLc?.status);
  const isActive = masterLc?.status === "active";

  // Check if v3.0 workflow is active
  // v3.0 LCs have the lc_status field; v2.0 LCs don't
  const isV3Workflow = masterLc?.lc_status !== undefined;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Document Tracking
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

      {!canUpdate && !isV3Workflow && (
        <div className="rounded-md bg-yellow-50 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                LC must be verified by the advising bank before documents can be
                tracked.
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
          {/* Documents Received */}
          <div>
            <label
              htmlFor="documents_received_at"
              className="block text-sm font-medium text-gray-700"
            >
              Documents Received At
            </label>
            <input
              type="datetime-local"
              id="documents_received_at"
              name="documents_received_at"
              value={formData.documents_received_at}
              onChange={handleInputChange}
              disabled={loading || !canUpdate}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-gray-500">
              When documents were received from the exporter
            </p>
          </div>

          {/* Documents Forwarded to Bank */}
          <div>
            <label
              htmlFor="documents_forwarded_to_bank_at"
              className="block text-sm font-medium text-gray-700"
            >
              Documents Forwarded to Bank At
            </label>
            <input
              type="datetime-local"
              id="documents_forwarded_to_bank_at"
              name="documents_forwarded_to_bank_at"
              value={formData.documents_forwarded_to_bank_at}
              onChange={handleInputChange}
              disabled={loading || !canUpdate}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-gray-500">
              When documents were forwarded to the issuing bank
            </p>
          </div>

          {/* Documents Verified */}
          <div>
            <label
              htmlFor="documents_verified_at"
              className="block text-sm font-medium text-gray-700"
            >
              Documents Verified At
            </label>
            <input
              type="datetime-local"
              id="documents_verified_at"
              name="documents_verified_at"
              value={formData.documents_verified_at}
              onChange={handleInputChange}
              disabled={loading || !canUpdate}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-gray-500">
              When documents were verified by the bank (triggers Active status)
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Document Flow
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Documents received from exporter/beneficiary</li>
                    <li>
                      Documents forwarded to issuing bank for verification
                    </li>
                    <li>Bank verifies documents (LC becomes Active)</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {canUpdate && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Document Tracking"}
              </button>
            </div>
          )}

          {isActive && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    LC is now active. All documents have been verified.
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

export default DocumentTrackingPanel;
