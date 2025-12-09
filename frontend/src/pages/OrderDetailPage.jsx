import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    buyerName: "",
    masterLCValue: "0.00",
    budgetNo: "",
    orderNumber: "",
    orderValue: "0.00",
    description: "",
    contractNo: "",
    status: "draft",
    style: "",
    fobValue: "0.00",
    orderQty: "0",
    shipmentDate: "",
    actualShipment: "",
    fabricsDetails: "",
    notes: "",
  });

  const [costDetails, setCostDetails] = useState([]);
  const [totals, setTotals] = useState({
    fabricsPreCosting: 0,
    fabricsBudget: 0,
    accessoriesPreCosting: 0,
    accessoriesBudget: 0,
    totalPreCosting: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${id}`);
      if (!response.ok) throw new Error("Failed to fetch order");

      const order = await response.json();

      // Helper function to convert date to YYYY-MM-DD format
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
        buyerName: order.buyer_name || "",
        masterLCValue: order.master_lc_value || "0.00",
        budgetNo: order.budget_no || "",
        orderNumber: order.order_number || "",
        orderValue: order.order_value || "0.00",
        description: order.description || "",
        contractNo: order.contract_no || "",
        status: order.status || "draft",
        style: order.style || "",
        fobValue: order.fob_value || "0.00",
        orderQty: order.order_qty || "0",
        shipmentDate: formatDateForInput(order.shipment_date),
        actualShipment: formatDateForInput(order.actual_shipment),
        fabricsDetails: order.fabrics_details || "",
        notes: order.notes || "",
      });

      setCostDetails(order.cost_details || []);
      setTotals(
        order.totals || {
          fabricsPreCosting: 0,
          fabricsBudget: 0,
          accessoriesPreCosting: 0,
          accessoriesBudget: 0,
          totalPreCosting: 0,
          totalBudget: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCostDetailChange = (id, field, value) => {
    setCostDetails((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteCostDetail = (id) => {
    if (!isEditing) return;
    if (window.confirm("Are you sure you want to delete this cost item?")) {
      setCostDetails((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleUpdateOrder = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...formData,
          costDetails: costDetails,
          totals: totals,
        }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      alert("Order updated successfully!");
      setIsEditing(false);
      fetchOrderDetails();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
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
      <div className="bg-white px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Order Details — {formData.orderNumber}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              View & update order information and costing details
            </p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            ← Back to Contract
          </button>
        </div>
      </div>

      {/* Order Information */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <table className="min-w-full table-fixed">
              <colgroup>
                <col style={{ width: "15%" }} />
                <col style={{ width: "28%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "22%" }} />
              </colgroup>
              <tbody className="divide-y divide-gray-300">
                {/* Row 1 */}
                <tr>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Buyer Name
                  </td>
                  <td className="px-4 py-2.5 bg-white border-r border-gray-300">
                    <input
                      type="text"
                      name="buyerName"
                      value={formData.buyerName}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className="w-full px-2 py-1 bg-white border-0 text-sm focus:outline-none"
                    />
                  </td>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Master LC Value:
                  </td>
                  <td className="px-4 py-2.5 bg-white border-r border-gray-300">
                    <input
                      type="text"
                      name="masterLCValue"
                      value={formData.masterLCValue}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className="w-full px-2 py-1 bg-white border-0 text-sm focus:outline-none text-right"
                    />
                  </td>
                  <td className="px-4 py-2.5 bg-white" rowSpan="9">
                    <div className="border border-gray-300 rounded-md overflow-hidden bg-white h-full p-4">
                      <h3 className="text-xs font-semibold text-gray-700 py-2 uppercase text-center border-b border-gray-300 bg-gray-50 -mx-4 -mt-4 mb-4">
                        BEFORE & AFTER POST COST (Report)
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-red-700 mb-2">
                              BEFORE POST COST
                            </p>
                            <div className="space-y-1 text-xs">
                              <p className="flex justify-between">
                                <span className="font-medium">Value</span>
                                <span>%</span>
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-blue-700 mb-2">
                              AFTER POST COST
                            </p>
                            <div className="space-y-1 text-xs">
                              <p className="flex justify-between">
                                <span className="font-medium">Value</span>
                                <span>%</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="flex justify-between py-1">
                              <span className="font-semibold">B2B:</span>
                              <span className="text-teal-600">$10.00</span>
                              <span>1.00%</span>
                            </p>
                            <p className="flex justify-between py-1 bg-green-50">
                              <span className="font-semibold">TTL CM:</span>
                              <span className="text-teal-600">$990.00</span>
                              <span>99.00%</span>
                            </p>
                            <p className="flex justify-between py-1">
                              <span className="font-semibold">CM/DZN:</span>
                              <span className="text-teal-600">$118.80</span>
                            </p>
                          </div>
                          <div>
                            <p className="flex justify-between py-1">
                              <span className="text-teal-600">$10.00</span>
                              <span>1.00%</span>
                            </p>
                            <p className="flex justify-between py-1 bg-green-50">
                              <span className="text-teal-600">$990.00</span>
                              <span>99.00%</span>
                            </p>
                            <p className="flex justify-between py-1">
                              <span className="text-teal-600">$118.80</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Row 1.5 - Budget No */}
                <tr>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Budget No
                  </td>
                  <td
                    className="px-4 py-2.5 bg-green-50 border-r border-gray-300"
                    colSpan="3"
                  >
                    <input
                      type="text"
                      name="budgetNo"
                      value={formData.budgetNo}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                    />
                  </td>
                </tr>

                {/* Row 2 */}
                <tr>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Order Number
                  </td>
                  <td className="px-4 py-2.5 bg-green-50 border-r border-gray-300">
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      readOnly
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                    />
                  </td>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Order Value:
                  </td>
                  <td className="px-4 py-2.5 bg-white border-r border-gray-300">
                    <input
                      type="text"
                      name="orderValue"
                      value={formData.orderValue}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none text-right"
                    />
                  </td>
                </tr>

                {/* Row 3 - Description */}
                <tr>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300 align-top">
                    Description
                  </td>
                  <td
                    className="px-4 py-2.5 bg-green-50 border-r border-gray-300"
                    colSpan="3"
                  >
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      rows={2}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none resize-none"
                    />
                  </td>
                </tr>

                {/* Row 4 */}
                <tr>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Contract No.
                  </td>
                  <td className="px-4 py-2.5 bg-green-50 border-r border-gray-300">
                    <input
                      type="text"
                      name="contractNo"
                      value={formData.contractNo}
                      readOnly
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                    />
                  </td>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Status
                  </td>
                  <td className="px-4 py-2.5 bg-white border-r border-gray-300">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                    >
                      <option value="draft">draft</option>
                      <option value="on_process">on_process</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Style
                  </td>
                  <td className="px-4 py-2.5 bg-green-50 border-r border-gray-300">
                    <input
                      type="text"
                      name="style"
                      value={formData.style}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                    />
                  </td>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    FOB Value/piece
                  </td>
                  <td className="px-4 py-2.5 bg-white border-r border-gray-300">
                    <input
                      type="text"
                      name="fobValue"
                      value={formData.fobValue}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                    />
                  </td>
                </tr>

                {/* Row 6 */}
                <tr>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Order Qty (Pcs)
                  </td>
                  <td className="px-4 py-2.5 bg-green-50 border-r border-gray-300">
                    <input
                      type="number"
                      name="orderQty"
                      value={formData.orderQty}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                    />
                  </td>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Shipment Date
                  </td>
                  <td className="px-4 py-2.5 bg-green-50 border-r border-gray-300">
                    <input
                      type="date"
                      name="shipmentDate"
                      value={formData.shipmentDate}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                    />
                  </td>
                </tr>

                {/* Row 7 - Fabrics Details */}
                <tr>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300 align-top">
                    Fabrics Details
                  </td>
                  <td
                    className="px-4 py-2.5 bg-green-50 border-r border-gray-300"
                    colSpan="3"
                  >
                    <textarea
                      name="fabricsDetails"
                      value={formData.fabricsDetails}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      rows={2}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none resize-none"
                    />
                  </td>
                </tr>

                {/* Row 8 - Notes */}
                <tr>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300 align-top">
                    Notes
                  </td>
                  <td className="px-4 py-2.5 bg-green-50 border-r border-gray-300">
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      rows={2}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none resize-none"
                    />
                  </td>
                  <td className="bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 border-r border-gray-300">
                    Actual Shipment
                  </td>
                  <td className="px-4 py-2.5 bg-green-50 border-r border-gray-300">
                    <input
                      type="date"
                      name="actualShipment"
                      value={formData.actualShipment}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Details Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cost Details</h3>
              <p className="text-sm text-gray-600">
                Fabrics & Accessories with subtotals
              </p>
            </div>
            {isEditing && (
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors">
                  + Add Row
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                  Reset Default
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#2d3748]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    SL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    COST DETAILS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    PRE-COSTING ($)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    BUDGET ($)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    BUDGET (%)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    Post Costing/ Received PI Value ($)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    B2B (%)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {costDetails.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.name}
                        readOnly={!isEditing}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.preCosting}
                        onChange={(e) =>
                          handleCostDetailChange(
                            item.id,
                            "preCosting",
                            e.target.value
                          )
                        }
                        readOnly={!isEditing}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.budget}
                        onChange={(e) =>
                          handleCostDetailChange(
                            item.id,
                            "budget",
                            e.target.value
                          )
                        }
                        readOnly={!isEditing}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.budgetPercent}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.postCosting}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.b2bPercent}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteCostDetail(item.id)}
                        disabled={!isEditing}
                        className={`transition-colors ${
                          isEditing
                            ? "text-gray-400 hover:text-red-600 cursor-pointer"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Total Fabrics Cost Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan="2" className="px-4 py-3 text-sm text-gray-900">
                    Total Fabrics Cost
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">
                    ${totals.fabricsPreCosting?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">
                    ${totals.fabricsBudget?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">1.00%</td>
                  <td className="px-4 py-3 text-sm text-blue-600">$10.00</td>
                  <td className="px-4 py-3 text-sm text-blue-600">1.00%</td>
                  <td colSpan="2"></td>
                </tr>

                {/* Total Accessories Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan="2" className="px-4 py-3 text-sm text-gray-900">
                    Total Acces., Trims & etc.
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">
                    ${totals.accessoriesPreCosting?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">
                    ${totals.accessoriesBudget?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">0.00%</td>
                  <td className="px-4 py-3 text-sm text-blue-600">$0.00</td>
                  <td className="px-4 py-3 text-sm text-blue-600">0.00%</td>
                  <td colSpan="2"></td>
                </tr>

                {/* Total Cost Row */}
                <tr className="bg-[#2d3748] text-white font-bold">
                  <td colSpan="2" className="px-4 py-3 text-sm">
                    Total Cost
                  </td>
                  <td className="px-4 py-3 text-sm">
                    ${totals.totalPreCosting?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    ${totals.totalBudget?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3 text-sm">1.00%</td>
                  <td className="px-4 py-3 text-sm">$10.00</td>
                  <td className="px-4 py-3 text-sm">1.00%</td>
                  <td colSpan="2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/orders")}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Edit Order
              </button>
            ) : (
              <button
                onClick={handleUpdateOrder}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Update Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
