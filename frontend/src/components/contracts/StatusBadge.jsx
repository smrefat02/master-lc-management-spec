const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800",
  },
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-100 text-blue-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800",
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
