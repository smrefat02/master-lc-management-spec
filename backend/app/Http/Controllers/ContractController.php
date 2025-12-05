<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    /**
     * Display a paginated list of contracts with summary statistics.
     */
    public function index(Request $request)
    {
        // Validate pagination parameters
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $perPage = $request->input('per_page', 15);
        
        // Eager load buyer relationship and paginate
        $contracts = Contract::with('buyer')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        // Calculate summary statistics
        $summary = [
            'total_contracts' => Contract::count(),
            'total_value_usd' => Contract::sum('value_usd'),
            'total_order_quantity' => Contract::sum('order_quantity'),
            'avg_b2b_percent' => Contract::avg('b2b_percent'),
        ];
        
        return response()->json([
            'contracts' => $contracts->items(),
            'pagination' => [
                'current_page' => $contracts->currentPage(),
                'per_page' => $contracts->perPage(),
                'total' => $contracts->total(),
                'last_page' => $contracts->lastPage(),
            ],
            'summary' => $summary,
        ]);
    }
}
