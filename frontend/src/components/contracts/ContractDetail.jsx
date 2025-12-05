import StatusBadge from "./StatusBadge";
import InfoRow from "./InfoRow";

export default function ContractDetail({ contract }) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US").format(value || 0);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Contract Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {contract.contract_no}
            </p>
          </div>
          <StatusBadge status={contract.status} />
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <InfoRow label="Buyer Name" value={contract.buyer?.name} />
          <InfoRow label="Contract Number" value={contract.contract_no} />
          <InfoRow
            label="Contract Date"
            value={formatDate(contract.contract_date)}
          />
          <InfoRow
            label="Amendment Date"
            value={formatDate(contract.amendment_date)}
          />
          <InfoRow
            label="Total Orders"
            value={formatNumber(contract.total_orders)}
          />
          <InfoRow
            label="Order Quantity"
            value={formatNumber(contract.order_quantity)}
          />
          <InfoRow
            label="Master LC Value (USD)"
            value={formatCurrency(contract.value_usd)}
          />
          <InfoRow
            label="Overall B2B %"
            value={`${parseFloat(contract.b2b_percent || 0).toFixed(2)}%`}
          />
          {contract.remarks && (
            <InfoRow
              label="Remarks"
              value={contract.remarks}
              fullWidth={true}
            />
          )}
        </dl>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 text-xs text-gray-500">
          <div>
            <dt className="font-medium">Created</dt>
            <dd className="mt-1">{formatDate(contract.created_at)}</dd>
          </div>
          <div>
            <dt className="font-medium">Last Updated</dt>
            <dd className="mt-1">{formatDate(contract.updated_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
