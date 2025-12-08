export default function SummaryCard({
  title,
  value,
  description,
  icon,
  color = "blue",
}) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      icon: "text-blue-600",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      icon: "text-green-600",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      icon: "text-purple-600",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      icon: "text-orange-600",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`${colors.bg} rounded-xl p-6 shadow-sm border border-gray-100`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {title}
          </p>
          <p className={`text-3xl font-bold ${colors.text} mb-1`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-600">{description}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div
              className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.icon} ring-2 ring-white shadow-sm`}
            >
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
