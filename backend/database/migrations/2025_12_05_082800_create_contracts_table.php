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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('buyers')->onDelete('cascade');
            $table->string('contract_no')->unique();
            $table->date('contract_date');
            $table->date('amendment_date')->nullable();
            $table->integer('total_orders')->default(0);
            $table->integer('order_quantity')->default(0);
            $table->decimal('value_usd', 14, 2)->default(0);
            $table->decimal('b2b_percent', 6, 2)->default(0);
            $table->string('status')->default('draft');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
