import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MasterLCList() {
  const navigate = useNavigate();
  const [masterLCs, setMasterLCs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lcNumberFilter, setLcNumberFilter] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 15,
    lastPage: 1,
  });

  const fetchMasterLCs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lcNumberFilter) params.append("lc_number", lcNumberFilter);
      if (buyerFilter) params.append("buyer", buyerFilter);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", currentPage);
      params.append("per_page", 15);

      const response = await fetch(
        `http://127.0.0.1:8000/api/master-lc?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Master LCs");
      }

      const data = await response.json();

      setMasterLCs(data.data || []);
      setPagination({
        total: data.meta?.total || 0,
        perPage: data.meta?.per_page || 15,
        lastPage: data.meta?.last_page || 1,
      });
    } catch (error) {
      console.error("Error fetching Master LCs:", error);
      setMasterLCs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterLCs();
  }, [currentPage]);

  const handleAddMasterLC = () => {
    navigate("/master-lc/create");
  };

  const handleShowMasterLC = (id) => {
    navigate(`/master-lc/${id}`);
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchMasterLCs();
  };

  const handleReset = () => {
    setLcNumberFilter("");
    setBuyerFilter("");
    setStatusFilter("");
    setCurrentPage(1);
    setTimeout(() => {
      fetchMasterLCs();
    }, 100);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: "bg-gray-100 text-gray-700 border-gray-300",
      issued: "bg-blue-50 text-blue-700 border-blue-200",
      verified: "bg-green-50 text-green-700 border-green-200",
      active: "bg-teal-50 text-teal-700 border-teal-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      expired: "bg-orange-50 text-orange-700 border-orange-200",
      // Keep old statuses for backward compatibility
      submitted: "bg-blue-50 text-blue-700 border-blue-200",
      reviewed: "bg-purple-50 text-purple-700 border-purple-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
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
      month: "short",
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
          {/* Header with Title and Add Button */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Master LC List
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage Master Letters of Credit
              </p>
            </div>
            <button
              onClick={handleAddMasterLC}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Create Master LC
            </button>
          </div>

          {/* Filter Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  LC Number
                </label>
                <input
                  type="text"
                  value={lcNumberFilter}
                  onChange={(e) => setLcNumberFilter(e.target.value)}
                  placeholder="Search LC Number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Buyer
                </label>
                <input
                  type="text"
                  value={buyerFilter}
                  onChange={(e) => setBuyerFilter(e.target.value)}
                  placeholder="Search Buyer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="issued">Issued</option>
                  <option value="verified">Verified</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <button
                  onClick={handleFilter}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Filter
                </button>
              </div>

              <div>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset
                </button>
              </div>

              <div className="ml-auto text-sm text-gray-600">
                Total: {pagination.total}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    LC Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {masterLCs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No Master LCs found. Click "+ Create Master LC" to add
                      one.
                    </td>
                  </tr>
                ) : (
                  masterLCs.map((lc, index) => (
                    <tr
                      key={lc.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(currentPage - 1) * pagination.perPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                        {lc.lc_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {lc.buyer_info?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(lc.amount, lc.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {lc.currency}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(lc.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(lc.expiry_date)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleShowMasterLC(lc.id)}
                          className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          Show
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {pagination.lastPage}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pagination.lastPage, p + 1))
                  }
                  disabled={currentPage === pagination.lastPage}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
