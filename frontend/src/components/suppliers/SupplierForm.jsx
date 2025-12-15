const SupplierForm = ({ formData, errors, onChange, isEdit }) => {
  return (
    <div className="space-y-6">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Supplier Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter supplier name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
        )}
      </div>

      {/* Code Field */}
      <div>
        <label
          htmlFor="code"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Supplier Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="code"
          name="code"
          value={formData.code}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.code ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="SUP0001"
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-600">{errors.code[0]}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Format: SUP followed by 4 digits (e.g., SUP0001)
        </p>
      </div>

      {/* Contact Person Field */}
      <div>
        <label
          htmlFor="contact_person"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Contact Person
        </label>
        <input
          type="text"
          id="contact_person"
          name="contact_person"
          value={formData.contact_person}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.contact_person ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter contact person name"
        />
        {errors.contact_person && (
          <p className="mt-1 text-sm text-red-600">
            {errors.contact_person[0]}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="contact@supplier.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.phone ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone[0]}</p>
        )}
      </div>

      {/* Country Field */}
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Country
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.country ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter country"
        />
        {errors.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country[0]}</p>
        )}
      </div>

      {/* Address Field */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={onChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter full address"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address[0]}</p>
        )}
      </div>

      {/* Status Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="active"
              checked={formData.status === "active"}
              onChange={onChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="inactive"
              checked={formData.status === "inactive"}
              onChange={onChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Inactive</span>
          </label>
        </div>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status[0]}</p>
        )}
      </div>
    </div>
  );
};

export default SupplierForm;
