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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-semibold leading-6 text-gray-900"
                  >
                    Contract Details
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

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

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
