<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Services\SupplierCodeGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SupplierController extends Controller
{
    protected $codeGenerator;

    public function __construct(SupplierCodeGenerator $codeGenerator)
    {
        $this->codeGenerator = $codeGenerator;
    }

    /**
     * @OA\Get(
     *     path="/api/suppliers",
     *     tags={"Suppliers"},
     *     summary="List all suppliers",
     *     description="Get paginated list of suppliers with search and filter options",
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by name, code, or email",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"active", "inactive"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items()),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Supplier::query();

            // Apply search
            if ($request->has('search') && !empty($request->search)) {
                $query->search($request->search);
            }

            // Apply status filter
            if ($request->has('status') && !empty($request->status)) {
                $query->byStatus($request->status);
            }

            // Apply sorting
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = min($request->input('per_page', 15), 100);
            $suppliers = $query->paginate($perPage);

            return response()->json(SupplierResource::collection($suppliers));
        } catch (\Exception $e) {
            Log::error('Error fetching suppliers: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching suppliers.',
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/suppliers",
     *     tags={"Suppliers"},
     *     summary="Create new supplier",
     *     description="Create a new supplier record",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "contact_person", "email", "country"},
     *             @OA\Property(property="supplier_code", type="string", example="SUP-2025-001"),
     *             @OA\Property(property="name", type="string", example="ABC Suppliers Ltd"),
     *             @OA\Property(property="contact_person", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@abc.com"),
     *             @OA\Property(property="phone", type="string", example="+1234567890"),
     *             @OA\Property(property="address", type="string", example="123 Business St"),
     *             @OA\Property(property="city", type="string", example="New York"),
     *             @OA\Property(property="country", type="string", example="USA"),
     *             @OA\Property(property="business_license", type="string"),
     *             @OA\Property(property="tax_id", type="string"),
     *             @OA\Property(property="bank_name", type="string"),
     *             @OA\Property(property="bank_account", type="string"),
     *             @OA\Property(property="swift_code", type="string"),
     *             @OA\Property(property="payment_terms", type="string"),
     *             @OA\Property(property="currency", type="string", example="USD"),
     *             @OA\Property(property="status", type="string", enum={"active", "inactive"}, default="active")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Supplier created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreSupplierRequest $request): JsonResponse
    {
        try {
            $supplier = Supplier::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Supplier created successfully',
                'data' => new SupplierResource($supplier),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating supplier: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the supplier.',
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/suppliers/{id}",
     *     tags={"Suppliers"},
     *     summary="Get supplier details",
     *     description="Get detailed information about a specific supplier",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Supplier not found")
     * )
     */
    public function show(Supplier $supplier): JsonResponse
    {
        return response()->json([
            'data' => new SupplierResource($supplier),
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/suppliers/{id}",
     *     tags={"Suppliers"},
     *     summary="Update supplier",
     *     description="Update an existing supplier",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="contact_person", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="phone", type="string"),
     *             @OA\Property(property="address", type="string"),
     *             @OA\Property(property="city", type="string"),
     *             @OA\Property(property="country", type="string"),
     *             @OA\Property(property="bank_name", type="string"),
     *             @OA\Property(property="bank_account", type="string"),
     *             @OA\Property(property="swift_code", type="string"),
     *             @OA\Property(property="payment_terms", type="string"),
     *             @OA\Property(property="status", type="string", enum={"active", "inactive"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Supplier updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Supplier not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier): JsonResponse
    {
        try {
            $supplier->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Supplier updated successfully',
                'data' => new SupplierResource($supplier),
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating supplier: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the supplier.',
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/suppliers/{id}",
     *     tags={"Suppliers"},
     *     summary="Delete supplier",
     *     description="Remove a supplier from the system (only if no associated B2B-LCs exist)",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Supplier deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=409,
     *         description="Cannot delete supplier with associated records",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Supplier not found")
     * )
     */
    public function destroy(Supplier $supplier): JsonResponse
    {
        try {
            // Check if supplier can be deleted
            if (!$supplier->canBeDeleted()) {
                $count = $supplier->b2bLcs()->count();
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete supplier. This supplier has {$count} associated B2B-LC records.",
                ], 409);
            }

            $supplier->delete();

            return response()->json([
                'success' => true,
                'message' => 'Supplier deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting supplier: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the supplier.',
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/suppliers/generate-code",
     *     tags={"Suppliers"},
     *     summary="Generate supplier code",
     *     description="Generate the next available supplier code automatically",
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="code", type="string", example="SUP-2025-0042")
     *         )
     *     )
     * )
     */
    public function generateCode(): JsonResponse
    {
        try {
            $code = $this->codeGenerator->generate();

            return response()->json([
                'code' => $code,
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating supplier code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while generating the supplier code.',
            ], 500);
        }
    }
}
