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
      // Get current year for contract number generation
      const currentYear = new Date().getFullYear();

      // Fetch next contract number and buyers in parallel
      const [contractNoRes, buyersRes] = await Promise.all([
        fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/api/contracts/next-number?year=${currentYear}`
        ),
        fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/api/buyers`
        ),
      ]);

      if (!contractNoRes.ok || !buyersRes.ok) {
        throw new Error("Failed to fetch initial data");
      }

      const contractNoData = await contractNoRes.json();
      const buyersData = await buyersRes.json();

      setInitialContractNo(contractNoData.contract_no);
      setBuyers(buyersData.buyers || buyersData);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError("Failed to load form data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000"
        }/api/contracts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Add New Contract
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
