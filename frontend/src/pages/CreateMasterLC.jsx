import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CreateMasterLC() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Dropdown data
  const [dropdownData, setDropdownData] = useState({
    contracts: [],
    buyers: [],
    banks: [],
    currencies: ["USD", "EUR", "GBP"],
    required_document_options: [],
  });

  // Form data
  const [formData, setFormData] = useState({
    contract_id: "",
    order_id: "",
    lc_number: "",
    lc_number_mode: "auto",
    issue_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    amount: "",
    currency: "USD",
    exchange_rate: "",
    buyer_info: {
      name: "",
      address: "",
      country: "",
      contact_person: "",
    },
    beneficiary_info: {
      bank_id: "",
      bank_name: "",
    },
    bank_info: {
      account_number: "",
      swift_code: "",
      branch: "",
    },
    required_documents: [],
    terms_and_conditions: "",
  });

  // Fetch existing Master LC data if editing
  useEffect(() => {
    const fetchMasterLC = async () => {
      if (isEditMode) {
        setLoading(true);
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/api/master-lc/${id}`
          );
          if (!response.ok) throw new Error("Failed to fetch Master LC");
          const data = await response.json();
          if (data.success) {
            const mlc = data.data;
            setFormData({
              contract_id: mlc.contract_id || "",
              order_id: mlc.order_id || "",
              lc_number: mlc.lc_number || "",
              lc_number_mode: "manual",
              issue_date: mlc.issue_date || "",
              expiry_date: mlc.expiry_date || "",
              amount: mlc.amount || "",
              currency: mlc.currency || "USD",
              exchange_rate: mlc.exchange_rate || "",
              buyer_info: mlc.buyer_info || {
                name: "",
                address: "",
                country: "",
                contact_person: "",
              },
              beneficiary_info: mlc.beneficiary_info || {
                bank_id: "",
                bank_name: "",
              },
              bank_info: mlc.bank_info || {
                account_number: "",
                swift_code: "",
                branch: "",
              },
              required_documents: mlc.required_documents || [],
              terms_and_conditions: mlc.terms_and_conditions || "",
            });
          }
        } catch (error) {
          console.error("Error fetching Master LC:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMasterLC();
  }, [id, isEditMode]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/master-lc-dropdown-data"
        );
        if (!response.ok) throw new Error("Failed to fetch dropdown data");
        const data = await response.json();
        if (data.success) {
          setDropdownData(data.data);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  // Generate LC number when mode is auto (only in create mode)
  useEffect(() => {
    const generateLCNumber = async () => {
      if (!isEditMode && formData.lc_number_mode === "auto") {
        try {
          const response = await fetch(
            "http://127.0.0.1:8000/api/master-lc-generate-number"
          );
          if (!response.ok) throw new Error("Failed to generate LC number");
          const data = await response.json();
          if (data.success) {
            setFormData((prev) => ({
              ...prev,
              lc_number: data.data.lc_number,
            }));
          }
        } catch (error) {
          console.error("Error generating LC number:", error);
        }
      }
    };

    generateLCNumber();
  }, [formData.lc_number_mode, isEditMode]);

  // Handle buyer selection
  const handleBuyerChange = (e) => {
    const buyerId = e.target.value;
    const selectedBuyer = dropdownData.buyers.find(
      (b) => b.id === parseInt(buyerId)
    );

    if (selectedBuyer) {
      setFormData((prev) => ({
        ...prev,
        buyer_info: {
          name: selectedBuyer.name,
          address: selectedBuyer.address || "",
          country: selectedBuyer.country || "",
          contact_person: prev.buyer_info.contact_person,
        },
      }));
    }
  };

  // Handle bank selection
  const handleBankChange = (e) => {
    const bankId = e.target.value;
    const selectedBank = dropdownData.banks.find(
      (b) => b.id === parseInt(bankId)
    );

    if (selectedBank) {
      setFormData((prev) => ({
        ...prev,
        beneficiary_info: {
          bank_id: selectedBank.id,
          bank_name: selectedBank.name,
        },
        bank_info: {
          account_number: selectedBank.account_number || "",
          swift_code: selectedBank.swift_code || "",
          branch: selectedBank.branch || "",
        },
      }));
    }
  };

  // Handle required documents change
  const handleDocumentChange = (doc) => {
    setFormData((prev) => {
      const docs = prev.required_documents || [];
      if (docs.includes(doc)) {
        return {
          ...prev,
          required_documents: docs.filter((d) => d !== doc),
        };
      } else {
        return {
          ...prev,
          required_documents: [...docs, doc],
        };
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const url = isEditMode
        ? `http://127.0.0.1:8000/api/master-lc/${id}`
        : "http://127.0.0.1:8000/api/master-lc";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          setErrors(data.errors || {});
        } else {
          throw new Error(
            data.message ||
              `Failed to ${isEditMode ? "update" : "create"} Master LC`
          );
        }
        return;
      }

      if (data.success) {
        navigate(`/master-lc/${data.data.id}`);
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} Master LC:`,
        error
      );
      setErrors({ general: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/master-lc");
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
        <div className="bg-white rounded-lg shadow max-w-5xl mx-auto">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit Master LC" : "Create Master LC"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode
                ? "Update the details of the Master Letter of Credit"
                : "Fill in the details to create a new Master Letter of Credit"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Section A: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                A. Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Contract */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract
                  </label>
                  <select
                    value={formData.contract_id}
                    onChange={(e) =>
                      setFormData({ ...formData, contract_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Contract</option>
                    {dropdownData.contracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.label}
                      </option>
                    ))}
                  </select>
                  {errors.contract_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contract_id[0]}
                    </p>
                  )}
                </div>

                {/* LC Number Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LC Number Mode
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="auto"
                        checked={formData.lc_number_mode === "auto"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lc_number_mode: e.target.value,
                          })
                        }
                        className="form-radio text-indigo-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Auto</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="manual"
                        checked={formData.lc_number_mode === "manual"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lc_number_mode: e.target.value,
                            lc_number: "",
                          })
                        }
                        className="form-radio text-indigo-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Manual</span>
                    </label>
                  </div>
                </div>

                {/* LC Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LC Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lc_number}
                    onChange={(e) =>
                      setFormData({ ...formData, lc_number: e.target.value })
                    }
                    disabled={formData.lc_number_mode === "auto"}
                    placeholder={
                      formData.lc_number_mode === "auto"
                        ? "Auto-generated"
                        : "Enter LC Number"
                    }
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formData.lc_number_mode === "auto"
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  {errors.lc_number && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lc_number[0]}
                    </p>
                  )}
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) =>
                      setFormData({ ...formData, issue_date: e.target.value })
                    }
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.issue_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.issue_date[0]}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expiry_date: e.target.value })
                    }
                    min={formData.issue_date}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.expiry_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.expiry_date[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section B: Buyer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                B. Buyer Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Buyer Name Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Buyer <span className="text-red-500">*</span>
                  </label>
                  <select
                    onChange={handleBuyerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Buyer</option>
                    {dropdownData.buyers.map((buyer) => (
                      <option key={buyer.id} value={buyer.id}>
                        {buyer.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buyer Name (auto-filled) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buyer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.buyer_info.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyer_info: {
                          ...formData.buyer_info,
                          name: e.target.value,
                        },
                      })
                    }
                    placeholder="Buyer Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors["buyer_info.name"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["buyer_info.name"][0]}
                    </p>
                  )}
                </div>

                {/* Buyer Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.buyer_info.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyer_info: {
                          ...formData.buyer_info,
                          country: e.target.value,
                        },
                      })
                    }
                    placeholder="Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors["buyer_info.country"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["buyer_info.country"][0]}
                    </p>
                  )}
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.buyer_info.contact_person}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyer_info: {
                          ...formData.buyer_info,
                          contact_person: e.target.value,
                        },
                      })
                    }
                    placeholder="Contact Person"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Buyer Address */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.buyer_info.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        buyer_info: {
                          ...formData.buyer_info,
                          address: e.target.value,
                        },
                      })
                    }
                    rows={2}
                    placeholder="Full Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors["buyer_info.address"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["buyer_info.address"][0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section C: Beneficiary Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                C. Beneficiary Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Bank Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beneficiary Bank <span className="text-red-500">*</span>
                  </label>
                  <select
                    onChange={handleBankChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Bank</option>
                    {dropdownData.banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {errors["beneficiary_info.bank_id"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["beneficiary_info.bank_id"][0]}
                    </p>
                  )}
                </div>

                {/* Bank Name (auto-filled) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.beneficiary_info.bank_name}
                    readOnly
                    placeholder="Auto-filled"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bank_info.account_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bank_info: {
                          ...formData.bank_info,
                          account_number: e.target.value,
                        },
                      })
                    }
                    placeholder="Account Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors["bank_info.account_number"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["bank_info.account_number"][0]}
                    </p>
                  )}
                </div>

                {/* SWIFT Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SWIFT Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bank_info.swift_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bank_info: {
                          ...formData.bank_info,
                          swift_code: e.target.value,
                        },
                      })
                    }
                    placeholder="SWIFT Code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors["bank_info.swift_code"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["bank_info.swift_code"][0]}
                    </p>
                  )}
                </div>

                {/* Branch */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={formData.bank_info.branch}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bank_info: {
                          ...formData.bank_info,
                          branch: e.target.value,
                        },
                      })
                    }
                    placeholder="Branch Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section D: LC Amount & Currency */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                D. LC Amount & Currency
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.amount[0]}
                    </p>
                  )}
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {dropdownData.currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exchange Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exchange Rate (optional)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.exchange_rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        exchange_rate: e.target.value,
                      })
                    }
                    placeholder="1.000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Documents
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dropdownData.required_document_options.map((doc) => (
                    <label key={doc} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.required_documents.includes(doc)}
                        onChange={() => handleDocumentChange(doc)}
                        className="form-checkbox text-indigo-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms_and_conditions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terms_and_conditions: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Enter LC terms and conditions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving..."
                  : isEditMode
                  ? "Update Master LC"
                  : "Create Master LC"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
