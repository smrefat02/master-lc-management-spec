<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/banks",
     *     tags={"Banks"},
     *     summary="List all active banks",
     *     description="Get list of banks with optional search and status filter",
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by bank status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"active", "inactive"}, default="active")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by name, SWIFT code, or country",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items())
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Bank::query();
        
        // Filter by status (default to active)
        $status = $request->input('status', 'active');
        if ($status) {
            $query->where('status', $status);
        }
        
        // Search functionality
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('swift_code', 'like', "%{$search}%")
                  ->orWhere('country', 'like', "%{$search}%");
            });
        }
        
        $banks = $query->orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $banks,
        ]);
    }
    
    /**
     * @OA\Get(
     *     path="/api/banks/{id}",
     *     tags={"Banks"},
     *     summary="Get bank details",
     *     description="Get detailed information about a specific bank",
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
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Bank not found")
     * )
     */
    public function show(Bank $bank): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $bank,
        ]);
    }
}
