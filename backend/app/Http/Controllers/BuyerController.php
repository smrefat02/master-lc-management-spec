<?php

namespace App\Http\Controllers;

use App\Models\Buyer;
use Illuminate\Http\Request;

class BuyerController extends Controller
{
    /**
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
