import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function ViewContractModal({ isOpen, onClose, contract }) {
  if (!contract) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (value) => {
    if (!value) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("en-US").format(value);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold text-gray-900"
                    >
                      Contract Details
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
                  <div className="space-y-6">
                    {/* Contract Information */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Contract No
                        </label>
                        <div className="mt-1 text-base text-gray-900 font-mono">
                          {contract.contract_no}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <div className="mt-1">
                          {getStatusBadge(contract.status)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Buyer
                        </label>
                        <div className="mt-1 text-base text-gray-900">
                          {contract.buyer?.name || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Contract Date
                        </label>
                        <div className="mt-1 text-base text-gray-900">
                          {formatDate(contract.contract_date)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Amendment Date
                        </label>
                        <div className="mt-1 text-base text-gray-900">
                          {formatDate(contract.amendment_date)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Total Orders
                        </label>
                        <div className="mt-1 text-base text-gray-900">
                          {formatNumber(contract.total_orders)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Order Quantity
                        </label>
                        <div className="mt-1 text-base text-gray-900">
                          {formatNumber(contract.order_quantity)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Value (USD)
                        </label>
                        <div className="mt-1 text-base text-gray-900">
                          {formatCurrency(contract.value_usd)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          B2B Percentage
                        </label>
                        <div className="mt-1 text-base text-gray-900">
                          {contract.b2b_percent}%
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    {contract.remarks && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Remarks
                        </label>
                        <div className="mt-1 text-base text-gray-900 whitespace-pre-wrap">
                          {contract.remarks}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    {contract.buyer && (
                      <div className="border-t pt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          Buyer Contact Information
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {contract.buyer.contact_email && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <div className="mt-1 text-base text-gray-900">
                                {contract.buyer.contact_email}
                              </div>
                            </div>
                          )}
                          {contract.buyer.contact_phone && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Phone
                              </label>
                              <div className="mt-1 text-base text-gray-900">
                                {contract.buyer.contact_phone}
                              </div>
                            </div>
                          )}
                          {contract.buyer.address && (
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Address
                              </label>
                              <div className="mt-1 text-base text-gray-900">
                                {contract.buyer.address}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
