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
        Schema::create('master_lcs', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Foreign Keys
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->onDelete('set null');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');

            // LC Identification
            $table->string('lc_number', 50)->unique();
            $table->enum('lc_number_mode', ['auto', 'manual'])->default('auto');

            // Dates
            $table->date('issue_date');
            $table->date('expiry_date');

            // Financial
            $table->decimal('amount', 15, 2);
            $table->enum('currency', ['USD', 'EUR', 'GBP'])->default('USD');
            $table->decimal('exchange_rate', 15, 6)->nullable();
            $table->decimal('converted_amount', 15, 2)->nullable();

            // JSON Objects
            $table->json('buyer_info');
            $table->json('beneficiary_info');
            $table->json('bank_info');
            $table->json('required_documents')->nullable();
            $table->json('attachments')->nullable();

            // Terms
            $table->text('terms_and_conditions')->nullable();

            // Status & Workflow
            $table->enum('status', ['draft', 'submitted', 'reviewed', 'approved', 'active', 'expired', 'cancelled'])->default('draft');
            $table->text('cancellation_reason')->nullable();

            // Audit Fields
            $table->string('created_by')->nullable();
            $table->string('approved_by')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('issue_date');
            $table->index('expiry_date');
            $table->index('currency');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_lcs');
    }
};
