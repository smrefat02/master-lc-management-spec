<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\BuyerController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Contract routes
// NOTE: Specific routes MUST come before parameterized routes
Route::get('/contracts/next-number', [ContractController::class, 'nextNumber']);
Route::get('/contracts', [ContractController::class, 'index']);
Route::post('/contracts', [ContractController::class, 'store']);
Route::get('/contracts/{id}', [ContractController::class, 'show']);
Route::put('/contracts/{id}', [ContractController::class, 'update']);

// Buyer routes
Route::get('/buyers', [BuyerController::class, 'index']);
