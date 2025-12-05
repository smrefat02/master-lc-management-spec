# Research: Laravel Form Request Validation Patterns for Contract Management API

**Created**: 2025-12-04  
**Focus**: Form Request validation, custom rules, error formatting, HTTP response standards

---

## Decision: Laravel Form Request with Custom Rule Class

**Chosen Approach**: Use Laravel Form Request classes with custom validation rules for complex contract number validation (regex + uniqueness) and structured error responses following Laravel conventions.

**Rationale**:

- Form Request classes separate validation logic from controllers, improving testability and maintainability
- Built-in error message formatting matches required structure `{ message, errors: { field: [] } }`
- Custom rule classes provide reusable, testable validation logic for complex rules like contract_no
- Native HTTP response integration with proper status codes (200, 201, 400, 404, 500)
- Type-safe validation with IDE support through FormRequest base class

---

## 1. Complete StoreContractRequest Class

### Implementation

```php
<?php

namespace App\Http\Requests;

use App\Rules\ContractNumberFormat;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreContractRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Adjust based on your authorization logic
        // For now, assuming all authenticated users can create contracts
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            // Buyer - Required, must exist in buyers table
            'buyer_id' => [
                'required',
                'integer',
                'exists:buyers,id',
            ],

            // Contract Number - Required, custom format validation + unique
            'contract_no' => [
                'required',
                'string',
                'max:255',
                new ContractNumberFormat(), // Custom rule for regex pattern
                'unique:contracts,contract_no', // Database uniqueness check
            ],

            // Contract Date - Required, must be valid date
            'contract_date' => [
                'required',
                'date',
            ],

            // Amendment Date - Optional, must be valid date and >= contract_date
            'amendment_date' => [
                'nullable',
                'date',
                'after_or_equal:contract_date',
            ],

            // Total Orders - Required, must be positive integer
            'total_orders' => [
                'required',
                'integer',
                'min:1',
            ],

            // Order Quantity - Required, must be positive integer
            'order_quantity' => [
                'required',
                'integer',
                'min:1',
            ],

            // Total Contract Value - Required, must be positive numeric (allows decimals)
            'total_contract_value' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            // B2B Percentage - Required, must be between 0 and 100 (inclusive)
            'b2b_percentage' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
            ],

            // Status - Required, must be one of predefined values
            'status' => [
                'required',
                'string',
                'in:Draft,Active,Pending,Completed,Cancelled',
            ],

            // Remarks - Optional, string
            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'buyer_id' => 'buyer',
            'contract_no' => 'contract number',
            'contract_date' => 'contract date',
            'amendment_date' => 'amendment date',
            'total_orders' => 'total orders',
            'order_quantity' => 'order quantity',
            'total_contract_value' => 'total contract value',
            'b2b_percentage' => 'B2B percentage',
            'status' => 'status',
            'remarks' => 'remarks',
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'buyer_id.required' => 'The buyer field is required.',
            'buyer_id.exists' => 'The selected buyer does not exist.',

            'contract_no.required' => 'The contract number is required.',
            'contract_no.unique' => 'This contract number already exists. Please use a different number.',

            'contract_date.required' => 'The contract date is required.',
            'contract_date.date' => 'The contract date must be a valid date.',

            'amendment_date.date' => 'The amendment date must be a valid date.',
            'amendment_date.after_or_equal' => 'The amendment date must be equal to or after the contract date.',

            'total_orders.required' => 'The total orders field is required.',
            'total_orders.integer' => 'The total orders must be a whole number.',
            'total_orders.min' => 'The total orders must be at least 1.',

            'order_quantity.required' => 'The order quantity field is required.',
            'order_quantity.integer' => 'The order quantity must be a whole number.',
            'order_quantity.min' => 'The order quantity must be at least 1.',

            'total_contract_value.required' => 'The total contract value is required.',
            'total_contract_value.numeric' => 'The total contract value must be a number.',
            'total_contract_value.min' => 'The total contract value must be greater than 0.',

            'b2b_percentage.required' => 'The B2B percentage is required.',
            'b2b_percentage.numeric' => 'The B2B percentage must be a number.',
            'b2b_percentage.min' => 'The B2B percentage must be at least 0.',
            'b2b_percentage.max' => 'The B2B percentage cannot exceed 100.',

            'status.required' => 'The status field is required.',
            'status.in' => 'The selected status is invalid. Must be one of: Draft, Active, Pending, Completed, Cancelled.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * Override to customize the error response format.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors()->toArray(),
            ], 400)
        );
    }
}
```

