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
        // Check if columns already exist before adding
        if (!Schema::hasColumn('master_lcs', 'lc_status')) {
            Schema::table('master_lcs', function (Blueprint $table) {
                $table->string('lc_status', 50)->default('draft')->after('status');
            });
        }

        Schema::table('master_lcs', function (Blueprint $table) {
            // Workflow Timestamp Fields
            if (!Schema::hasColumn('master_lcs', 'applied_at')) {
                $table->timestamp('applied_at')->nullable();
                $table->timestamp('issued_at')->nullable();
                $table->timestamp('goods_shipped_at')->nullable();
                $table->timestamp('documents_forwarded_at')->nullable();
                $table->timestamp('activated_at')->nullable();
            }
            
            // Shipment Details
            if (!Schema::hasColumn('master_lcs', 'shipment_id')) {
                $table->foreignId('shipment_id')->nullable()->constrained('shipments')->onDelete('set null');
            }
            if (!Schema::hasColumn('master_lcs', 'shipping_date')) {
                $table->date('shipping_date')->nullable();
                $table->string('carrier', 255)->nullable();
                $table->string('vessel_name', 255)->nullable();
                $table->string('bill_of_lading_no', 100)->nullable();
                $table->string('port_of_loading', 255)->nullable();
                $table->string('port_of_discharge', 255)->nullable();
            }
            
            // Document Details
            if (!Schema::hasColumn('master_lcs', 'received_documents')) {
                $table->json('received_documents')->nullable();
                $table->json('document_discrepancies')->nullable();
            }
            
            // Verification Details
            if (!Schema::hasColumn('master_lcs', 'advising_bank_verification_status')) {
                $table->string('advising_bank_verification_status', 50)->nullable();
                $table->string('documents_verification_status', 50)->nullable();
            }
            
            // Rejection/Remarks
            if (!Schema::hasColumn('master_lcs', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable();
                $table->text('applicant_remarks')->nullable();
                $table->text('issuer_remarks')->nullable();
                $table->text('advisor_remarks')->nullable();
                $table->text('shipper_remarks')->nullable();
                $table->text('receiver_remarks')->nullable();
                $table->text('forwarder_remarks')->nullable();
                $table->text('verifier_remarks')->nullable();
            }
        });

        // Add indexes separately
        Schema::table('master_lcs', function (Blueprint $table) {
            if (!Schema::hasColumn('master_lcs', 'shipping_date')) {
                // Index already added above
            } else {
                // Indexes
                $table->index('shipping_date');
                $table->index('shipment_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_lcs', function (Blueprint $table) {
            // Drop foreign keys
            $table->dropForeign(['shipment_id']);
            
            // Drop indexes
            $table->dropIndex(['shipping_date']);
            $table->dropIndex(['shipment_id']);
            
            // Drop columns
            $table->dropColumn([
                'lc_status',
                'applied_at',
                'issued_at',
                'goods_shipped_at',
                'documents_forwarded_at',
                'activated_at',
                'shipment_id',
                'shipping_date',
                'carrier',
                'vessel_name',
                'bill_of_lading_no',
                'port_of_loading',
                'port_of_discharge',
                'received_documents',
                'document_discrepancies',
                'advising_bank_verification_status',
                'documents_verification_status',
                'rejection_reason',
                'applicant_remarks',
                'issuer_remarks',
                'advisor_remarks',
                'shipper_remarks',
                'receiver_remarks',
                'forwarder_remarks',
                'verifier_remarks',
            ]);
        });
    }
};
