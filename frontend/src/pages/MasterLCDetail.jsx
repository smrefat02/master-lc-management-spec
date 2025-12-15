import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WorkflowTimeline from "../components/WorkflowTimeline";
import WorkflowActions from "../components/WorkflowActions";
import WorkflowDiagram from "../components/WorkflowDiagram";
import IssuingBankPanel from "../components/masterLc/IssuingBankPanel";
import AdvisingBankPanel from "../components/masterLc/AdvisingBankPanel";
import DocumentTrackingPanel from "../components/masterLc/DocumentTrackingPanel";
import masterLCService from "../services/masterLCService";

export default function MasterLCDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [masterLC, setMasterLC] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchMasterLC();
  }, [id]);

  const fetchMasterLC = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/master-lc/${id}`);
      if (!response.ok) throw new Error("Failed to fetch Master LC");
      const data = await response.json();
      if (data.success) {
        setMasterLC(data.data);
        // Fetch timeline for v3.0 workflow
        fetchTimeline();
      }
    } catch (error) {
      console.error("Error fetching Master LC:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const response = await masterLCService.getTimeline(id);
      if (response.success) {
        setTimeline(response.data);
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      const body = { status: newStatus };
      if (newStatus === "cancelled") {
        body.reason = cancelReason;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/master-lc/${id}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMasterLC(data.data);
        setShowCancelModal(false);
        setCancelReason("");
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this Master LC?")) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/master-lc/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        navigate("/master-lc");
      } else {
        alert(data.message || "Failed to delete Master LC");
      }
    } catch (error) {
      console.error("Error deleting Master LC:", error);
      alert("Failed to delete Master LC");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: "bg-gray-100 text-gray-700 border-gray-300",
      applied: "bg-blue-100 text-blue-700 border-blue-200",
      issued_by_issuing_bank: "bg-indigo-100 text-indigo-700 border-indigo-200",
      verified_by_advising_bank:
        "bg-purple-100 text-purple-700 border-purple-200",
      goods_shipped: "bg-cyan-100 text-cyan-700 border-cyan-200",
      documents_received: "bg-teal-100 text-teal-700 border-teal-200",
      documents_forwarded: "bg-emerald-100 text-emerald-700 border-emerald-200",
      documents_verified: "bg-lime-100 text-lime-700 border-lime-200",
      active: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      expired: "bg-orange-100 text-orange-700 border-orange-200",
      // Keep old statuses for backward compatibility
      issued: "bg-blue-50 text-blue-700 border-blue-200",
      verified: "bg-green-50 text-green-700 border-green-200",
      submitted: "bg-blue-50 text-blue-700 border-blue-200",
      reviewed: "bg-purple-50 text-purple-700 border-purple-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
          statusStyles[status] || statusStyles.draft
        }`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!masterLC) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Master LC not found
          </h2>
          <button
            onClick={() => navigate("/master-lc")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
        <div className="bg-white rounded-lg shadow max-w-5xl mx-auto">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {masterLC.lc_number}
                </h2>
                {getStatusBadge(masterLC.lc_status || masterLC.status)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Created on {formatDate(masterLC.created_at)}
              </p>
              {masterLC.lc_status && (
                <p className="text-xs text-gray-500 mt-1">
                  Status:{" "}
                  {masterLC.lc_status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/master-lc")}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to List
              </button>
              {masterLC.status === "draft" && (
                <>
                  <button
                    onClick={() => navigate(`/master-lc/${id}/edit`)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Section A: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                A. Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    LC Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    {masterLC.lc_number}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    LC Number Mode
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.lc_number_mode === "auto"
                      ? "Auto-generated"
                      : "Manual"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Issue Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(masterLC.issue_date)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Expiry Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(masterLC.expiry_date)}
                  </p>
                </div>
                {masterLC.contract && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Contract
                    </label>
                    <p className="mt-1 text-sm text-indigo-600">
                      {masterLC.contract.contract_number}
                    </p>
                  </div>
                )}
                {masterLC.order && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Order
                    </label>
                    <p className="mt-1 text-sm text-indigo-600">
                      {masterLC.order.order_number ||
                        `Order #${masterLC.order.id}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section B: Buyer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                B. Buyer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Buyer Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.buyer_info?.name || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Country
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.buyer_info?.country || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Contact Person
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.buyer_info?.contact_person || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.buyer_info?.address || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Section C: Beneficiary Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                C. Beneficiary Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Bank Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.beneficiary_info?.bank_name || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Account Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.bank_info?.account_number || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    SWIFT Code
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.bank_info?.swift_code || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Branch
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.bank_info?.branch || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Section D: LC Amount & Currency */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                D. LC Amount & Currency
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Amount
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatCurrency(masterLC.amount, masterLC.currency)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Currency
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.currency}
                  </p>
                </div>
                {masterLC.exchange_rate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Exchange Rate
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {masterLC.exchange_rate}
                    </p>
                  </div>
                )}
              </div>

              {/* Required Documents */}
              {masterLC.required_documents &&
                masterLC.required_documents.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Required Documents
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {masterLC.required_documents.map((doc, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Terms and Conditions */}
              {masterLC.terms_and_conditions && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Terms & Conditions
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {masterLC.terms_and_conditions}
                  </p>
                </div>
              )}
            </div>

            {/* v3.0 Workflow Section */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  LC Workflow (v3.0)
                </h3>
                <WorkflowActions
                  masterLC={masterLC}
                  onUpdate={(updatedLC) => {
                    setMasterLC(updatedLC);
                    fetchTimeline();
                  }}
                />
              </div>

              {/* Visual Workflow Diagram */}
              <WorkflowDiagram masterLC={masterLC} />

              {/* v3.0 Workflow Timeline */}
              <WorkflowTimeline timeline={timeline} />

              {/* Banking Information Display */}
              {(masterLC.issuing_bank_id || masterLC.advising_bank_id) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-blue-900">
                    Banking Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {masterLC.issuing_bank && (
                      <div>
                        <label className="block text-blue-700 font-medium mb-1">
                          Issuing Bank
                        </label>
                        <p className="text-blue-900">
                          {masterLC.issuing_bank.name}
                        </p>
                        {masterLC.issuing_bank_reference_no && (
                          <p className="text-blue-700 text-xs mt-1">
                            Ref: {masterLC.issuing_bank_reference_no}
                          </p>
                        )}
                        {masterLC.issuing_bank_issue_date && (
                          <p className="text-blue-700 text-xs">
                            Issued:{" "}
                            {formatDate(masterLC.issuing_bank_issue_date)}
                          </p>
                        )}
                      </div>
                    )}
                    {masterLC.advising_bank && (
                      <div>
                        <label className="block text-blue-700 font-medium mb-1">
                          Advising Bank
                        </label>
                        <p className="text-blue-900">
                          {masterLC.advising_bank.name}
                        </p>
                        {masterLC.advising_bank_verification_status && (
                          <p className="text-blue-700 text-xs mt-1">
                            Status: {masterLC.advising_bank_verification_status}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipment Information */}
              {masterLC.goods_shipped_at && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-cyan-900">
                    Shipment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {masterLC.shipping_date && (
                      <div>
                        <label className="block text-cyan-700 font-medium">
                          Shipping Date
                        </label>
                        <p className="text-cyan-900">
                          {formatDate(masterLC.shipping_date)}
                        </p>
                      </div>
                    )}
                    {masterLC.carrier && (
                      <div>
                        <label className="block text-cyan-700 font-medium">
                          Carrier
                        </label>
                        <p className="text-cyan-900">{masterLC.carrier}</p>
                      </div>
                    )}
                    {masterLC.bill_of_lading_no && (
                      <div>
                        <label className="block text-cyan-700 font-medium">
                          Bill of Lading
                        </label>
                        <p className="text-cyan-900">
                          {masterLC.bill_of_lading_no}
                        </p>
                      </div>
                    )}
                    {masterLC.vessel_name && (
                      <div>
                        <label className="block text-cyan-700 font-medium">
                          Vessel Name
                        </label>
                        <p className="text-cyan-900">{masterLC.vessel_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Tracking */}
              {masterLC.received_documents &&
                masterLC.received_documents.length > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-teal-900">
                      Documents Received
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {masterLC.received_documents.map((doc, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Legacy Banking Workflow Panels (v2.0) */}
              <div className="border-t pt-4">
                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                    Legacy Banking Workflow (v2.0) - Click to expand
                  </summary>
                  <div className="mt-4 space-y-4">
                    <IssuingBankPanel
                      masterLc={masterLC}
                      onUpdate={fetchMasterLC}
                    />
                    <AdvisingBankPanel
                      masterLc={masterLC}
                      onUpdate={fetchMasterLC}
                    />
                    <DocumentTrackingPanel
                      masterLc={masterLC}
                      onUpdate={fetchMasterLC}
                    />
                  </div>
                </details>
              </div>
            </div>

            {/* Attachments */}
            {masterLC.attachments && masterLC.attachments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Attachments
                </h3>
                <div className="space-y-2">
                  {masterLC.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.original_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <a
                        href={`http://127.0.0.1:8000/api/master-lc/${id}/attachment/${attachment.id}/download`}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Audit Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Created By
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {masterLC.created_by || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Created At
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(masterLC.created_at)}
                  </p>
                </div>
                {masterLC.approved_by && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Approved By
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {masterLC.approved_by}
                    </p>
                  </div>
                )}
                {masterLC.cancellation_reason && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500">
                      Cancellation Reason
                    </label>
                    <p className="mt-1 text-sm text-red-600">
                      {masterLC.cancellation_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Actions (v2.0 only) */}
            {!masterLC.lc_status &&
              masterLC.status !== "cancelled" &&
              masterLC.status !== "expired" && (
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900">
                    Status Actions
                  </h3>
                  <div className="flex gap-2">
                    {masterLC.status === "draft" && (
                      <button
                        onClick={() => handleStatusChange("submitted")}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Submit for Review
                      </button>
                    )}
                    {masterLC.status === "submitted" && (
                      <button
                        onClick={() => handleStatusChange("reviewed")}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        Mark as Reviewed
                      </button>
                    )}
                    {masterLC.status === "reviewed" && (
                      <>
                        <button
                          onClick={() => handleStatusChange("approved")}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange("draft")}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          Send Back to Draft
                        </button>
                      </>
                    )}
                    {masterLC.status === "approved" && (
                      <button
                        onClick={() => handleStatusChange("active")}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Cancel LC
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Cancel Master LC
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel this Master LC? This action
                cannot be undone.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleStatusChange("cancelled")}
                disabled={actionLoading || !cancelReason.trim()}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
