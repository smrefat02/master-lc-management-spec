import { useState, useEffect } from "react";
import SummaryCard from "../components/contracts/SummaryCard";
import ContractTable from "../components/contracts/ContractTable";
import { getContracts } from "../services/contractService";

export default function ContractsOverview() {
  const [contracts, setContracts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchContracts(currentPage);
  }, [currentPage]);

  const fetchContracts = async (page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContracts(page, 15);
      setContracts(data.contracts);
      setPagination(data.pagination);
      setSummary(data.summary);
    } catch (err) {
      setError("Failed to load contracts. Please try again.");
      console.error("Error fetching contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowContract = (id) => {
    // TODO: Navigate to contract detail page
    console.log("Show contract:", id);
  };

  const handleEditContract = (id) => {
    // TODO: Navigate to edit contract page
    console.log("Edit contract:", id);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US").format(value || 0);
  };

  if (loading && !contracts.length) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchContracts(currentPage)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Sales Contracts Management
            </h1>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Add New Contract
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <SummaryCard
              title="Total Contracts"
              value={formatNumber(summary.total_contracts)}
              description="All time"
            />
            <SummaryCard
              title="Total LC Value"
              value={formatCurrency(summary.total_value_usd)}
              description="USD"
            />
            <SummaryCard
              title="Total Order Quantity"
              value={formatNumber(summary.total_order_quantity)}
              description="Units"
            />
            <SummaryCard
              title="Avg B2B %"
              value={`${parseFloat(summary.avg_b2b_percent || 0).toFixed(2)}%`}
              description="Average"
            />
          </div>
        )}

        {/* Contracts Table */}
        <ContractTable
          contracts={contracts}
          pagination={pagination}
          onPageChange={handlePageChange}
          onShowContract={handleShowContract}
          onEditContract={handleEditContract}
        />
      </div>
    </div>
  );
}
