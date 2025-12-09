import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddShipmentModal from "../components/shipments/AddShipmentModal";
import EditShipmentModal from "../components/shipments/EditShipmentModal";

export default function ShipmentsOverview() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState({
    total_shipments: 0,
    total_shipped_qty: 0,
    total_shipment_value: 0,
    avg_shipment_qty: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  useEffect(() => {
    fetchShipments();
  }, [searchTerm, currentPage]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", currentPage);

      const response = await fetch(
        `http://127.0.0.1:8000/api/shipments?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch shipments");
      }

      const data = await response.json();

      const transformedShipments = data.shipments.map((shipment) => ({
        id: shipment.id,
        buyer: shipment.buyer_name,
        salesContract: shipment.sales_contract,
        order: shipment.order_number,
        shippingDate: shipment.shipping_date,
        shipmentQty: shipment.shipment_qty,
        shipmentValue: shipment.shipment_value,
        referenceNo: shipment.reference_no,
      }));

      setShipments(transformedShipments);
      setSummary(data.summary);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShipment = () => {
    setShowAddModal(true);
  };

  const handleViewShipment = (id) => {
    navigate(`/shipments/${id}`);
  };

  const handleEditShipment = (id) => {
    setSelectedShipmentId(id);
    setShowEditModal(true);
  };

  const handleShipmentCreated = () => {
    setShowAddModal(false);
    fetchShipments();
  };

  const handleShipmentUpdated = () => {
    setShowEditModal(false);
    setSelectedShipmentId(null);
    fetchShipments();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (value) => {
    return `$${parseFloat(value).toFixed(2)}`;
  };

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
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Shipments Overview
            </h2>
            <p className="text-gray-600 mt-1">
              Shipments against sales contracts & orders at a glance
            </p>
          </div>
          <button
            onClick={handleAddShipment}
            className="px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Shipment
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">
              Total Shipments
            </p>
            <p className="text-3xl font-bold text-blue-900">
              {summary.total_shipments}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2">
              Total Shipped Qty
            </p>
            <p className="text-3xl font-bold text-green-900">
              {summary.total_shipped_qty}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2">
              Total Shipment Value
            </p>
            <p className="text-3xl font-bold text-purple-900">
              {formatCurrency(summary.total_shipment_value)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-6">
            <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-2">
              Avg Shipment Qty
            </p>
            <p className="text-3xl font-bold text-orange-900">
              {summary.avg_shipment_qty}
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <input
              type="text"
              placeholder="Search buyer / contract / order / reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={fetchShipments}
              className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Filter
            </button>
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="text-sm text-gray-600">Page {currentPage} of 1</div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#2d3748]">
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Sales Contract
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Shipping Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Shipment Qty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Shipment Value
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Reference No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : shipments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No shipments found
                    </td>
                  </tr>
                ) : (
                  shipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {shipment.buyer}
                      </td>
                      <td className="px-6 py-4 text-sm text-indigo-600 font-medium">
                        {shipment.salesContract}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {shipment.order}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(shipment.shippingDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {shipment.shipmentQty}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {formatCurrency(shipment.shipmentValue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {shipment.referenceNo || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewShipment(shipment.id)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditShipment(shipment.id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {shipments.length} / {summary.total_shipments} shipments shown
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Shipment Modal */}
      {showAddModal && (
        <AddShipmentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleShipmentCreated}
        />
      )}

      {/* Edit Shipment Modal */}
      {showEditModal && selectedShipmentId && (
        <EditShipmentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedShipmentId(null);
          }}
          shipmentId={selectedShipmentId}
          onSuccess={handleShipmentUpdated}
        />
      )}
    </div>
  );
}
