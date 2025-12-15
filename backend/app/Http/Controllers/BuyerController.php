<?php

namespace App\Http\Controllers;

use App\Models\Buyer;
use App\Http\Requests\StoreBuyerRequest;
use App\Http\Requests\UpdateBuyerRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BuyerController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/buyers",
     *     operationId="getBuyersList",
     *     tags={"Buyers"},
     *     summary="Get paginated list of buyers",
     *     description="Returns a paginated list of buyers with optional search and status filter",
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by name, code, country, or email",
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
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items()),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Buyer::query();

        // Search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Order by name ascending
        $query->orderBy('name', 'asc');

        // Pagination
        $perPage = $request->input('per_page', 15);
        $buyers = $query->paginate($perPage);

        return response()->json($buyers);
    }

    /**
     * @OA\Post(
     *     path="/api/buyers",
     *     operationId="createBuyer",
     *     tags={"Buyers"},
     *     summary="Create a new buyer",
     *     description="Creates a new buyer record",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "country", "email"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="country", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="contact_person", type="string"),
     *             @OA\Property(property="phone", type="string"),
     *             @OA\Property(property="address", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Buyer created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="country", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(StoreBuyerRequest $request): JsonResponse
    {
        $buyer = Buyer::create($request->validated());

        return response()->json($buyer, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/buyers/{id}",
     *     operationId="getBuyer",
     *     tags={"Buyers"},
     *     summary="Get a single buyer",
     *     description="Returns a single buyer by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Buyer ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Buyer")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Buyer not found"
     *     )
     * )
     */
    public function show(Buyer $buyer): JsonResponse
    {
        return response()->json($buyer);
    }

    /**
     * @OA\Put(
     *     path="/api/buyers/{id}",
     *     operationId="updateBuyer",
     *     tags={"Buyers"},
     *     summary="Update a buyer",
     *     description="Updates an existing buyer",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Buyer ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="country", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="contact_person", type="string"),
     *             @OA\Property(property="phone", type="string"),
     *             @OA\Property(property="address", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Buyer updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Buyer not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function update(UpdateBuyerRequest $request, Buyer $buyer): JsonResponse
    {
        $buyer->update($request->validated());

        return response()->json($buyer);
    }

    /**
     * @OA\Delete(
     *     path="/api/buyers/{id}",
     *     operationId="deleteBuyer",
     *     tags={"Buyers"},
     *     summary="Delete a buyer",
     *     description="Deletes a buyer if not referenced by contracts",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Buyer ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Buyer deleted successfully"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Buyer not found"
     *     ),
     *     @OA\Response(
     *         response=409,
     *         description="Cannot delete - buyer is referenced by contracts"
     *     )
     * )
     */
    public function destroy(Buyer $buyer): JsonResponse
    {
        // Check if buyer is referenced by contracts
        if (!$buyer->canDelete()) {
            return response()->json([
                'message' => 'Cannot delete buyer. It is referenced by existing contracts.'
            ], 409);
        }

        $buyer->delete();

        return response()->json(null, 204);
    }

    /**
     * Get buyers for dropdown selection (id and name only).
     */
    public function dropdown(): JsonResponse
    {
        $buyers = Buyer::select('id', 'name', 'code')
            ->active()
            ->orderBy('name')
            ->get();

        return response()->json($buyers);
    }
}