---

## 2. Custom Rule: ContractNumberFormat

### Implementation

```php
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ContractNumberFormat implements ValidationRule
{
    /**
     * The regex pattern for contract number validation.
     * Format: IIC/AKCL/CON/YYYY/NN
     * Where YYYY = 4-digit year, NN = 2-digit zero-padded number
     */
    protected string $pattern = '/^IIC\/AKCL\/CON\/\d{4}\/\d{2}$/';

    /**
     * Run the validation rule.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $fail('The :attribute must be a string.');
            return;
        }

        if (!preg_match($this->pattern, $value)) {
            $fail('Invalid contract number format. Must match: IIC/AKCL/CON/YYYY/NN (e.g., IIC/AKCL/CON/2025/01)');
        }
    }
}
```

### Alternative: Inline Custom Validation with Closure

If you prefer not to create a separate rule class, you can use a closure-based custom rule directly in the FormRequest:

```php
use Illuminate\Validation\Rule;

public function rules(): array
{
    return [
        'contract_no' => [
            'required',
            'string',
            'max:255',
            function ($attribute, $value, $fail) {
                $pattern = '/^IIC\/AKCL\/CON\/\d{4}\/\d{2}$/';
                if (!preg_match($pattern, $value)) {
                    $fail('Invalid contract number format. Must match: IIC/AKCL/CON/YYYY/NN');
                }
            },
            'unique:contracts,contract_no',
        ],
        // ... other rules
    ];
}
```

**Trade-off**: Closure approach is simpler for one-off validations but less reusable and harder to unit test.

---

## 3. Controller Methods with Proper Error Responses

