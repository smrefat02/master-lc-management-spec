<?php

namespace App\Http\Controllers;

use App\Models\Buyer;
use Illuminate\Http\Request;

class BuyerController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/buyers",
     *     operationId="getBuyersList",
     *     tags={"Buyers"},
     *     summary="Get list of buyers",
     *     description="Returns a list of all buyers (id and name only) sorted alphabetically. Used for dropdown selections.",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Buyer")
     *         )
     *     )
     * )
     *
     * Display a list of all buyers (id and name only for dropdowns).
     */
    public function index()
    {
        $buyers = Buyer::select('id', 'name')
            ->orderBy('name')
            ->get();
        
        return response()->json($buyers);
    }
}
