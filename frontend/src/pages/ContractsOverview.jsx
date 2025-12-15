import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../components/contracts/SummaryCard";
import ContractTable from "../components/contracts/ContractTable";
import { AddContractModal } from "../components/contracts/AddContractModal";
import ViewContractModal from "../components/contracts/ViewContractModal";
import EditContractModal from "../components/contracts/EditContractModal";
import { getContracts, getContractById } from "../services/contractService";

export default function ContractsOverview() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchContracts(currentPage);
  }, [currentPage, searchTerm, statusFilter]);

  const fetchContracts = async (page) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        per_page: 15,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      };
      console.log(
        "[ContractsOverview] Fetching contracts with params:",
        params
      );
      const data = await getContracts(params);
      console.log("[ContractsOverview] Received data:", data);
      console.log(
        "[ContractsOverview] Contracts:",
        data.contracts?.length,
        "Summary:",
        data.summary
      );

      // Validate data structure
      if (!data || !data.contracts) {
        throw new Error("Invalid API response structure");
      }

      setContracts(data.contracts || []);
      setPagination(data.pagination || null);
      setSummary(data.summary || null);
      console.log("[ContractsOverview] State updated successfully");
    } catch (err) {
      setError("Failed to load contracts. Please try again.");
      console.error("[ContractsOverview] Error fetching contracts:", err);
      console.error(
        "[ContractsOverview] Error details:",
        err.message,
        err.response
      );
    } finally {
      console.log("[ContractsOverview] Setting loading to false");
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowContract = async (id) => {
    try {
      const data = await getContractById(id);
      setSelectedContract(data.contract);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error("Error fetching contract:", err);
      setError("Failed to load contract details.");
    }
  };

  const handleEditContract = async (id) => {
    try {
      const data = await getContractById(id);
      setSelectedContract(data.contract);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Error fetching contract:", err);
      setError("Failed to load contract details.");
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedContract(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedContract(null);
  };

  const handleContractUpdated = () => {
    // Refresh the contracts list
    fetchContracts(currentPage);
  };

  const handleAddContract = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleContractCreated = (newContract) => {
    // Refresh the contracts list
    fetchContracts(1);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCurrentPage(1);
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

  console.log("[ContractsOverview] Rendering with state:", {
    loading,
    contractsLength: contracts.length,
    hasError: !!error,
    hasSummary: !!summary,
    hasPagination: !!pagination,
  });

  if (loading && !contracts.length) {
    console.log("⏳ [ContractsOverview] Showing loading spinner");
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
    console.log("[ContractsOverview] Showing error state:", error);
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

  console.log("[ContractsOverview] Rendering main dashboard");
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
            <button className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-900 transition-colors">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Sales Contracts Overview
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Contracts, orders, shipments & master LC at a glance
            </p>
          </div>
          <button
            onClick={handleAddContract}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg transition-colors"
          >
            + Add New Contract
          </button>
        </div>
      </div>

      {/* Add Contract Modal */}
      <AddContractModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreated={handleContractCreated}
      />

      {/* Content */}
      <div className="px-8 py-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <SummaryCard
              title="TOTAL CONTRACTS"
              value={formatNumber(summary.total_contracts)}
              description="All active & closed contracts"
              color="blue"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            />
            <SummaryCard
              title="TOTAL LC VALUE"
              value={formatCurrency(summary.total_value_usd)}
              description="Total contract value (USD)"
              color="green"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <SummaryCard
              title="TOTAL ORDER QTY"
              value={formatNumber(summary.total_order_quantity)}
              description="Total garment quantity"
              color="purple"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              }
            />
            <SummaryCard
              title="AVERAGE B2B"
              value={`${parseFloat(summary.avg_b2b_percent || 0).toFixed(2)}%`}
              description="Overall B2B percentage"
              color="orange"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              }
            />
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search contracts
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search buyer / contract no..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <label htmlFor="status" className="sr-only">
                Filter by status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">All status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Filter & Reset Buttons */}
            <div className="flex gap-2">
              <button className="px-5 py-2.5 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors">
                Filter
              </button>
              {(searchTerm || statusFilter) && (
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!loading && contracts.length === 0 && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No contracts found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating a new contract."}
            </p>
            {(searchTerm || statusFilter) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Contracts Table */}
        {contracts.length > 0 && (
          <ContractTable
            contracts={contracts}
            pagination={pagination}
            onPageChange={handlePageChange}
            onShowContract={handleShowContract}
            onEditContract={handleEditContract}
          />
        )}
      </div>

      {/* Modals */}
      <ViewContractModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        contract={selectedContract}
      />

      <EditContractModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        contract={selectedContract}
        onUpdated={handleContractUpdated}
      />
    </div>
  );
}
