import React from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

const WorkflowTimeline = ({ masterLc }) => {
  const getStatusInfo = (status) => {
    const statusMap = {
      draft: { label: "Draft", color: "gray", step: 1 },
      issued: { label: "Issued", color: "blue", step: 2 },
      verified: { label: "Verified", color: "green", step: 3 },
      active: { label: "Active", color: "teal", step: 4 },
      rejected: { label: "Rejected", color: "red", step: 5 },
      expired: { label: "Expired", color: "orange", step: 5 },
    };
    return statusMap[status] || { label: "Unknown", color: "gray", step: 0 };
  };

  const currentStatus = getStatusInfo(masterLc?.status || "draft");

  const steps = [
    {
      id: "draft",
      name: "Draft",
      description: "LC created and in draft",
      step: 1,
    },
    {
      id: "issued",
      name: "Issued",
      description: "Issued by bank",
      step: 2,
    },
    {
      id: "verified",
      name: "Verified",
      description: "Verified by advising bank",
      step: 3,
    },
    {
      id: "active",
      name: "Active",
      description: "Documents verified",
      step: 4,
    },
  ];

  const getStepStatus = (step) => {
    if (masterLc?.status === "rejected") {
      return currentStatus.step >= step ? "rejected" : "upcoming";
    }
    if (masterLc?.status === "expired") {
      return currentStatus.step >= step ? "expired" : "upcoming";
    }
    if (currentStatus.step > step) return "complete";
    if (currentStatus.step === step) return "current";
    return "upcoming";
  };

  const getStepIcon = (step) => {
    const status = getStepStatus(step.step);

    if (status === "complete") {
      return (
        <CheckCircleIcon
          className="h-6 w-6 text-green-600"
          aria-hidden="true"
        />
      );
    }

    if (status === "current") {
      return <ClockIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />;
    }

    if (status === "rejected") {
      return (
        <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
      );
    }

    if (status === "expired") {
      return (
        <XCircleIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
      );
    }

    return (
      <div className="h-6 w-6 rounded-full border-2 border-gray-300 bg-white" />
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Banking Workflow Status
      </h3>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            currentStatus.color === "gray"
              ? "bg-gray-100 text-gray-800"
              : currentStatus.color === "blue"
              ? "bg-blue-100 text-blue-800"
              : currentStatus.color === "green"
              ? "bg-green-100 text-green-800"
              : currentStatus.color === "teal"
              ? "bg-teal-100 text-teal-800"
              : currentStatus.color === "red"
              ? "bg-red-100 text-red-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {currentStatus.label}
        </span>
      </div>

      {/* Timeline */}
      <nav aria-label="Progress">
        <ol role="list" className="overflow-hidden">
          {steps.map((step, stepIdx) => {
            const status = getStepStatus(step.step);

            return (
              <li
                key={step.id}
                className={
                  stepIdx !== steps.length - 1 ? "pb-10 relative" : "relative"
                }
              >
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className={`absolute left-3 top-8 -ml-px mt-0.5 h-full w-0.5 ${
                      status === "complete" ||
                      status === "rejected" ||
                      status === "expired"
                        ? "bg-green-600"
                        : "bg-gray-300"
                    }`}
                    aria-hidden="true"
                  />
                ) : null}

                <div className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    {getStepIcon(step)}
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span
                      className={`text-sm font-medium ${
                        status === "complete"
                          ? "text-green-600"
                          : status === "current"
                          ? "text-blue-600"
                          : status === "rejected"
                          ? "text-red-600"
                          : status === "expired"
                          ? "text-orange-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {step.description}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Special status messages */}
      {masterLc?.status === "rejected" && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">LC Rejected</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>This LC has been rejected by the advising bank.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {masterLc?.status === "expired" && (
        <div className="mt-4 rounded-md bg-orange-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ClockIcon
                className="h-5 w-5 text-orange-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                LC Expired
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>This LC has expired past its expiry date.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowTimeline;
