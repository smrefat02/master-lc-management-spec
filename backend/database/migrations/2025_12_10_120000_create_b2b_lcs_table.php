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
        Schema::create('b2b_lcs', function (Blueprint $table) {
            $table->id();
            
            // Foreign Keys
            $table->foreignId('contract_id')
                  ->constrained('contracts')
                  ->onDelete('cascade');
            
            $table->foreignId('order_id')
                  ->constrained('orders')
                  ->onDelete('cascade');
            
            // Costing Detail ID (references ID in orders.cost_details JSON)
            $table->unsignedBigInteger('costing_detail_id');
            
            // Business Fields
            $table->string('pi_number')->unique();
            $table->string('supplier');
            $table->integer('order_qty');
            $table->decimal('fob_value', 15, 2);
            $table->decimal('order_value', 15, 2);
            $table->decimal('post_pi_value', 15, 2);
            $table->decimal('b2b_percent', 5, 2);
            
            // Status
            $table->enum('status', ['draft', 'active', 'completed', 'cancelled'])
                  ->default('draft');
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('supplier');
            $table->index('status');
            $table->index(['contract_id', 'order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('b2b_lcs');
    }
};
