import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateB2BLC() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Dropdown data
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [costingDetails, setCostingDetails] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    contract_id: "",
    order_id: "",
    costing_detail_id: "",
    pi_number: "",
    supplier: "",
    order_qty: "",
    fob_value: "",
    order_value: "",
    post_pi_value: "",
    b2b_percent: "",
    director_command: "",
    status: "draft",
  });

  // Fetch contracts on mount
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/contracts");
        if (!response.ok) throw new Error("Failed to fetch contracts");
        const data = await response.json();
        setContracts(data.contracts || []);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };

    fetchContracts();
  }, []);

  // Fetch orders when contract changes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!formData.contract_id) {
        setOrders([]);
        setCostingDetails([]);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/orders?contract_id=${formData.contract_id}`
        );
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      }
    };

    fetchOrders();
  }, [formData.contract_id]);

  // Fetch order details and costing details when order changes
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!formData.order_id) {
        setCostingDetails([]);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/orders/${formData.order_id}`
        );
        if (!response.ok) throw new Error("Failed to fetch order details");
        const data = await response.json();

        // Parse cost_details JSON and create costing details array
        let costDetails = [];
        try {
          costDetails =
            typeof data.cost_details === "string"
              ? JSON.parse(data.cost_details)
              : data.cost_details || [];
        } catch (e) {
          console.error("Error parsing cost_details:", e);
          costDetails = [];
        }

        setCostingDetails(costDetails);

        // Auto-fill Order Qty from order data
        if (data.order_qty) {
          setFormData((prev) => ({
            ...prev,
            order_qty: data.order_qty,
          }));
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setCostingDetails([]);
      }
    };

    fetchOrderDetails();
  }, [formData.order_id]);

  // Handle contract change
  const handleContractChange = (e) => {
    const contractId = e.target.value;
    setFormData({
      ...formData,
      contract_id: contractId,
      order_id: "",
      costing_detail_id: "",
      supplier: "",
      order_qty: "",
      fob_value: "",
      order_value: "",
      post_pi_value: "",
      b2b_percent: "",
    });
  };

  // Handle order change
  const handleOrderChange = (e) => {
    const orderId = e.target.value;
    setFormData({
      ...formData,
      order_id: orderId,
      costing_detail_id: "",
      supplier: "",
      order_qty: "",
      fob_value: "",
      order_value: "",
      post_pi_value: "",
      b2b_percent: "",
    });
  };

  // Handle costing detail change
  const handleCostingDetailChange = (e) => {
    const costingDetailId = parseInt(e.target.value);

    // Find selected costing detail and auto-fill supplier, qty, fob
    const selectedCosting = costingDetails.find(
      (detail) => detail.id === costingDetailId
    );

    if (selectedCosting) {
      const qty = selectedCosting.quantity || "";
      const fob = selectedCosting.fob || "";
      const orderValue =
        qty && fob ? (parseFloat(qty) * parseFloat(fob)).toFixed(2) : "";

      setFormData((prev) => ({
        ...prev,
        costing_detail_id: costingDetailId,
        supplier: selectedCosting.supplier || "",
        order_qty: qty,
        fob_value: fob,
        order_value: orderValue,
        b2b_percent:
          prev.post_pi_value && orderValue
            ? (
                (parseFloat(prev.post_pi_value) / parseFloat(orderValue)) *
                100
              ).toFixed(2)
            : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        costing_detail_id: costingDetailId,
      }));
    }
  };

  // Handle order quantity change
  const handleOrderQtyChange = (e) => {
    const qty = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, order_qty: qty };

      // Calculate order value if both qty and fob_value exist
      if (qty && prev.fob_value) {
        newData.order_value = (
          parseFloat(qty) * parseFloat(prev.fob_value)
        ).toFixed(2);

        // Recalculate B2B % if post_pi_value exists
        if (prev.post_pi_value && newData.order_value > 0) {
          newData.b2b_percent = (
            (parseFloat(prev.post_pi_value) / parseFloat(newData.order_value)) *
            100
          ).toFixed(2);
        }
      }

      return newData;
    });
  };

  // Handle FOB value change
  const handleFobValueChange = (e) => {
    const fob = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, fob_value: fob };

      // Calculate order value if both qty and fob exist
      if (prev.order_qty && fob) {
        newData.order_value = (
          parseFloat(prev.order_qty) * parseFloat(fob)
        ).toFixed(2);

        // Recalculate B2B % if post_pi_value exists
        if (prev.post_pi_value && newData.order_value > 0) {
          newData.b2b_percent = (
            (parseFloat(prev.post_pi_value) / parseFloat(newData.order_value)) *
            100
          ).toFixed(2);
        }
      }

      return newData;
    });
  };

  // Handle Post PI value change
  const handlePostPIChange = (e) => {
    const postPI = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, post_pi_value: postPI };

      // Calculate B2B % if order_value exists
      if (postPI && prev.order_value && parseFloat(prev.order_value) > 0) {
        newData.b2b_percent = (
          (parseFloat(postPI) / parseFloat(prev.order_value)) *
          100
        ).toFixed(2);
      }

      return newData;
    });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("http://127.0.0.1:8000/api/b2b-lc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        throw new Error(data.message || "Failed to create B2B LC");
      }

      // Success - navigate to list page
      navigate("/b2b-lc");
    } catch (error) {
      console.error("Error creating B2B LC:", error);
    } finally {
      setLoading(false);
    }
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
      <div className="p-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create B2B LC
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Contract wise → Order → Costing Detail → B2B LC
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/b2b-lc")}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Form */}
          <form id="b2blc-form" onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-8">
                {/* Left Column - Dependent Dropdowns (1/3) */}
                <div className="col-span-1 space-y-5">
                  {/* Sales Contract */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Sales Contract
                    </label>
                    <select
                      value={formData.contract_id}
                      onChange={handleContractChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">-- Select Contract --</option>
                      {contracts.map((contract) => (
                        <option key={contract.id} value={contract.id}>
                          {contract.contract_no} - {contract.buyer?.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      Select contract to load orders
                    </p>
                    {errors.contract_id && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.contract_id[0]}
                      </p>
                    )}
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Order
                    </label>
                    <select
                      value={formData.order_id}
                      onChange={handleOrderChange}
                      disabled={!formData.contract_id}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select Order --</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.order_number}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      Order list depends on contract
                    </p>
                    {errors.order_id && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.order_id[0]}
                      </p>
                    )}
                  </div>

                  {/* Costing Detail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Costing Detail
                    </label>
                    <select
                      value={formData.costing_detail_id}
                      onChange={handleCostingDetailChange}
                      disabled={!formData.order_id}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select Costing Detail --</option>
                      {costingDetails.map((detail) => (
                        <option key={detail.id} value={detail.id}>
                          {detail.supplier} - {detail.item_type}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      Costing depends on order
                    </p>
                    {errors.costing_detail_id && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.costing_detail_id[0]}
                      </p>
                    )}
                  </div>

                  {/* Selected Section */}
                  {formData.contract_id && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Selected
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="font-medium text-gray-600">
                            Contract:{" "}
                          </span>
                          <span className="text-gray-900">
                            {contracts.find(
                              (c) => c.id === parseInt(formData.contract_id)
                            )?.contract_no || ""}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">
                            Order:{" "}
                          </span>
                          <span className="text-gray-900">
                            {formData.order_id
                              ? orders.find(
                                  (o) => o.id === parseInt(formData.order_id)
                                )?.order_number || "-- Select Order --"
                              : "-- Select Order --"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">
                            Costing:{" "}
                          </span>
                          <span className="text-gray-900">
                            {formData.costing_detail_id
                              ? costingDetails.find(
                                  (d) =>
                                    d.id ===
                                    parseInt(formData.costing_detail_id)
                                )
                                ? `${
                                    costingDetails.find(
                                      (d) =>
                                        d.id ===
                                        parseInt(formData.costing_detail_id)
                                    ).supplier
                                  } - ${
                                    costingDetails.find(
                                      (d) =>
                                        d.id ===
                                        parseInt(formData.costing_detail_id)
                                    ).item_type
                                  }`
                                : "-- Select Costing Detail --"
                              : "-- Select Costing Detail --"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - B2B LC Information (2/3) */}
                <div className="col-span-2">
                  {/* Instructional Message */}
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4 text-center">
                    <h4 className="text-sm font-semibold text-gray-700 mb-0.5">
                      Select Costing Detail
                    </h4>
                    <p className="text-xs text-gray-500">
                      Choose Contract → Order → Costing Detail to enable B2B LC
                      form.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          B2B LC Information
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Order Qty / FOB auto-filled from order (editable).
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create
                      </button>
                    </div>

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                      {/* Row 1 - Order Qty, FOB Value, Order Value */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Order Qty (Pcs){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="order_qty"
                          value={formData.order_qty}
                          onChange={handleOrderQtyChange}
                          required
                          min="1"
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                        {errors.order_qty && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.order_qty[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          FOB Value/piece{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="fob_value"
                          value={formData.fob_value}
                          onChange={handleFobValueChange}
                          required
                          min="0"
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.fob_value && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.fob_value[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Order Value ($)
                        </label>
                        <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                          <div className="text-right text-base font-bold text-gray-900">
                            {formData.order_value
                              ? parseFloat(formData.order_value).toFixed(2)
                              : "0.00"}
                          </div>
                        </div>
                      </div>

                      {/* Row 2 - PI Number and Supplier */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PI Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="pi_number"
                          value={formData.pi_number}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter PI Number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.pi_number && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.pi_number[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="supplier"
                          value={formData.supplier}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter Supplier Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.supplier && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.supplier[0]}
                          </p>
                        )}
                      </div>

                      {/* Row 3 - Post PI Value and B2B % */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Post Costing / Received PI Value ($){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="post_pi_value"
                          value={formData.post_pi_value}
                          onChange={handlePostPIChange}
                          required
                          min="0"
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.post_pi_value && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.post_pi_value[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          B2B %
                        </label>
                        <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                          <div className="text-right text-base font-semibold text-indigo-600">
                            {formData.b2b_percent
                              ? parseFloat(formData.b2b_percent).toFixed(2)
                              : "0.00"}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Calc:{" "}
                          <span className="font-medium">
                            {formData.b2b_percent
                              ? parseFloat(formData.b2b_percent).toFixed(2)
                              : "0.00"}
                            %
                          </span>{" "}
                          = Post PI / Order Value × 100
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    contract_id: "",
                    order_id: "",
                    costing_detail_id: "",
                    pi_number: "",
                    supplier: "",
                    order_qty: "",
                    fob_value: "",
                    order_value: "",
                    post_pi_value: "",
                    b2b_percent: "",
                    director_command: "",
                    status: "draft",
                  });
                  setOrders([]);
                  setCostingDetails([]);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save B2B LC"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
