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
        Schema::table('master_lcs', function (Blueprint $table) {
            // Issuing Bank Fields
            $table->foreignId('issuing_bank_id')->nullable()->constrained('banks')->onDelete('set null');
            $table->string('issuing_bank_reference_no', 100)->nullable();
            $table->date('issuing_bank_issue_date')->nullable();
            
            // Advising Bank Fields
            $table->foreignId('advising_bank_id')->nullable()->constrained('banks')->onDelete('set null');
            $table->string('advising_bank_confirmation_status', 50)->nullable(); // using string instead of enum for SQLite
            $table->timestamp('advising_bank_verified_at')->nullable();
            
            // Document Tracking Fields
            $table->timestamp('documents_received_at')->nullable();
            $table->timestamp('documents_forwarded_to_bank_at')->nullable();
            $table->timestamp('documents_verified_at')->nullable();
            
            // Indexes for performance
            $table->index('issuing_bank_id');
            $table->index('advising_bank_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_lcs', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['issuing_bank_id']);
            $table->dropForeign(['advising_bank_id']);
            
            // Drop indexes
            $table->dropIndex(['issuing_bank_id']);
            $table->dropIndex(['advising_bank_id']);
            
            // Drop columns
            $table->dropColumn([
                'issuing_bank_id',
                'issuing_bank_reference_no',
                'issuing_bank_issue_date',
                'advising_bank_id',
                'advising_bank_confirmation_status',
                'advising_bank_verified_at',
                'documents_received_at',
                'documents_forwarded_to_bank_at',
                'documents_verified_at',
            ]);
        });
        
        // Revert lc_status to original values
        DB::statement("ALTER TABLE master_lcs MODIFY COLUMN lc_status ENUM('draft', 'active', 'expired') DEFAULT 'draft'");
    }
};
