import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Validation schema matching backend validation
const contractSchema = z
  .object({
    buyer_id: z.string().min(1, "Buyer is required"),

    contract_no: z
      .string()
      .min(1, "Contract number is required")
      .regex(
        /^IIC\/AKCL\/CON\/\d{4}\/\d{2}$/,
        "Invalid format. Must match: IIC/AKCL/CON/YYYY/NN"
      ),

    contract_date: z
      .string()
      .min(1, "Contract date is required")
      .refine((date) => !isNaN(Date.parse(date)), "Invalid date"),

    amendment_date: z
      .string()
      .optional()
      .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid date"),

    total_orders: z
      .number({ invalid_type_error: "Must be a number" })
      .int("Must be a whole number")
      .min(0, "Must be at least 0"),

    order_quantity: z
      .number({ invalid_type_error: "Must be a number" })
      .int("Must be a whole number")
      .min(0, "Must be at least 0"),

    value_usd: z
      .number({ invalid_type_error: "Must be a number" })
      .min(0, "Must be at least 0"),

    b2b_percent: z
      .number({ invalid_type_error: "Must be a number" })
      .min(0, "Must be between 0 and 100")
      .max(100, "Must be between 0 and 100"),

    status: z.string().min(1, "Status is required"),

    remarks: z.string().optional(),
  })
  .refine(
    (data) => {
      // Cross-field validation: Amendment date >= Contract date
      if (data.amendment_date && data.contract_date) {
        const amendmentDate = new Date(data.amendment_date);
        const contractDate = new Date(data.contract_date);
        return amendmentDate >= contractDate;
      }
      return true;
    },
    {
      message: "Amendment date must be equal to or later than contract date",
      path: ["amendment_date"],
    }
  );

export function ContractForm({
  initialContractNo = "",
  buyers = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues = null,
  mode = "create", // "create" or "edit"
}) {
  const formDefaultValues = defaultValues || {
    contract_no: initialContractNo,
    buyer_id: "",
    contract_date: "",
    amendment_date: "",
    total_orders: 0,
    order_quantity: 0,
    value_usd: 0,
    b2b_percent: 0,
    status: "draft",
    remarks: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm({
    resolver: zodResolver(contractSchema),
    mode: "onChange", // Real-time validation
    defaultValues: formDefaultValues,
  });

  const statuses = ["draft", "active", "pending", "completed", "cancelled"];

  const inputClassName =
    "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm px-3 py-2 transition-colors";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
  const errorClassName = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Two Column Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Buyer Dropdown */}
        <div>
          <label htmlFor="buyer_id" className={labelClassName}>
            Buyer <span className="text-red-500">*</span>
          </label>
          <select
            id="buyer_id"
            {...register("buyer_id")}
            className={inputClassName}
            disabled={isSubmitting}
          >
            <option value="">Select a buyer</option>
            {buyers.map((buyer) => (
              <option key={buyer.id} value={buyer.id.toString()}>
                {buyer.name}
              </option>
            ))}
          </select>
          {errors.buyer_id && (
            <p className={errorClassName}>{errors.buyer_id.message}</p>
          )}
        </div>

        {/* Contract Number */}
        <div>
          <label htmlFor="contract_no" className={labelClassName}>
            Contract No <span className="text-red-500">*</span>
          </label>
          <input
            id="contract_no"
            type="text"
            {...register("contract_no")}
            placeholder="IIC/AKCL/CON/2025/01"
            className={`${inputClassName} ${
              mode === "edit"
                ? "bg-gray-50 text-gray-600 cursor-not-allowed"
                : ""
            }`}
            disabled={mode === "edit" || isSubmitting}
            readOnly={mode === "edit"}
          />
          {errors.contract_no && (
            <p className={errorClassName}>{errors.contract_no.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Contract Date */}
        <div>
          <label htmlFor="contract_date" className={labelClassName}>
            Contract Date <span className="text-red-500">*</span>
          </label>
          <input
            id="contract_date"
            type="date"
            {...register("contract_date")}
            className={inputClassName}
            disabled={isSubmitting}
          />
          {errors.contract_date && (
            <p className={errorClassName}>{errors.contract_date.message}</p>
          )}
        </div>

        {/* Amendment Date */}
        <div>
          <label htmlFor="amendment_date" className={labelClassName}>
            Amendment Date
          </label>
          <input
            id="amendment_date"
            type="date"
            {...register("amendment_date")}
            className={inputClassName}
            disabled={isSubmitting}
          />
          {errors.amendment_date && (
            <p className={errorClassName}>{errors.amendment_date.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Orders */}
        <div>
          <label htmlFor="total_orders" className={labelClassName}>
            Total Orders <span className="text-red-500">*</span>
          </label>
          <input
            id="total_orders"
            type="number"
            {...register("total_orders", { valueAsNumber: true })}
            className={inputClassName}
            disabled={isSubmitting}
            placeholder="0"
          />
          {errors.total_orders && (
            <p className={errorClassName}>{errors.total_orders.message}</p>
          )}
        </div>

        {/* Order Quantity */}
        <div>
          <label htmlFor="order_quantity" className={labelClassName}>
            Order Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="order_quantity"
            type="number"
            {...register("order_quantity", { valueAsNumber: true })}
            className={inputClassName}
            disabled={isSubmitting}
            placeholder="0"
          />
          {errors.order_quantity && (
            <p className={errorClassName}>{errors.order_quantity.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Contract Value USD */}
        <div>
          <label htmlFor="value_usd" className={labelClassName}>
            Total Contract Value (USD) <span className="text-red-500">*</span>
          </label>
          <input
            id="value_usd"
            type="number"
            step="0.01"
            {...register("value_usd", { valueAsNumber: true })}
            className={inputClassName}
            disabled={isSubmitting}
            placeholder="0.00"
          />
          {errors.value_usd && (
            <p className={errorClassName}>{errors.value_usd.message}</p>
          )}
        </div>

        {/* Overall B2B % */}
        <div>
          <label htmlFor="b2b_percent" className={labelClassName}>
            Overall B2B % <span className="text-red-500">*</span>
          </label>
          <input
            id="b2b_percent"
            type="number"
            step="0.01"
            {...register("b2b_percent", { valueAsNumber: true })}
            className={inputClassName}
            disabled={isSubmitting}
            placeholder="0.00"
          />
          {errors.b2b_percent && (
            <p className={errorClassName}>{errors.b2b_percent.message}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className={labelClassName}>
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          {...register("status")}
          className={inputClassName}
          disabled={isSubmitting}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className={errorClassName}>{errors.status.message}</p>
        )}
      </div>

      {/* Remarks */}
      <div>
        <label htmlFor="remarks" className={labelClassName}>
          Remarks
        </label>
        <textarea
          id="remarks"
          {...register("remarks")}
          rows={3}
          className={inputClassName}
          disabled={isSubmitting}
          placeholder="Optional"
        />
        {errors.remarks && (
          <p className={errorClassName}>{errors.remarks.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
