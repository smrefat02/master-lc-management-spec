<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="LC Management API",
 *     version="1.2.0",
 *     description="LC Management System API - Complete system for managing contracts, buyers, orders, and shipments. Includes contract management, order processing with cost tracking, shipment tracking with summary statistics, and comprehensive reporting capabilities.",
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
 * @OA\Tag(
 *     name="Orders",
 *     description="Order management endpoints - Create, read, update, and delete orders with cost tracking"
 * )
 * 
 * @OA\Tag(
 *     name="Shipments",
 *     description="Shipment management endpoints - Track shipments against contracts and orders with summary statistics"
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
 * 
 * @OA\Schema(
 *     schema="CostDetail",
 *     type="object",
 *     title="Cost Detail",
 *     description="Individual cost item for order",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="YARN"),
 *     @OA\Property(property="preCosting", type="number", format="decimal", example=0.50),
 *     @OA\Property(property="budget", type="number", format="decimal", example=0.45),
 *     @OA\Property(property="budgetPercent", type="number", format="decimal", example=5.50),
 *     @OA\Property(property="postCosting", type="number", format="decimal", example=0.48),
 *     @OA\Property(property="b2bPercent", type="number", format="decimal", example=6.00),
 *     @OA\Property(property="status", type="string", example="draft")
 * )
 * 
 * @OA\Schema(
 *     schema="OrderTotals",
 *     type="object",
 *     title="Order Totals",
 *     description="Calculated totals for order costs",
 *     @OA\Property(property="fabricsPreCosting", type="number", format="decimal", example=3.50),
 *     @OA\Property(property="fabricsBudget", type="number", format="decimal", example=3.15),
 *     @OA\Property(property="accessoriesPreCosting", type="number", format="decimal", example=2.00),
 *     @OA\Property(property="accessoriesBudget", type="number", format="decimal", example=1.85),
 *     @OA\Property(property="totalPreCosting", type="number", format="decimal", example=5.50),
 *     @OA\Property(property="totalBudget", type="number", format="decimal", example=5.00)
 * )
 * 
 * @OA\Schema(
 *     schema="Order",
 *     type="object",
 *     title="Order",
 *     description="Order model with complete details",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="contract_id", type="integer", example=1),
 *     @OA\Property(property="order_number", type="string", example="ORD-000123"),
 *     @OA\Property(property="buyer_name", type="string", example="ABC Corp"),
 *     @OA\Property(property="master_lc_value", type="number", format="decimal", example=50000.00),
 *     @OA\Property(property="budget_no", type="string", example="3"),
 *     @OA\Property(property="order_value", type="number", format="decimal", example=45000.00),
 *     @OA\Property(property="description", type="string", example="Winter collection order"),
 *     @OA\Property(property="contract_no", type="string", example="IIC/AKCL/CON/2025/01"),
 *     @OA\Property(property="status", type="string", enum={"draft", "on_process", "completed", "cancelled"}, example="draft"),
 *     @OA\Property(property="style", type="string", example="CASUAL-001"),
 *     @OA\Property(property="fob_value", type="number", format="decimal", example=12.50),
 *     @OA\Property(property="order_qty", type="integer", example=5000),
 *     @OA\Property(property="shipment_date", type="string", format="date", example="2025-12-15"),
 *     @OA\Property(property="actual_shipment", type="string", format="date", nullable=true, example="2025-12-13"),
 *     @OA\Property(property="fabrics_details", type="string", example="100% Cotton, 180 GSM"),
 *     @OA\Property(property="notes", type="string", example="Rush order"),
 *     @OA\Property(
 *         property="cost_details",
 *         type="array",
 *         description="Array of cost items (YARN, Knitting, Dyeing, etc.)",
 *         @OA\Items(ref="#/components/schemas/CostDetail")
 *     ),
 *     @OA\Property(
 *         property="totals",
 *         description="Calculated totals for fabrics, accessories, and grand total",
 *         ref="#/components/schemas/OrderTotals"
 *     ),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-12-09T10:30:00Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-12-09T14:45:00Z"),
 *     @OA\Property(
 *         property="contract",
 *         description="Associated contract with buyer information",
 *         ref="#/components/schemas/Contract"
 *     )
 * )
 * 
 * @OA\Schema(
 *     schema="Shipment",
 *     type="object",
 *     title="Shipment",
 *     description="Shipment model with complete details",
 *     @OA\Property(property="id", type="integer", example=1, description="Unique shipment ID"),
 *     @OA\Property(property="contract_id", type="integer", example=1, description="Foreign key to contracts table"),
 *     @OA\Property(property="order_id", type="integer", example=1, description="Foreign key to orders table"),
 *     @OA\Property(property="buyer_name", type="string", example="Test Buyer", description="Buyer name (auto-populated)"),
 *     @OA\Property(property="sales_contract", type="string", example="MORD-1765279004085", description="Contract number (auto-populated)"),
 *     @OA\Property(property="order_number", type="string", example="GCOSTING-1765275998074", description="Order number (auto-populated)"),
 *     @OA\Property(property="shipping_date", type="string", format="date", nullable=true, example="2025-12-10", description="Date of shipment"),
 *     @OA\Property(property="shipment_qty", type="integer", example=100, description="Quantity shipped (whole numbers only)"),
 *     @OA\Property(property="shipment_value", type="number", format="float", example=1000.00, description="Total shipment value in USD"),
 *     @OA\Property(property="reference_no", type="string", nullable=true, example="BL-12345", description="Reference number (BL/Invoice/Internal)"),
 *     @OA\Property(property="remarks", type="string", nullable=true, example="First shipment", description="Additional notes"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-12-09T10:30:00Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-12-09T14:45:00Z"),
 *     @OA\Property(
 *         property="contract",
 *         description="Associated contract with buyer information",
 *         ref="#/components/schemas/Contract"
 *     ),
 *     @OA\Property(
 *         property="order",
 *         description="Associated order details",
 *         ref="#/components/schemas/Order"
 *     )
 * )
 */
abstract class Controller
{
    //
}
