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
     * Display a listing of B2B LCs with filters and pagination.
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
     * Store a newly created B2B LC in storage.
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
     * Display the specified B2B LC.
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
     * Update the specified B2B LC in storage.
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
     * Remove the specified B2B LC from storage.
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
