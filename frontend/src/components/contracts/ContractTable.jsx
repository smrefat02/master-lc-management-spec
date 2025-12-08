import StatusBadge from "./StatusBadge";

export default function ContractTable({
  contracts,
  pagination,
  onPageChange,
  onShowContract,
  onEditContract,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US").format(value || 0);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#2d3748]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Buyer Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Sales Contract
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Amendment Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Total Orders
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Order Quantity
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Master LC Value
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                B2B (%)
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contracts && contracts.length > 0 ? (
              contracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.buyer?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.contract_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(contract.amendment_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                    {formatNumber(contract.total_orders)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatNumber(contract.order_quantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {formatCurrency(contract.value_usd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className="text-teal-600">
                      {parseFloat(contract.b2b_percent || 0).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={contract.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onShowContract?.(contract.id)}
                      className="text-indigo-600 hover:text-indigo-800 mr-4 font-normal transition-colors"
                    >
                      Show
                    </button>
                    <button
                      onClick={() => onEditContract?.(contract.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-normal transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No contracts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange?.(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => onPageChange?.(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {(pagination.current_page - 1) * pagination.per_page + 1} /{" "}
                {pagination.total} contracts shown
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <nav
                className="relative z-0 inline-flex rounded-lg shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => onPageChange?.(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => onPageChange?.(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-gray-300 border-l-0 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
