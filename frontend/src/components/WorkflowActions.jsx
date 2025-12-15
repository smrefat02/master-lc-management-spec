import React, { useState, useEffect } from "react";
import masterLCService from "../services/masterLCService";
import { banksAPI } from "../services/api";

const WorkflowActions = ({ masterLC, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [formData, setFormData] = useState({});
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const response = await banksAPI.getAll();
      if (response.success) {
        setBanks(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch banks:", error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const getNextAction = () => {
    const status = masterLC?.lc_status;

    const actions = {
      draft: { label: "Apply for LC", action: "apply", color: "blue" },
      applied: { label: "Issue LC", action: "issue", color: "indigo" },
      issued_by_issuing_bank: {
        label: "Verify LC",
        action: "advise",
        color: "purple",
      },
      verified_by_advising_bank: {
        label: "Ship Goods",
        action: "shipGoods",
        color: "cyan",
      },
      goods_shipped: {
        label: "Receive Documents",
        action: "receiveDocuments",
        color: "teal",
      },
      documents_received: {
        label: "Forward Documents",
        action: "forwardDocuments",
        color: "emerald",
      },
      documents_forwarded: {
        label: "Verify Documents",
        action: "verifyDocuments",
        color: "lime",
      },
      documents_verified: {
        label: "Activate LC",
        action: "activate",
        color: "green",
      },
    };

    return actions[status] || null;
  };

  const canReject = () => {
    const terminalStates = ["active", "expired", "rejected"];
    return !terminalStates.includes(masterLC?.lc_status);
  };

  const handleAction = (action) => {
    const configs = {
      apply: {
        title: "Apply for LC",
        fields: [
          {
            name: "applicant_remarks",
            label: "Remarks (Optional)",
            type: "textarea",
          },
        ],
      },
      issue: {
        title: "Issue LC",
        fields: [
          {
            name: "issuing_bank_id",
            label: "Issuing Bank",
            type: "select",
            required: true,
            options: banks.map((bank) => ({
              value: bank.id,
              label: `${bank.name} (${bank.swift_code})`,
            })),
          },
          {
            name: "issuing_bank_reference_no",
            label: "Reference Number",
            type: "text",
            required: true,
          },
          {
            name: "issuing_bank_issue_date",
            label: "Issue Date",
            type: "date",
            required: true,
          },
          {
            name: "advising_bank_id",
            label: "Advising Bank (Optional)",
            type: "select",
            options: banks.map((bank) => ({
              value: bank.id,
              label: `${bank.name} (${bank.swift_code})`,
            })),
          },
          { name: "issuer_remarks", label: "Remarks", type: "textarea" },
        ],
      },
      advise: {
        title: "Verify LC",
        fields: [
          {
            name: "advising_bank_id",
            label: "Advising Bank",
            type: "select",
            required: true,
            options: banks.map((bank) => ({
              value: bank.id,
              label: `${bank.name} (${bank.swift_code})`,
            })),
          },
          {
            name: "advising_bank_verification_status",
            label: "Status",
            type: "select",
            options: [
              { value: "verified", label: "Verified" },
              { value: "rejected", label: "Rejected" },
            ],
            required: true,
          },
          { name: "advisor_remarks", label: "Remarks", type: "textarea" },
        ],
      },
      shipGoods: {
        title: "Record Goods Shipment",
        fields: [
          {
            name: "shipping_date",
            label: "Shipping Date",
            type: "date",
            required: true,
          },
          { name: "carrier", label: "Carrier", type: "text", required: true },
          {
            name: "bill_of_lading_no",
            label: "Bill of Lading No.",
            type: "text",
            required: true,
          },
          { name: "vessel_name", label: "Vessel Name", type: "text" },
          { name: "port_of_loading", label: "Port of Loading", type: "text" },
          {
            name: "port_of_discharge",
            label: "Port of Discharge",
            type: "text",
          },
          { name: "shipper_remarks", label: "Remarks", type: "textarea" },
        ],
      },
      receiveDocuments: {
        title: "Receive Documents",
        fields: [
          {
            name: "received_documents",
            label: "Documents Received",
            type: "multiselect",
            options: [
              "Commercial Invoice",
              "Packing List",
              "Bill of Lading",
              "Certificate of Origin",
              "Insurance Certificate",
              "Inspection Certificate",
            ],
            required: true,
          },
          { name: "receiver_remarks", label: "Remarks", type: "textarea" },
        ],
      },
      forwardDocuments: {
        title: "Forward Documents",
        fields: [
          { name: "forwarder_remarks", label: "Remarks", type: "textarea" },
        ],
      },
      verifyDocuments: {
        title: "Verify Documents",
        fields: [
          {
            name: "verification_status",
            label: "Status",
            type: "select",
            options: [
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ],
            required: true,
          },
          {
            name: "discrepancies",
            label: "Discrepancies (if any)",
            type: "textarea",
          },
          { name: "verifier_remarks", label: "Remarks", type: "textarea" },
        ],
      },
      reject: {
        title: "Reject LC",
        fields: [
          {
            name: "rejection_reason",
            label: "Rejection Reason",
            type: "textarea",
            required: true,
          },
        ],
      },
    };

    setModalConfig(configs[action] || {});
    setFormData({});
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Map modal title to action name
      const actionMap = {
        "Apply for LC": "apply",
        "Issue LC": "issue",
        "Verify LC": "advise",
        "Record Goods Shipment": "shipGoods",
        "Receive Documents": "receiveDocuments",
        "Forward Documents": "forwardDocuments",
        "Verify Documents": "verifyDocuments",
        "Activate LC": "activate",
        "Reject LC": "reject",
      };

      const action = modalConfig.title ? actionMap[modalConfig.title] : null;

      let result;
      const id = masterLC.id;

      if (!action) {
        alert("Unknown action: " + modalConfig.title);
        return;
      }

      console.log(`Executing action: ${action}`);

      switch (action) {
        case "apply":
          result = await masterLCService.apply(id, formData);
          break;
        case "issue":
          result = await masterLCService.issue(id, formData);
          break;
        case "advise":
          result = await masterLCService.advise(id, formData);
          break;
        case "shipGoods":
          result = await masterLCService.shipGoods(id, formData);
          break;
        case "receiveDocuments":
          result = await masterLCService.receiveDocuments(id, formData);
          break;
        case "forwardDocuments":
          result = await masterLCService.forwardDocuments(id, formData);
          break;
        case "verifyDocuments":
          result = await masterLCService.verifyDocuments(id, formData);
          break;
        case "activate":
          result = await masterLCService.activate(id);
          break;
        case "reject":
          result = await masterLCService.reject(id, formData);
          break;
        default:
          throw new Error(`Invalid action: ${action}`);
      }

      console.log("=== API Response Debug ===");
      console.log("Type:", typeof result);
      console.log("Result:", result);
      console.log("Has success?", result?.success);
      console.log("Has data?", result?.data);
      console.log("Has id?", result?.id);

      setShowModal(false);
      setFormData({});

      // Handle response - check if we have the expected format
      if (result?.success === true && result?.data) {
        console.log("[Success] Path 1: Success with data");
        if (onUpdate) onUpdate(result.data);
      } else if (result?.data) {
        console.log("[Success] Path 2: Data without success flag");
        if (onUpdate) onUpdate(result.data);
      } else if (result?.id) {
        console.log("[Success] Path 3: Direct LC object");
        if (onUpdate) onUpdate(result);
      } else {
        console.error("[Error] Unexpected format:", result);
        alert(
          "Action may have completed but response format unexpected. Check console and refresh page."
        );
      }
    } catch (error) {
      console.error("Workflow action error:", error);

      // Better error messages
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Action failed";

      alert(errorMessage);

      // Log validation errors if present
      if (error.response?.data?.errors) {
        console.error("Validation errors:", error.response.data.errors);
        const validationMessages = Object.values(error.response.data.errors)
          .flat()
          .join("\n");
        alert(`Validation Error:\n${validationMessages}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!confirm("Are you sure you want to activate this LC?")) {
      return;
    }

    try {
      setLoading(true);
      const result = await masterLCService.activate(masterLC.id);

      console.log("=== Activate Response ===");
      console.log("Result:", result);

      if (result?.success || result?.data || result?.id) {
        alert("LC activated successfully!");
        if (onUpdate) {
          onUpdate(result.data || result);
        }
      } else {
        alert("LC activation completed but response format unexpected");
      }
    } catch (error) {
      console.error("Activate error:", error);

      let errorMessage = "Failed to activate LC";

      if (error.response?.data?.errors) {
        // Show validation errors
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join("\n");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextAction = getNextAction();

  // Map colors to full Tailwind classes (Tailwind doesn't support dynamic class generation)
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    cyan: "bg-cyan-600 hover:bg-cyan-700",
    teal: "bg-teal-600 hover:bg-teal-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    lime: "bg-lime-600 hover:bg-lime-700",
    green: "bg-green-600 hover:bg-green-700",
  };

  return (
    <div className="flex gap-2">
      {nextAction && (
        <button
          onClick={() =>
            nextAction.action === "activate"
              ? handleActivate()
              : handleAction(nextAction.action)
          }
          disabled={loading}
          className={`px-4 py-2 text-white rounded ${
            colorClasses[nextAction.color] || "bg-blue-600 hover:bg-blue-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading && nextAction.action === "activate"
            ? "Activating..."
            : nextAction.label}
        </button>
      )}

      {canReject() && (
        <button
          onClick={() => handleAction("reject")}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reject LC
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{modalConfig.title}</h3>

            <div className="space-y-4">
              {modalConfig.fields?.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      className="w-full border rounded p-2"
                      rows={3}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                    />
                  ) : field.type === "select" ? (
                    <select
                      className="w-full border rounded p-2"
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                      disabled={loadingBanks && field.name.includes("bank")}
                    >
                      <option value="">
                        {loadingBanks && field.name.includes("bank")
                          ? "Loading banks..."
                          : "Select..."}
                      </option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "multiselect" ? (
                    <div className="space-y-2 border rounded p-3 max-h-48 overflow-y-auto">
                      {field.options?.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={(formData[field.name] || []).includes(
                              option
                            )}
                            onChange={(e) => {
                              const currentValues = formData[field.name] || [];
                              const newValues = e.target.checked
                                ? [...currentValues, option]
                                : currentValues.filter((v) => v !== option);
                              setFormData({
                                ...formData,
                                [field.name]: newValues,
                              });
                            }}
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      className="w-full border rounded p-2"
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Submit"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowActions;