### ContractController Implementation

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ContractController extends Controller
{
    /**
     * Display a listing of contracts with summary statistics.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Contract::with('buyer');

            // Apply search filter (buyer name or contract number)
            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('contract_no', 'like', "%{$search}%")
                      ->orWhereHas('buyer', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
                });
            }

            // Apply status filter
            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }

            // Pagination
            $perPage = $request->input('per_page', 10);
            $contracts = $query->paginate($perPage);

            // Calculate summary statistics
            $stats = Contract::selectRaw('
                COUNT(*) as total_contracts,
                SUM(total_contract_value) as total_lc_value,
                SUM(order_quantity) as total_order_quantity,
                AVG(b2b_percentage) as avg_b2b_percentage
            ')->first();

            return response()->json([
                'data' => ContractResource::collection($contracts),
                'stats' => [
                    'total_contracts' => $stats->total_contracts ?? 0,
                    'total_lc_value' => round($stats->total_lc_value ?? 0, 2),
                    'total_order_quantity' => $stats->total_order_quantity ?? 0,
                    'avg_b2b_percentage' => round($stats->avg_b2b_percentage ?? 0, 2),
                ],
                'pagination' => [
                    'current_page' => $contracts->currentPage(),
                    'per_page' => $contracts->perPage(),
                    'total' => $contracts->total(),
                    'last_page' => $contracts->lastPage(),
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch contracts: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to retrieve contracts. Please try again later.',
                'errors' => [],
            ], 500);
        }
    }

    /**
     * Store a newly created contract in storage.
     *
     * @param  \App\Http\Requests\StoreContractRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreContractRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $contract = Contract::create($request->validated());

            DB::commit();

            return response()->json([
                'message' => 'Contract created successfully.',
                'data' => new ContractResource($contract->load('buyer')),
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();

            // Handle duplicate key violation (in case unique constraint fails)
            if ($e->errorInfo[1] === 1062) { // MySQL duplicate entry error code
                return response()->json([
                    'message' => 'Contract number already exists.',
                    'errors' => [
                        'contract_no' => ['This contract number is already in use.'],
                    ],
                ], 400);
            }

            Log::error('Database error while creating contract: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Failed to create contract due to a database error.',
                'errors' => [],
            ], 500);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to create contract: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'An unexpected error occurred while creating the contract.',
                'errors' => [],
            ], 500);
        }
    }

    /**
     * Display the specified contract.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $contract = Contract::with('buyer')->findOrFail($id);

            return response()->json([
                'data' => new ContractResource($contract),
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Contract not found.',
                'errors' => [],
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to fetch contract: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Failed to retrieve contract.',
                'errors' => [],
            ], 500);
        }
    }

    /**
     * Get the next available contract number for a given year.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function nextNumber(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'year' => 'required|integer|digits:4|min:2000|max:2100',
            ]);

            $year = $validated['year'];
            $prefix = "IIC/AKCL/CON/{$year}/";

            // Find the highest contract number for the specified year
            $lastContract = Contract::where('contract_no', 'like', "{$prefix}%")
                ->orderByRaw('CAST(SUBSTRING(contract_no, -2) AS UNSIGNED) DESC')
                ->first();

            if ($lastContract) {
                // Extract the running number (NN) from the last contract
                $lastNumber = (int) substr($lastContract->contract_no, -2);

                if ($lastNumber >= 99) {
                    return response()->json([
                        'message' => "Contract number limit reached for year {$year}.",
                        'errors' => [],
                    ], 500);
                }

                $nextNumber = str_pad($lastNumber + 1, 2, '0', STR_PAD_LEFT);
            } else {
                // No contracts exist for this year, start at 01
                $nextNumber = '01';
            }

            $contractNumber = "{$prefix}{$nextNumber}";

            return response()->json([
                'contract_number' => $contractNumber,
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Invalid year parameter.',
                'errors' => $e->errors(),
            ], 400);

        } catch (\Exception $e) {
            Log::error('Failed to generate contract number: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Failed to generate contract number.',
                'errors' => [],
            ], 500);
        }
    }
}
```

---

## 4. API Resource for Consistent Response Formatting

### ContractResource Implementation

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'buyer_id' => $this->buyer_id,
            'buyer_name' => $this->buyer->name ?? null,
            'contract_no' => $this->contract_no,
            'contract_date' => $this->contract_date,
            'amendment_date' => $this->amendment_date,
            'total_orders' => $this->total_orders,
            'order_quantity' => $this->order_quantity,
            'total_contract_value' => number_format($this->total_contract_value, 2, '.', ''),
            'b2b_percentage' => number_format($this->b2b_percentage, 2, '.', ''),
            'status' => $this->status,
            'remarks' => $this->remarks,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
```

---

## 5. Best Practices for Validation Error Handling

### Error Response Structure

Laravel automatically formats Form Request validation errors in the required structure:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "contract_no": [
      "Invalid contract number format. Must match: IIC/AKCL/CON/YYYY/NN",
      "This contract number already exists. Please use a different number."
    ],
    "buyer_id": ["The buyer field is required."],
    "b2b_percentage": ["The B2B percentage must be between 0 and 100."]
  }
}
```

### HTTP Status Code Standards

| Status Code                   | Use Case                                    | Example                                          |
| ----------------------------- | ------------------------------------------- | ------------------------------------------------ |
| **200 OK**                    | Successful GET request                      | Fetching contract list or single contract        |
| **201 Created**               | Successful POST request creating a resource | Contract created successfully                    |
| **400 Bad Request**           | Validation errors or malformed request      | Missing required fields, invalid format          |
| **404 Not Found**             | Resource does not exist                     | Contract ID not found                            |
| **500 Internal Server Error** | Unexpected server error                     | Database connection failure, unhandled exception |

### Frontend Error Handling Pattern

```typescript
// TypeScript example for handling API errors
interface ApiError {
  message: string;
  errors: Record<string, string[]>;
}

async function createContract(data: ContractFormData) {
  try {
    const response = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();

      // Handle validation errors (400)
      if (response.status === 400) {
        // Display field-specific errors
        Object.entries(error.errors).forEach(([field, messages]) => {
          console.error(`${field}: ${messages.join(", ")}`);
        });
      }

      // Handle other errors (404, 500)
      else {
        console.error(error.message);
      }

      throw error;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Failed to create contract:", error);
    throw error;
  }
}
```

---

## 6. Testing Strategy

### Unit Test: Custom Validation Rule

```php
<?php

namespace Tests\Unit\Rules;

use App\Rules\ContractNumberFormat;
use Tests\TestCase;

class ContractNumberFormatTest extends TestCase
{
    protected ContractNumberFormat $rule;

    protected function setUp(): void
    {
        parent::setUp();
        $this->rule = new ContractNumberFormat();
    }

    /** @test */
    public function it_passes_valid_contract_number_format()
    {
        $valid = [
            'IIC/AKCL/CON/2025/01',
            'IIC/AKCL/CON/2024/99',
            'IIC/AKCL/CON/2030/50',
        ];

        foreach ($valid as $contractNo) {
            $failed = false;
            $this->rule->validate('contract_no', $contractNo, function () use (&$failed) {
                $failed = true;
            });

            $this->assertFalse($failed, "Contract number {$contractNo} should be valid");
        }
    }

    /** @test */
    public function it_fails_invalid_contract_number_format()
    {
        $invalid = [
            'IIC/AKCL/CON/2025/1',      // Missing zero-padding
            'IIC/AKCL/CON/25/01',       // Year not 4 digits
            'IIC-AKCL-CON-2025-01',     // Wrong separator
            'IIC/AKCL/CON/2025/100',    // Running number > 99
            'INVALID',                   // Completely wrong format
        ];

        foreach ($invalid as $contractNo) {
            $failed = false;
            $this->rule->validate('contract_no', $contractNo, function () use (&$failed) {
                $failed = true;
            });

            $this->assertTrue($failed, "Contract number {$contractNo} should be invalid");
        }
    }
}
```

### Feature Test: Form Request Validation

```php
<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Contract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContractValidationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->postJson('/api/contracts', []);

        $response->assertStatus(400)
            ->assertJsonStructure([
                'message',
                'errors' => [
                    'buyer_id',
                    'contract_no',
                    'contract_date',
                    'total_orders',
                    'order_quantity',
                    'total_contract_value',
                    'b2b_percentage',
                    'status',
                ],
            ]);
    }

    /** @test */
    public function it_validates_contract_number_format()
    {
        $buyer = Buyer::factory()->create();

        $response = $this->postJson('/api/contracts', [
            'buyer_id' => $buyer->id,
            'contract_no' => 'INVALID-FORMAT',
            'contract_date' => '2025-01-01',
            'total_orders' => 10,
            'order_quantity' => 1000,
            'total_contract_value' => 50000,
            'b2b_percentage' => 50,
            'status' => 'Active',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('errors.contract_no.0',
                'Invalid contract number format. Must match: IIC/AKCL/CON/YYYY/NN (e.g., IIC/AKCL/CON/2025/01)'
            );
    }

    /** @test */
    public function it_validates_contract_number_uniqueness()
    {
        $buyer = Buyer::factory()->create();

        Contract::factory()->create([
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/01',
        ]);

        $response = $this->postJson('/api/contracts', [
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/01', // Duplicate
            'contract_date' => '2025-01-01',
            'total_orders' => 10,
            'order_quantity' => 1000,
            'total_contract_value' => 50000,
            'b2b_percentage' => 50,
            'status' => 'Active',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('errors.contract_no.0',
                'This contract number already exists. Please use a different number.'
            );
    }

    /** @test */
    public function it_validates_b2b_percentage_range()
    {
        $buyer = Buyer::factory()->create();

        // Test value > 100
        $response = $this->postJson('/api/contracts', [
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'contract_date' => '2025-01-01',
            'total_orders' => 10,
            'order_quantity' => 1000,
            'total_contract_value' => 50000,
            'b2b_percentage' => 150, // Invalid
            'status' => 'Active',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('errors.b2b_percentage.0',
                'The B2B percentage cannot exceed 100.'
            );

        // Test negative value
        $response = $this->postJson('/api/contracts', [
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/02',
            'contract_date' => '2025-01-01',
            'total_orders' => 10,
            'order_quantity' => 1000,
            'total_contract_value' => 50000,
            'b2b_percentage' => -10, // Invalid
            'status' => 'Active',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('errors.b2b_percentage.0',
                'The B2B percentage must be at least 0.'
            );
    }

    /** @test */
    public function it_validates_amendment_date_after_or_equal_contract_date()
    {
        $buyer = Buyer::factory()->create();

        $response = $this->postJson('/api/contracts', [
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'contract_date' => '2025-06-01',
            'amendment_date' => '2025-05-01', // Before contract_date (invalid)
            'total_orders' => 10,
            'order_quantity' => 1000,
            'total_contract_value' => 50000,
            'b2b_percentage' => 50,
            'status' => 'Active',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('errors.amendment_date.0',
                'The amendment date must be equal to or after the contract date.'
            );
    }

    /** @test */
    public function it_creates_contract_with_valid_data()
    {
        $buyer = Buyer::factory()->create();

        $response = $this->postJson('/api/contracts', [
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'contract_date' => '2025-01-15',
            'amendment_date' => '2025-02-01',
            'total_orders' => 10,
            'order_quantity' => 1000,
            'total_contract_value' => 50000.50,
            'b2b_percentage' => 75.5,
            'status' => 'Active',
            'remarks' => 'Test contract',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'buyer_id',
                    'buyer_name',
                    'contract_no',
                    'contract_date',
                    'amendment_date',
                    'total_orders',
                    'order_quantity',
                    'total_contract_value',
                    'b2b_percentage',
                    'status',
                    'remarks',
                ],
            ]);

        $this->assertDatabaseHas('contracts', [
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'buyer_id' => $buyer->id,
        ]);
    }
}
```

---

## 7. Alternatives Considered

### Alternative 1: Controller-Based Validation

**Approach**: Use `$request->validate()` directly in controller methods instead of Form Request classes.

```php
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'buyer_id' => 'required|integer|exists:buyers,id',
        'contract_no' => ['required', 'string', new ContractNumberFormat(), 'unique:contracts'],
        // ... other rules
    ]);

    $contract = Contract::create($validated);

    return response()->json(['data' => $contract], 201);
}
```

**Pros**:

- Simpler for small applications
- Fewer files to maintain
- Less abstraction

**Cons**:

- Validation logic coupled to controller
- Harder to test validation rules in isolation
- Less reusable across multiple controller methods
- Custom error formatting requires additional code

**Decision**: Rejected in favor of Form Request classes for better separation of concerns and testability.

---

### Alternative 2: Manual Validation with Validator Facade

**Approach**: Use the `Validator` facade to manually create and run validation.

```php
use Illuminate\Support\Facades\Validator;

public function store(Request $request): JsonResponse
{
    $validator = Validator::make($request->all(), [
        'contract_no' => ['required', new ContractNumberFormat(), 'unique:contracts'],
        // ... other rules
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 400);
    }

    $contract = Contract::create($validator->validated());
    return response()->json(['data' => $contract], 201);
}
```

**Pros**:

- Full control over validation flow
- Can run validation conditionally
- Can add custom error handling logic

**Cons**:

- More verbose than Form Request
- Requires manual error response formatting
- Validation logic still in controller

**Decision**: Rejected as it offers no significant advantage over Form Request while adding boilerplate code.

---

### Alternative 3: Database-Only Validation

**Approach**: Rely solely on database constraints (UNIQUE, NOT NULL, CHECK) without application-level validation.

**Pros**:

- Guaranteed data integrity at database level
- No code duplication between validation layers

**Cons**:

- Poor user experience (generic database error messages)
- No real-time feedback before submission
- No field-specific error messages
- Harder to implement complex business rules (e.g., date cross-validation)

**Decision**: Rejected. Database constraints are necessary but insufficient for user-facing APIs. Application-level validation provides better UX.

---

## 8. Implementation Notes

### Key Considerations

1. **Validation Order**: Laravel executes validation rules in the order specified. Place cheaper validations (required, type checks) before expensive ones (database queries for uniqueness).

2. **Race Conditions**: The `unique:contracts,contract_no` rule can have race conditions if two requests create the same contract number simultaneously. Mitigate with:

   - Database-level UNIQUE constraint (primary defense)
   - Transaction wrapping in controller
   - Optimistic locking if needed

3. **Custom Error Messages**: The `messages()` method in FormRequest allows customizing all validation error messages. Use clear, actionable language.

4. **Authorization**: The `authorize()` method in FormRequest can implement per-request authorization logic (e.g., checking user permissions).

5. **Testing**: Always test both positive cases (valid data) and negative cases (each validation rule failure) in feature tests.

### Database Migration for Contracts Table

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained()->onDelete('cascade');
            $table->string('contract_no', 255)->unique(); // Enforce uniqueness
            $table->date('contract_date');
            $table->date('amendment_date')->nullable();
            $table->integer('total_orders');
            $table->integer('order_quantity');
            $table->decimal('total_contract_value', 15, 2);
            $table->decimal('b2b_percentage', 5, 2);
            $table->enum('status', ['Draft', 'Active', 'Pending', 'Completed', 'Cancelled']);
            $table->text('remarks')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index('contract_no');
            $table->index('status');
            $table->index(['buyer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
```

---

## 9. Summary & Recommendations

### Recommended Stack

- **Form Request Class**: `StoreContractRequest` with all validation rules
- **Custom Rule**: `ContractNumberFormat` for regex pattern validation
- **Controller**: Thin controllers using FormRequest type-hinting
- **API Resource**: `ContractResource` for consistent response formatting
- **Error Format**: Laravel default `{ message, errors: { field: [] } }`
- **HTTP Status Codes**: 200 (GET), 201 (POST), 400 (validation), 404 (not found), 500 (server error)

### Why This Approach Wins

1. **Separation of Concerns**: Validation logic lives in dedicated classes, not controllers
2. **Testability**: Custom rules can be unit tested; FormRequests can be feature tested
3. **Reusability**: Custom rules can be used across multiple FormRequests
4. **Maintainability**: Clear structure makes it easy to add/modify validation rules
5. **Laravel Conventions**: Follows framework best practices and patterns
6. **Type Safety**: FormRequest type-hinting provides IDE autocomplete and static analysis
7. **Automatic Error Formatting**: Laravel handles the error response structure automatically

### Next Steps for Implementation

1. Create `StoreContractRequest` class in `app/Http/Requests/`
2. Create `ContractNumberFormat` rule in `app/Rules/`
3. Update `ContractController` to type-hint `StoreContractRequest`
4. Create `ContractResource` in `app/Http/Resources/`
5. Write unit tests for `ContractNumberFormat` rule
6. Write feature tests for validation scenarios
7. Add database migration with UNIQUE constraint
8. Test end-to-end with frontend integration

---

**Research completed**: 2025-12-04  
**Confidence level**: High - This approach is battle-tested in Laravel applications and aligns with framework conventions.
