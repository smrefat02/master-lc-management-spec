import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ShipmentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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
    fetchShipmentDetails();
    fetchContracts();
    fetchOrders();
  }, [id]);

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
      const response = await fetch(`http://127.0.0.1:8000/api/shipments/${id}`);
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
    } finally {
      setLoading(false);
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
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/shipments/${id}`,
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
      setIsEditing(false);
      fetchShipmentDetails();
    } catch (error) {
      console.error("Error updating shipment:", error);
      alert("Failed to update shipment");
    }
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

      {/* Page Header */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Shipment Details
            </h2>
            <p className="text-gray-600 mt-1">
              View & update shipment information
            </p>
          </div>
          <button
            onClick={() => navigate("/shipments")}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Shipments
          </button>
        </div>

        {/* Shipment Information Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">
              Shipment Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Sales Contract */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sales Contract
                </label>
                {isEditing ? (
                  <select
                    name="contractId"
                    value={formData.contractId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">— Select contract —</option>
                    {contracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.contract_no}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {formData.salesContract || "—"}
                  </p>
                )}
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                {isEditing ? (
                  <select
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    disabled={!formData.contractId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Select contract first...</option>
                    {filteredOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_number}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {formData.orderNumber || "—"}
                  </p>
                )}
              </div>

              {/* Buyer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Name
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {formData.buyerName || "—"}
                </p>
              </div>

              {/* Shipping Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="shippingDate"
                    value={formData.shippingDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {formData.shippingDate || "—"}
                  </p>
                )}
              </div>

              {/* Shipment Qty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Qty
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="1"
                    min="0"
                    name="shipmentQty"
                    value={formData.shipmentQty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {formData.shipmentQty || "0"}
                  </p>
                )}
              </div>

              {/* Shipment Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Value (USD)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    name="shipmentValue"
                    value={formData.shipmentValue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    ${parseFloat(formData.shipmentValue || 0).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Reference No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference No
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="referenceNo"
                    value={formData.referenceNo}
                    onChange={handleInputChange}
                    placeholder="BL / Invoice / Internal ref"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {formData.referenceNo || "—"}
                  </p>
                )}
              </div>
            </div>

            {/* Remarks - Full Width */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              {isEditing ? (
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[80px]">
                  {formData.remarks || "—"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchShipmentDetails();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateShipment}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Update Shipment
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Edit Shipment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
