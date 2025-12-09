import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getContracts } from "../services/contractService";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState("");
  const [formData, setFormData] = useState({
    salesContract: "",
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

  const [costDetails, setCostDetails] = useState([
    {
      id: 1,
      name: "YARN",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 2,
      name: "Knitting",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 3,
      name: "Dyeing",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 4,
      name: "Y/D (Yarn Dyed)",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 5,
      name: "Lycra",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 6,
      name: "Brush Wash",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 7,
      name: "AOP (All Over Print)",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 8,
      name: "Accessories",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 9,
      name: "Testing",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 10,
      name: "Printing",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 11,
      name: "Embroidery",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 12,
      name: "Courier & Inspector",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 13,
      name: "DC & BC (Discount)",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
    {
      id: 14,
      name: "Penalty & C.A",
      preCosting: "",
      budget: "",
      budgetPercent: "0.00",
      postCosting: "0.00",
      b2bPercent: "0.00",
      status: "draft",
    },
  ]);

  const [beforePostCost, setBeforePostCost] = useState({
    b2b: { value: "$0.00", percentage: "0.00%" },
    ttlCm: { value: "$0.00", percentage: "0.00%" },
    cmDzn: { value: "$0.00", percentage: "0.00%" },
  });

  const [afterPostCost, setAfterPostCost] = useState({
    b2b: { value: "$0.00", percentage: "0.00%" },
    ttlCm: { value: "$0.00", percentage: "0.00%" },
    cmDzn: { value: "$0.00", percentage: "0.00%" },
  });

  const [totals, setTotals] = useState({
    fabricsPreCosting: 0,
    fabricsBudget: 0,
    accessoriesPreCosting: 0,
    accessoriesBudget: 0,
    totalPreCosting: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    // Fetch contracts for dropdown
    const fetchContracts = async () => {
      try {
        const data = await getContracts({ per_page: 100 });
        setContracts(data.contracts || []);
      } catch (err) {
        console.error("Error fetching contracts:", err);
      }
    };
    fetchContracts();
  }, []);

  // Calculate totals whenever costDetails changes
  useEffect(() => {
    const fabricsItems = costDetails.slice(0, 7); // First 7 items are fabrics
    const accessoriesItems = costDetails.slice(7); // Rest are accessories

    const totalFabricsPreCosting = fabricsItems.reduce(
      (sum, item) => sum + (parseFloat(item.preCosting) || 0),
      0
    );
    const totalFabricsBudget = fabricsItems.reduce(
      (sum, item) => sum + (parseFloat(item.budget) || 0),
      0
    );

    const totalAccessoriesPreCosting = accessoriesItems.reduce(
      (sum, item) => sum + (parseFloat(item.preCosting) || 0),
      0
    );
    const totalAccessoriesBudget = accessoriesItems.reduce(
      (sum, item) => sum + (parseFloat(item.budget) || 0),
      0
    );

    const totalPreCosting = totalFabricsPreCosting + totalAccessoriesPreCosting;
    const totalBudget = totalFabricsBudget + totalAccessoriesBudget;

    setTotals({
      fabricsPreCosting: totalFabricsPreCosting,
      fabricsBudget: totalFabricsBudget,
      accessoriesPreCosting: totalAccessoriesPreCosting,
      accessoriesBudget: totalAccessoriesBudget,
      totalPreCosting: totalPreCosting,
      totalBudget: totalBudget,
    });
  }, [costDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContractSelect = (e) => {
    const contractId = e.target.value;
    setSelectedContract(contractId);
    // Fetch contract details and populate fields
    const contract = contracts.find((c) => c.id.toString() === contractId);
    if (contract) {
      setFormData((prev) => ({
        ...prev,
        salesContract: contractId,
        contractNo: contract.contract_no,
        buyerName: contract.buyer?.name || "",
        masterLCValue: contract.total_contract_value || "0.00",
      }));
    } else {
      // Reset fields if no contract selected
      setFormData((prev) => ({
        ...prev,
        salesContract: "",
        contractNo: "",
        buyerName: "",
        masterLCValue: "0.00",
      }));
    }
  };

  const handleCostDetailChange = (id, field, value) => {
    setCostDetails((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddRow = () => {
    const newId = Math.max(...costDetails.map((c) => c.id), 0) + 1;
    setCostDetails((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    if (costDetails.length > 1) {
      setCostDetails((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleResetDefault = () => {
    setCostDetails([
      {
        id: 1,
        name: "YARN",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 2,
        name: "Knitting",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 3,
        name: "Dyeing",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 4,
        name: "Y/D (Yarn Dyed)",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 5,
        name: "Lycra",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 6,
        name: "Brush Wash",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 7,
        name: "AOP (All Over Print)",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 8,
        name: "Accessories",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 9,
        name: "Testing",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 10,
        name: "Printing",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 11,
        name: "Embroidery",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 12,
        name: "Courier & Inspector",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 13,
        name: "DC & BC (Discount)",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
      {
        id: 14,
        name: "Penalty & C.A",
        preCosting: "",
        budget: "",
        budgetPercent: "0.00",
        postCosting: "0.00",
        b2bPercent: "0.00",
        status: "draft",
      },
    ]);
  };

  const handleSaveOrder = async () => {
    try {
      const orderData = {
        ...formData,
        costDetails: costDetails,
        totals: totals,
      };

      console.log("Saving Order:", orderData);

      const response = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Validation errors:", errorData);

        // Build detailed error message
        let errorMessage = errorData.message || "Failed to save order";
        if (errorData.errors) {
          const errorDetails = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");
          errorMessage += "\n\nDetails:\n" + errorDetails;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Order saved successfully:", result);

      alert("Order created successfully!");
      navigate("/orders");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Error saving order: " + error.message);
    }
  };

  const handleCancel = () => {
    navigate("/orders");
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
            <h2 className="text-2xl font-bold text-gray-900">Create Order</h2>
            <p className="text-sm text-gray-600 mt-1">
              Order information & costing details
            </p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
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
            Back to Contracts
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="px-8 py-6">
        {/* Sales Contract Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales Contract
            </label>
            <select
              value={selectedContract}
              onChange={handleContractSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">— Select Contract —</option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.contract_no}
                </option>
              ))}
            </select>
          </div>

          {/* Order Information Grid - Table Style */}
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
                      readOnly
                      className="w-full px-2 py-1 bg-white border-0 text-sm focus:outline-none"
                      placeholder="—"
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
                      readOnly
                      className="w-full px-2 py-1 bg-white border-0 text-sm focus:outline-none text-right"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-4 py-2.5 bg-white" rowSpan="9">
                    <div className="border border-gray-300 rounded-md overflow-hidden bg-white h-full">
                      <h3 className="text-xs font-semibold text-gray-700 py-2 uppercase text-center border-b border-gray-300 bg-gray-50">
                        Before & After Post Cost (Report)
                      </h3>

                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="border-b border-r border-gray-300"></th>
                            <th
                              colSpan="2"
                              className="bg-red-50 text-red-700 font-semibold py-2 px-2 border-b border-r border-gray-300 text-center"
                            >
                              BEFORE POST COST
                            </th>
                            <th
                              colSpan="2"
                              className="bg-blue-50 text-blue-700 font-semibold py-2 px-2 border-b border-gray-300 text-center"
                            >
                              AFTER POST COST
                            </th>
                          </tr>
                          <tr className="bg-gray-50">
                            <th className="py-2 px-2 border-b border-r border-gray-300"></th>
                            <th className="py-2 px-2 border-b border-r border-gray-300 text-center font-medium text-gray-700">
                              Value
                            </th>
                            <th className="py-2 px-2 border-b border-r border-gray-300 text-center font-medium text-gray-700">
                              Percentage (%)
                            </th>
                            <th className="py-2 px-2 border-b border-r border-gray-300 text-center font-medium text-gray-700">
                              Value
                            </th>
                            <th className="py-2 px-2 border-b border-gray-300 text-center font-medium text-gray-700">
                              Percentage (%)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="py-2 px-2 font-semibold text-gray-900 border-b border-r border-gray-300">
                              B2B:
                            </td>
                            <td className="py-2 px-2 text-center border-b border-r border-gray-300 text-teal-600">
                              {beforePostCost.b2b.value}
                            </td>
                            <td className="py-2 px-2 text-center border-b border-r border-gray-300">
                              {beforePostCost.b2b.percentage}
                            </td>
                            <td className="py-2 px-2 text-center border-b border-r border-gray-300 text-teal-600">
                              {afterPostCost.b2b.value}
                            </td>
                            <td className="py-2 px-2 text-center border-b border-gray-300">
                              {afterPostCost.b2b.percentage}
                            </td>
                          </tr>
                          <tr className="bg-green-50">
                            <td className="py-2 px-2 font-semibold text-gray-900 border-b border-r border-gray-300">
                              TTL CM:
                            </td>
                            <td className="py-2 px-2 text-center border-b border-r border-gray-300 text-teal-600">
                              {beforePostCost.ttlCm.value}
                            </td>
                            <td className="py-2 px-2 text-center border-b border-r border-gray-300">
                              {beforePostCost.ttlCm.percentage}
                            </td>
                            <td className="py-2 px-2 text-center border-b border-r border-gray-300 text-teal-600">
                              {afterPostCost.ttlCm.value}
                            </td>
                            <td className="py-2 px-2 text-center border-b border-gray-300">
                              {afterPostCost.ttlCm.percentage}
                            </td>
                          </tr>
                          <tr className="bg-white">
                            <td className="py-2 px-2 font-semibold text-gray-900 border-r border-gray-300">
                              CM/DZN:
                            </td>
                            <td className="py-2 px-2 text-center border-r border-gray-300 text-teal-600">
                              {beforePostCost.cmDzn.value}
                            </td>
                            <td className="py-2 px-2 text-center border-r border-gray-300">
                              {beforePostCost.cmDzn.percentage}
                            </td>
                            <td className="py-2 px-2 text-center border-r border-gray-300 text-teal-600">
                              {afterPostCost.cmDzn.value}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {afterPostCost.cmDzn.percentage}
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                      placeholder="Optional"
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
                      onChange={handleInputChange}
                      placeholder="Auto / SC-ORD-001"
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none placeholder:text-gray-400"
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
                      rows={2}
                      placeholder="Optional brief"
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
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 bg-transparent border-0 text-sm focus:outline-none"
                      placeholder="—"
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
                      placeholder="Optional"
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
                      rows={2}
                      placeholder="Optional"
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
                      rows={2}
                      placeholder="Optional"
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
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddRow}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
              >
                + Add Row
              </button>
              <button
                onClick={handleResetDefault}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Reset Default
              </button>
            </div>
          </div>

          {/* Cost Details Table */}
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
                        onChange={(e) =>
                          handleCostDetailChange(
                            item.id,
                            "name",
                            e.target.value
                          )
                        }
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
                        onClick={() => handleRemoveRow(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        disabled={costDetails.length === 1}
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
                    ${totals.fabricsPreCosting.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">
                    ${totals.fabricsBudget.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">
                    {totals.fabricsBudget > 0
                      ? (
                          (totals.fabricsBudget / totals.totalBudget) *
                          100
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">$0.00</td>
                  <td className="px-4 py-3 text-sm text-blue-600">0.00%</td>
                  <td colSpan="2"></td>
                </tr>

                {/* Total Accessories Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan="2" className="px-4 py-3 text-sm text-gray-900">
                    Total Acces., Trims & etc.
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">
                    ${totals.accessoriesPreCosting.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">
                    ${totals.accessoriesBudget.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">
                    {totals.accessoriesBudget > 0
                      ? (
                          (totals.accessoriesBudget / totals.totalBudget) *
                          100
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </td>
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
                    ${totals.totalPreCosting.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    ${totals.totalBudget.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {totals.totalBudget > 0 ? "100.00" : "0.00"}%
                  </td>
                  <td className="px-4 py-3 text-sm">$0.00</td>
                  <td className="px-4 py-3 text-sm">0.00%</td>
                  <td colSpan="2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOrder}
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
