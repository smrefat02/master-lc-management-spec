<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="LC Management API",
 *     version="1.0.0",
 *     description="Sales Contracts Management System API - Manage contracts, buyers, and contract number generation",
 *     @OA\Contact(
 *         name="API Support",
 *         email="support@lcmanagement.example.com"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://127.0.0.1:8000",
 *     description="Local Development Server"
 * )
 * 
 * @OA\Server(
 *     url="http://localhost:8000",
 *     description="Local Development Server (Alternative)"
 * )
 * 
 * @OA\Tag(
 *     name="Contracts",
 *     description="Contract management endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Buyers",
 *     description="Buyer information endpoints"
 * )
 * 
 * @OA\Schema(
 *     schema="Buyer",
 *     type="object",
 *     title="Buyer",
 *     description="Buyer model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Pfannerstill PLC")
 * )
 * 
 * @OA\Schema(
 *     schema="Contract",
 *     type="object",
 *     title="Contract",
 *     description="Contract model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="buyer_id", type="integer", example=3),
 *     @OA\Property(property="contract_no", type="string", example="IIC/AKCL/CON/2025/01", pattern="^IIC/AKCL/CON/\d{4}/\d{2}$"),
 *     @OA\Property(property="contract_date", type="string", format="date", example="2025-01-15"),
 *     @OA\Property(property="amendment_date", type="string", format="date", nullable=true, example="2025-02-20"),
 *     @OA\Property(property="total_orders", type="integer", example=10),
 *     @OA\Property(property="order_quantity", type="integer", example=34216),
 *     @OA\Property(property="value_usd", type="number", format="decimal", example=225803.23),
 *     @OA\Property(property="b2b_percent", type="number", format="decimal", example=18.22),
 *     @OA\Property(property="status", type="string", enum={"draft", "active", "pending", "completed", "cancelled"}, example="active"),
 *     @OA\Property(property="remarks", type="string", nullable=true, example="Sample contract remarks"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-15T10:30:00Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-02-20T14:45:00Z"),
 *     @OA\Property(
 *         property="buyer",
 *         ref="#/components/schemas/Buyer"
 *     )
 * )
 * 
 * @OA\Schema(
 *     schema="Pagination",
 *     type="object",
 *     title="Pagination",
 *     description="Pagination metadata",
 *     @OA\Property(property="current_page", type="integer", example=1),
 *     @OA\Property(property="per_page", type="integer", example=15),
 *     @OA\Property(property="total", type="integer", example=30),
 *     @OA\Property(property="last_page", type="integer", example=2)
 * )
 * 
 * @OA\Schema(
 *     schema="Summary",
 *     type="object",
 *     title="Summary",
 *     description="Contract summary statistics",
 *     @OA\Property(property="total_contracts", type="integer", example=30),
 *     @OA\Property(property="total_value_usd", type="number", format="decimal", example=6500000.50),
 *     @OA\Property(property="total_order_quantity", type="integer", example=1250000),
 *     @OA\Property(property="avg_b2b_percent", type="number", format="decimal", example=22.45)
 * )
 * 
 * @OA\Schema(
 *     schema="ValidationError",
 *     type="object",
 *     title="Validation Error",
 *     description="Validation error response",
 *     @OA\Property(property="message", type="string", example="The given data was invalid."),
 *     @OA\Property(
 *         property="errors",
 *         type="object",
 *         @OA\AdditionalProperties(
 *             type="array",
 *             @OA\Items(type="string", example="The contract no field is required.")
 *         )
 *     )
 * )
 * 
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     type="object",
 *     title="Error Response",
 *     description="Generic error response",
 *     @OA\Property(property="message", type="string", example="Resource not found")
 * )
 */
abstract class Controller
{
    //
}
