<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\BuyerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\B2BLCController;
use App\Http\Controllers\MasterLCController;
use App\Http\Controllers\BankController;

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
Route::get('/buyers/dropdown', [BuyerController::class, 'dropdown']);
Route::get('/buyers', [BuyerController::class, 'index']);
Route::post('/buyers', [BuyerController::class, 'store']);
Route::get('/buyers/{buyer}', [BuyerController::class, 'show']);
Route::put('/buyers/{buyer}', [BuyerController::class, 'update']);
Route::delete('/buyers/{buyer}', [BuyerController::class, 'destroy']);

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

// Master LC routes
Route::get('/master-lc-generate-number', [MasterLCController::class, 'generateNumber']);
Route::get('/master-lc-dropdown-data', [MasterLCController::class, 'dropdownData']);
Route::get('/master-lc', [MasterLCController::class, 'index']);
Route::post('/master-lc', [MasterLCController::class, 'store']);
Route::get('/master-lc/{id}', [MasterLCController::class, 'show']);
Route::put('/master-lc/{id}', [MasterLCController::class, 'update']);
Route::delete('/master-lc/{id}', [MasterLCController::class, 'destroy']);
Route::post('/master-lc/{id}/status', [MasterLCController::class, 'changeStatus']);
Route::post('/master-lc/{id}/upload', [MasterLCController::class, 'uploadAttachment']);
Route::delete('/master-lc/{id}/attachment/{attachmentId}', [MasterLCController::class, 'deleteAttachment']);
Route::get('/master-lc/{id}/attachment/{attachmentId}/download', [MasterLCController::class, 'downloadAttachment']);

// Master LC Banking Workflow routes (v2.0 - deprecated)
Route::put('/master-lcs/{masterLc}/issue-bank', [MasterLCController::class, 'issueBank']);
Route::put('/master-lcs/{masterLc}/advise-bank', [MasterLCController::class, 'adviseBank']);
Route::put('/master-lcs/{masterLc}/documents', [MasterLCController::class, 'updateDocuments']);

// Master LC v3.0 Workflow routes (8-step LC lifecycle)
Route::put('/master-lc/{masterLC}/apply', [MasterLCController::class, 'apply']);
Route::put('/master-lc/{masterLC}/issue', [MasterLCController::class, 'issue']);
Route::put('/master-lc/{masterLC}/advise', [MasterLCController::class, 'advise']);
Route::put('/master-lc/{masterLC}/ship-goods', [MasterLCController::class, 'shipGoods']);
Route::put('/master-lc/{masterLC}/documents/receive', [MasterLCController::class, 'receiveDocuments']);
Route::put('/master-lc/{masterLC}/documents/forward', [MasterLCController::class, 'forwardDocuments']);
Route::put('/master-lc/{masterLC}/documents/verify', [MasterLCController::class, 'verifyDocuments']);
Route::put('/master-lc/{masterLC}/activate', [MasterLCController::class, 'activate']);
Route::put('/master-lc/{masterLC}/reject', [MasterLCController::class, 'reject']);
Route::get('/master-lc/{masterLC}/timeline', [MasterLCController::class, 'timeline']);

// Banks routes
Route::get('/banks', [BankController::class, 'index']);
Route::get('/banks/{bank}', [BankController::class, 'show']);

// Supplier routes
Route::get('/suppliers/generate-code', [\App\Http\Controllers\SupplierController::class, 'generateCode']);
Route::get('/suppliers', [\App\Http\Controllers\SupplierController::class, 'index']);
Route::post('/suppliers', [\App\Http\Controllers\SupplierController::class, 'store']);
Route::get('/suppliers/{supplier}', [\App\Http\Controllers\SupplierController::class, 'show']);
Route::put('/suppliers/{supplier}', [\App\Http\Controllers\SupplierController::class, 'update']);
Route::delete('/suppliers/{supplier}', [\App\Http\Controllers\SupplierController::class, 'destroy']);
