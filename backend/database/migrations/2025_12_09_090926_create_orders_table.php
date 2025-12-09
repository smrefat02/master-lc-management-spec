<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->onDelete('cascade');
            $table->string('order_number')->unique();
            $table->string('buyer_name');
            $table->decimal('master_lc_value', 15, 2)->default(0);
            $table->string('budget_no')->nullable();
            $table->decimal('order_value', 15, 2)->default(0);
            $table->text('description')->nullable();
            $table->string('contract_no');
            $table->enum('status', ['draft', 'on_process', 'completed', 'cancelled'])->default('draft');
            $table->string('style')->nullable();
            $table->decimal('fob_value', 10, 2)->default(0);
            $table->integer('order_qty')->default(0);
            $table->date('shipment_date')->nullable();
            $table->date('actual_shipment')->nullable();
            $table->text('fabrics_details')->nullable();
            $table->text('notes')->nullable();
            $table->json('cost_details')->nullable();
            $table->json('totals')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
