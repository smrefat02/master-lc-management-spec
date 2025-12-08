const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border border-gray-200",
  },
  active: {
    label: "Active",
    className: "bg-green-100 text-green-700 border border-green-200",
  },
  approved: {
    label: "Approved",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
