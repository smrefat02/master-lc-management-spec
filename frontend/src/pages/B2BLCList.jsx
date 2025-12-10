import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function B2BLCList() {
  const navigate = useNavigate();
  const [b2blcs, setB2blcs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [piNumberFilter, setPiNumberFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 15,
    lastPage: 1,
  });

  // Manual fetch - only triggered by Filter button
  const fetchB2BLCs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (piNumberFilter) params.append("pi_number", piNumberFilter);
      if (supplierFilter) params.append("supplier", supplierFilter);
      params.append("page", currentPage);
      params.append("per_page", 15);

      const response = await fetch(
        `http://127.0.0.1:8000/api/b2b-lc?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch B2B LCs");
      }

      const data = await response.json();

      setB2blcs(data.data || []);
      setPagination({
        total: data.total,
        perPage: data.per_page,
        lastPage: data.last_page,
      });
    } catch (error) {
      console.error("Error fetching B2B LCs:", error);
      setB2blcs([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchB2BLCs();
  }, [currentPage]);

  const handleAddB2BLC = () => {
    navigate("/b2b-lc/create");
  };

  const handleShowB2BLC = (id) => {
    navigate(`/b2b-lc/${id}`);
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchB2BLCs();
  };

  const handleReset = () => {
    setPiNumberFilter("");
    setSupplierFilter("");
    setCurrentPage(1);
    // Fetch immediately after reset
    setTimeout(() => {
      fetchB2BLCs();
    }, 100);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: "bg-gray-100 text-gray-700 border-gray-300",
      active: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-green-50 text-green-700 border-green-200",
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
                B2B LC List
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                PI / Supplier filter + Costing, Order & Contract info
              </p>
            </div>
            <button
              onClick={handleAddB2BLC}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Create B2B LC
            </button>
          </div>

          {/* Filter Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  PI Number
                </label>
                <input
                  type="text"
                  value={piNumberFilter}
                  onChange={(e) => setPiNumberFilter(e.target.value)}
                  placeholder="Search PI..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Supplier
                </label>
                <input
                  type="text"
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  placeholder="Search Supplier..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PI Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount ($)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    B2B %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Costing Detail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Director Sir Command
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {b2blcs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No B2B LC records found
                    </td>
                  </tr>
                ) : (
                  b2blcs.map((b2blc, index) => (
                    <tr
                      key={b2blc.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-center text-gray-500">
                        {(currentPage - 1) * pagination.perPage + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {b2blc.pi_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {b2blc.supplier}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-indigo-600 font-semibold">
                        ${parseFloat(b2blc.post_pi_value).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        {parseFloat(b2blc.b2b_percent).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {b2blc.costing_detail_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {b2blc.order?.order_number || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {b2blc.contract?.contract_no || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(b2blc.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {b2blc.director_command ? (
                          <span className="line-clamp-2">
                            {b2blc.director_command}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleShowB2BLC(b2blc.id)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {b2blcs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pagination.perPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pagination.perPage, pagination.total)}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span>{" "}
                results
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.lastPage)
                    )
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
