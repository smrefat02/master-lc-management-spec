<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\BuyerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\B2BLCController;

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

// Order routes
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::put('/orders/{id}', [OrderController::class, 'update']);
Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

// Shipment routes
Route::get('/shipments', [ShipmentController::class, 'index']);
Route::post('/shipments', [ShipmentController::class, 'store']);
Route::get('/shipments/{id}', [ShipmentController::class, 'show']);
Route::put('/shipments/{id}', [ShipmentController::class, 'update']);
Route::delete('/shipments/{id}', [ShipmentController::class, 'destroy']);

// B2B LC routes
Route::get('/b2b-lc', [B2BLCController::class, 'index']);
Route::post('/b2b-lc', [B2BLCController::class, 'store']);
Route::get('/b2b-lc/{b2bLc}', [B2BLCController::class, 'show']);
Route::put('/b2b-lc/{b2bLc}', [B2BLCController::class, 'update']);
Route::delete('/b2b-lc/{b2bLc}', [B2BLCController::class, 'destroy']);
