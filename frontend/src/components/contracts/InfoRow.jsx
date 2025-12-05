export default function InfoRow({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || "-"}</dd>
    </div>
  );
}
