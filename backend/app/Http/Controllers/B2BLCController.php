<?php

namespace App\Http\Controllers;

use App\Models\B2BLC;
use App\Http\Requests\StoreB2BLCRequest;
use App\Http\Requests\UpdateB2BLCRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class B2BLCController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/b2b-lc",
     *     tags={"B2B LC"},
     *     summary="List all B2B LCs",
     *     description="Get paginated list of Back-to-Back Letter of Credits with filters",
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
     *         name="status",
     *         in="query",
     *         description="Filter by status",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="pi_number",
     *         in="query",
     *         description="Search by PI number",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="supplier",
     *         in="query",
     *         description="Filter by supplier",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="data", type="array", @OA\Items()),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = B2BLC::with(['contract.buyer', 'order']);

            // Apply filters
            if ($request->has('pi_number') && $request->pi_number) {
                $query->filterByPiNumber($request->pi_number);
            }

            if ($request->has('supplier') && $request->supplier) {
                $query->filterBySupplier($request->supplier);
            }

            if ($request->has('status') && $request->status) {
                $query->filterByStatus($request->status);
            }

            // Order by most recent first
            $query->orderBy('created_at', 'desc');

            // Paginate results
            $perPage = $request->get('per_page', 15);
            $b2blcs = $query->paginate($perPage);

            // Add costing detail name to each record
            $b2blcs->getCollection()->transform(function ($b2blc) {
                if ($b2blc->order && $b2blc->order->cost_details) {
                    $costDetails = is_string($b2blc->order->cost_details) 
                        ? json_decode($b2blc->order->cost_details, true) 
                        : $b2blc->order->cost_details;
                    
                    // Find the costing detail by id
                    $costingDetail = collect($costDetails)->firstWhere('id', $b2blc->costing_detail_id);
                    $b2blc->costing_detail_name = $costingDetail['supplier'] ?? 'N/A';
                } else {
                    $b2blc->costing_detail_name = 'N/A';
                }
                return $b2blc;
            });

            return response()->json($b2blcs);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching B2B LCs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/b2b-lc",
     *     tags={"B2B LC"},
     *     summary="Create new B2B LC",
     *     description="Create a new Back-to-Back Letter of Credit",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"pi_number", "order_id", "costing_detail_id", "issue_date", "expiry_date"},
     *             @OA\Property(property="pi_number", type="string", example="PI-2025-001"),
     *             @OA\Property(property="order_id", type="integer", example=1),
     *             @OA\Property(property="costing_detail_id", type="integer", example=1),
     *             @OA\Property(property="issue_date", type="string", format="date", example="2025-01-01"),
     *             @OA\Property(property="expiry_date", type="string", format="date", example="2025-12-31"),
     *             @OA\Property(property="supplier_info", type="object"),
     *             @OA\Property(property="beneficiary_bank_info", type="object"),
     *             @OA\Property(property="pi_value", type="number", example=50000),
     *             @OA\Property(property="currency", type="string", example="USD"),
     *             @OA\Property(property="payment_terms", type="string"),
     *             @OA\Property(property="status", type="string", example="draft")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="B2B LC created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreB2BLCRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Set default status if not provided
            if (!isset($validated['status'])) {
                $validated['status'] = 'draft';
            }

            // Create B2B LC (calculations handled in model boot method)
            $b2blc = B2BLC::create($validated);

            // Load relationships
            $b2blc->load(['contract.buyer', 'order']);

            return response()->json([
                'message' => 'B2B LC created successfully',
                'data' => $b2blc
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating B2B LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/b2b-lc/{id}",
     *     tags={"B2B LC"},
     *     summary="Get B2B LC details",
     *     description="Get detailed information about a specific B2B LC",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(response=404, description="B2B LC not found")
     * )
     */
    public function show(B2BLC $b2bLc): JsonResponse
    {
        try {
            $b2bLc->load(['contract.buyer', 'order']);

            return response()->json($b2bLc);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching B2B LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/b2b-lc/{id}",
     *     tags={"B2B LC"},
     *     summary="Update B2B LC",
     *     description="Update an existing B2B LC",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="expiry_date", type="string", format="date"),
     *             @OA\Property(property="pi_value", type="number"),
     *             @OA\Property(property="status", type="string"),
     *             @OA\Property(property="supplier_info", type="object"),
     *             @OA\Property(property="payment_terms", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="B2B LC updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="B2B LC not found")
     * )
     */
    public function update(UpdateB2BLCRequest $request, B2BLC $b2bLc): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Update B2B LC (calculations handled in model boot method)
            $b2bLc->update($validated);

            // Reload relationships
            $b2bLc->load(['contract.buyer', 'order']);

            return response()->json([
                'message' => 'B2B LC updated successfully',
                'data' => $b2bLc
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating B2B LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/b2b-lc/{id}",
     *     tags={"B2B LC"},
     *     summary="Delete B2B LC",
     *     description="Remove a B2B LC from the system",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="B2B LC deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(response=404, description="B2B LC not found")
     * )
     */
    public function destroy(B2BLC $b2bLc): JsonResponse
    {
        try {
            $b2bLc->delete();

            return response()->json([
                'message' => 'B2B LC deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting B2B LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
