import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ContractForm } from "./ContractForm";

export function AddContractModal({ isOpen, onClose, onCreated }) {
  const [initialContractNo, setInitialContractNo] = useState("");
  const [buyers, setBuyers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch only buyers, no auto-generated contract number
      const buyersRes = await fetch(`http://127.0.0.1:8000/api/buyers`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!buyersRes.ok) {
        const errorText = await buyersRes.text();
        console.error("❌ Server response:", errorText);
        throw new Error(`Failed to fetch buyers (Status: ${buyersRes.status})`);
      }

      const buyersData = await buyersRes.json();

      console.log(
        "✅ Buyers loaded:",
        Array.isArray(buyersData) ? buyersData.length : 0
      );

      // Leave contract number empty
      setInitialContractNo("");
      // API returns array directly, not wrapped in {buyers: [...]}
      setBuyers(Array.isArray(buyersData) ? buyersData : []);
    } catch (err) {
      console.error("❌ Failed to fetch initial data:", err);
      console.error("❌ Error details:", err.message);
      setError(
        `Failed to load form data: ${err.message}. Please check if the backend server is running on http://127.0.0.1:8000`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/contracts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle validation errors
        if (response.status === 422 && errorData.errors) {
          // Show first validation error
          const firstError = Object.values(errorData.errors)[0][0];
          setError(firstError);
          return;
        }

        throw new Error(errorData.message || "Failed to create contract");
      }

      const result = await response.json();

      // Success - close modal and notify parent
      onCreated(result.contract);
      onClose();
    } catch (err) {
      console.error("Failed to create contract:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset state
      setError(null);
      setInitialContractNo("");
      setBuyers([]);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold text-gray-900"
                    >
                      Add New Contract
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="px-6 py-4">
                  {/* Error Message */}
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

                  {/* Loading State */}
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    /* Contract Form */
                    <ContractForm
                      initialContractNo={initialContractNo}
                      buyers={buyers}
                      onSubmit={handleSubmit}
                      onCancel={handleClose}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
