import { useState, useEffect } from "react";

export default function EditShipmentModal({
  isOpen,
  onClose,
  shipmentId,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [formData, setFormData] = useState({
    contractId: "",
    orderId: "",
    buyerName: "",
    salesContract: "",
    orderNumber: "",
    shippingDate: "",
    shipmentQty: "",
    shipmentValue: "",
    referenceNo: "",
    remarks: "",
  });

  useEffect(() => {
    if (isOpen && shipmentId) {
      fetchShipmentDetails();
      fetchContracts();
      fetchOrders();
    }
  }, [isOpen, shipmentId]);

  useEffect(() => {
    if (formData.contractId) {
      const filtered = orders.filter(
        (order) => order.contract_id === parseInt(formData.contractId)
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders([]);
    }
  }, [formData.contractId, orders]);

  const fetchShipmentDetails = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/shipments/${shipmentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch shipment");

      const shipment = await response.json();

      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      setFormData({
        contractId: shipment.contract_id || "",
        orderId: shipment.order_id || "",
        buyerName: shipment.buyer_name || "",
        salesContract: shipment.sales_contract || "",
        orderNumber: shipment.order_number || "",
        shippingDate: formatDateForInput(shipment.shipping_date),
        shipmentQty: shipment.shipment_qty || "",
        shipmentValue: shipment.shipment_value || "",
        referenceNo: shipment.reference_no || "",
        remarks: shipment.remarks || "",
      });
    } catch (error) {
      console.error("Error fetching shipment:", error);
      alert("Failed to load shipment details");
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/contracts");
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/orders");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateShipment = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/shipments/${shipmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            salesContract: formData.contractId,
            order: formData.orderId,
            shippingDate: formData.shippingDate,
            shipmentQty: formData.shipmentQty,
            shipmentValue: formData.shipmentValue,
            referenceNo: formData.referenceNo,
            remarks: formData.remarks,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update shipment");

      alert("Shipment updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating shipment:", error);
      alert("Failed to update shipment");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Edit Shipment</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="bg-white px-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Sales Contract */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sales Contract
                </label>
                <select
                  name="contractId"
                  value={formData.contractId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">— Select contract —</option>
                  {contracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.contract_no} —{" "}
                      {contract.buyer?.name || "Unknown"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <select
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  disabled={!formData.contractId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select contract first...</option>
                  {filteredOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_number}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipping Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Date
                </label>
                <input
                  type="date"
                  name="shippingDate"
                  value={formData.shippingDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Shipment Qty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Qty
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="shipmentQty"
                  value={formData.shipmentQty}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Shipment Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Value (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="shipmentValue"
                  value={formData.shipmentValue}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Reference No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference No
                </label>
                <input
                  type="text"
                  name="referenceNo"
                  value={formData.referenceNo}
                  onChange={handleInputChange}
                  placeholder="BL / Invoice / Internal ref"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Remarks - Full Width */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateShipment}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
