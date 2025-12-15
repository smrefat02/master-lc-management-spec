import React from "react";
import {
  DocumentTextIcon,
  PencilIcon,
  PaperAirplaneIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  TruckIcon,
  InboxArrowDownIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const WorkflowTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No workflow history available
      </div>
    );
  }

  const getActionIcon = (action) => {
    const icons = {
      created: DocumentTextIcon,
      updated: PencilIcon,
      applied: PaperAirplaneIcon,
      issued: DocumentCheckIcon,
      verified: CheckCircleIcon,
      goods_shipped: TruckIcon,
      documents_received: InboxArrowDownIcon,
      documents_forwarded: ArrowRightIcon,
      documents_verified: CheckBadgeIcon,
      activated: CheckCircleIcon,
      rejected: XCircleIcon,
      expired: ClockIcon,
    };
    return icons[action] || DocumentTextIcon;
  };

  const getStatusColor = (newStatus) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      applied: "bg-blue-100 text-blue-800",
      issued_by_issuing_bank: "bg-indigo-100 text-indigo-800",
      verified_by_advising_bank: "bg-purple-100 text-purple-800",
      goods_shipped: "bg-cyan-100 text-cyan-800",
      documents_received: "bg-teal-100 text-teal-800",
      documents_forwarded: "bg-emerald-100 text-emerald-800",
      documents_verified: "bg-lime-100 text-lime-800",
      active: "bg-green-100 text-green-800",
      expired: "bg-orange-100 text-orange-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[newStatus] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Workflow Timeline
      </h3>

      <div className="space-y-4">
        {timeline.map((entry, index) => (
          <div key={entry.id} className="relative">
            {/* Connector Line */}
            {index < timeline.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
            )}

            <div className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center z-10">
                {React.createElement(getActionIcon(entry.action), {
                  className: "w-5 h-5 text-blue-600",
                })}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {entry.action_label}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {entry.description}
                    </p>

                    {/* Status Transition */}
                    {entry.previous_status && entry.new_status && (
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                            entry.previous_status
                          )}`}
                        >
                          {entry.previous_status.replace(/_/g, " ")}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                            entry.new_status
                          )}`}
                        >
                          {entry.new_status.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}

                    {/* Remarks */}
                    {entry.remarks && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <span className="font-medium">Remarks:</span>{" "}
                        {entry.remarks}
                      </div>
                    )}

                    {/* Metadata */}
                    {entry.metadata &&
                      Object.keys(entry.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {Object.entries(entry.metadata).map(
                            ([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>{" "}
                                {JSON.stringify(value)}
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {/* User and Time */}
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>{entry.performed_by}</span>
                      </div>
                      {entry.user_role && (
                        <>
                          <span>•</span>
                          <span>{entry.user_role}</span>
                        </>
                      )}
                      <span>•</span>
                      <span title={entry.performed_at_formatted}>
                        {entry.time_ago}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowTimeline;
