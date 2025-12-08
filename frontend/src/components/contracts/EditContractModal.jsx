import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ContractForm } from "./ContractForm";

export default function EditContractModal({
  isOpen,
  onClose,
  contract,
  onUpdated,
}) {
  const [buyers, setBuyers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchBuyers();
    }
  }, [isOpen]);

  const fetchBuyers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/buyers");
      if (!response.ok) {
        throw new Error("Failed to fetch buyers");
      }
      const data = await response.json();
      // API returns array directly, not wrapped in {buyers: [...]}
      setBuyers(Array.isArray(data) ? data : []);
      console.log("✅ Loaded buyers:", data.length);
    } catch (err) {
      setError("Failed to load buyers. Please try again.");
      console.error("❌ Error fetching buyers:", err);
    }
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/contracts/${contract.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          // Validation errors from backend
          setValidationErrors(data.errors);
          setError("Please correct the validation errors below.");
        } else {
          setError(
            data.message || "Failed to update contract. Please try again."
          );
        }
        return;
      }

      // Success
      onUpdated();
      onClose();
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error("Error updating contract:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!contract) {
    return null;
  }

  // Transform contract data for form default values
  const defaultValues = {
    buyer_id: contract.buyer_id?.toString() || "",
    contract_no: contract.contract_no || "",
    contract_date: contract.contract_date || "",
    amendment_date: contract.amendment_date || "",
    total_orders: contract.total_orders || 0,
    order_quantity: contract.order_quantity || 0,
    value_usd: contract.value_usd || 0,
    b2b_percent: contract.b2b_percent || 0,
    status: contract.status || "draft",
    remarks: contract.remarks || "",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold text-gray-900"
                    >
                      Edit Contract
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="px-6 py-4">

                  {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {error}
                        </h3>
                      </div>
                    </div>
                  </div>
                  )}

                  <ContractForm
                    buyers={buyers}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isLoading={isLoading}
                    validationErrors={validationErrors}
                    defaultValues={defaultValues}
                    mode="edit"
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
