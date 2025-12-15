import React from "react";
import {
  DocumentTextIcon,
  PaperAirplaneIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  TruckIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  UserIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const WorkflowDiagram = ({ masterLC }) => {
  const status = masterLC?.lc_status || "draft";

  // Define workflow steps with party involvement
  const steps = [
    {
      id: 1,
      label: "Contract Agreement",
      status: "draft",
      parties: ["exporter", "importer"],
      Icon: DocumentTextIcon,
      description: "Agree on Contract",
    },
    {
      id: 2,
      label: "Apply for LC",
      status: "applied",
      parties: ["importer"],
      Icon: PaperAirplaneIcon,
      description: "Importer Applies for an LC",
    },
    {
      id: 3,
      label: "Issue LC",
      status: "issued_by_issuing_bank",
      parties: ["issuing_bank"],
      Icon: BuildingLibraryIcon,
      description: "Issues Letter of Credit",
    },
    {
      id: 4,
      label: "Verify LC",
      status: "verified_by_advising_bank",
      parties: ["advising_bank"],
      Icon: CheckCircleIcon,
      description: "Verifies and sends it",
    },
    {
      id: 5,
      label: "Ship Goods",
      status: "goods_shipped",
      parties: ["exporter"],
      Icon: TruckIcon,
      description: "Goods are Shipped",
    },
    {
      id: 6,
      label: "Receive Documents",
      status: "documents_received",
      parties: ["advising_bank"],
      Icon: DocumentCheckIcon,
      description: "Documents are provided",
    },
    {
      id: 7,
      label: "Forward Documents",
      status: "documents_forwarded",
      parties: ["advising_bank", "issuing_bank"],
      Icon: ArrowRightIcon,
      description: "Documents are forwarded",
    },
    {
      id: 8,
      label: "Verify & Activate",
      status: "documents_verified",
      parties: ["issuing_bank"],
      Icon: CheckBadgeIcon,
      description: "Verifies the LC & forwards to exporter",
    },
  ];

  // Get step index based on current status
  const getCurrentStepIndex = () => {
    const statusOrder = [
      "draft",
      "applied",
      "issued_by_issuing_bank",
      "verified_by_advising_bank",
      "goods_shipped",
      "documents_received",
      "documents_forwarded",
      "documents_verified",
      "active",
    ];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? currentIndex : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  // Check if step is completed, current, or pending
  const getStepState = (stepIndex) => {
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "current";
    return "pending";
  };

  // Get party icon
  const getPartyIcon = (party) => {
    const icons = {
      exporter: UserIcon,
      importer: UserIcon,
      issuing_bank: BuildingLibraryIcon,
      advising_bank: BuildingLibraryIcon,
    };
    return icons[party] || UserIcon;
  };

  // Get party label
  const getPartyLabel = (party) => {
    const labels = {
      exporter: "Exporter",
      importer: "Importer",
      issuing_bank: "Issuing Bank",
      advising_bank: "Advising Bank",
    };
    return labels[party] || party;
  };

  // Terminal states
  const isTerminal = ["active", "rejected", "expired"].includes(status);
  const isRejected = status === "rejected";
  const isExpired = status === "expired";
  const isActive = status === "active";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">LC Workflow Process</h3>

      {/* Terminal State Banner */}
      {isTerminal && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            isActive
              ? "bg-green-50 border border-green-200"
              : isRejected
              ? "bg-red-50 border border-red-200"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 ${
                isActive
                  ? "text-green-600"
                  : isRejected
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {isActive ? (
                <CheckCircleIcon className="w-8 h-8" />
              ) : isRejected ? (
                <XCircleIcon className="w-8 h-8" />
              ) : (
                <ClockIcon className="w-8 h-8" />
              )}
            </div>
            <div>
              <div
                className={`font-semibold ${
                  isActive
                    ? "text-green-700"
                    : isRejected
                    ? "text-red-700"
                    : "text-gray-700"
                }`}
              >
                {isActive
                  ? "LC Activated Successfully"
                  : isRejected
                  ? "LC Rejected"
                  : "LC Expired"}
              </div>
              <div className="text-sm text-gray-600">
                {isActive
                  ? "The Letter of Credit is now active and ready for transactions."
                  : isRejected
                  ? masterLC?.rejection_reason ||
                    "LC was rejected during the workflow."
                  : "The Letter of Credit has expired."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const stepState = getStepState(index);
          const isCompleted = stepState === "completed";
          const isCurrent = stepState === "current";
          const isPending = stepState === "pending";

          return (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div
                  className={`hidden lg:block absolute top-12 left-full w-full h-1 -translate-x-1/2 ${
                    isCompleted
                      ? "bg-green-500"
                      : isCurrent
                      ? "bg-gradient-to-r from-green-500 to-gray-300"
                      : "bg-gray-300"
                  }`}
                  style={{
                    width: "calc(100% - 2rem)",
                    left: "calc(50% + 1rem)",
                  }}
                />
              )}

              {/* Step Card */}
              <div
                className={`relative border-2 rounded-lg p-4 transition-all ${
                  isCompleted
                    ? "border-green-500 bg-green-50"
                    : isCurrent
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-300"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <step.Icon className="w-8 h-8 text-gray-600" />
                </div>

                {/* Step Label */}
                <div
                  className={`font-semibold text-sm mb-1 ${
                    isCompleted
                      ? "text-green-700"
                      : isCurrent
                      ? "text-blue-700"
                      : "text-gray-600"
                  }`}
                >
                  {step.label}
                </div>

                {/* Description */}
                <div className="text-xs text-gray-600 mb-3">
                  {step.description}
                </div>

                {/* Parties Involved */}
                <div className="space-y-1">
                  {step.parties.map((party) => {
                    const PartyIcon = getPartyIcon(party);
                    return (
                      <div
                        key={party}
                        className="flex items-center gap-1 text-xs text-gray-700"
                      >
                        <PartyIcon className="w-4 h-4" />
                        <span className="font-medium">
                          {getPartyLabel(party)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Current Step Indicator */}
                {isCurrent && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                    Current
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-gray-600">Current Step</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
          <span className="text-gray-600">Pending</span>
        </div>
      </div>

      {/* Party Legend */}
      <div className="mt-4 pt-4 border-t">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Parties Involved:
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600">Exporter</span>
          </div>
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600">Importer</span>
          </div>
          <div className="flex items-center gap-2">
            <BuildingLibraryIcon className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600">Issuing Bank</span>
          </div>
          <div className="flex items-center gap-2">
            <BuildingLibraryIcon className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600">Advising Bank</span>
          </div>
        </div>
      </div>

      {/* Banking Details */}
      {(masterLC?.issuing_bank || masterLC?.advising_bank) && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Bank Details:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {masterLC?.issuing_bank && (
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-medium text-blue-700">Issuing Bank</div>
                <div className="text-gray-700">
                  {masterLC.issuing_bank.name}
                </div>
                <div className="text-xs text-gray-500">
                  SWIFT: {masterLC.issuing_bank.swift_code}
                </div>
              </div>
            )}
            {masterLC?.advising_bank && (
              <div className="bg-purple-50 p-3 rounded">
                <div className="font-medium text-purple-700">Advising Bank</div>
                <div className="text-gray-700">
                  {masterLC.advising_bank.name}
                </div>
                <div className="text-xs text-gray-500">
                  SWIFT: {masterLC.advising_bank.swift_code}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDiagram;
