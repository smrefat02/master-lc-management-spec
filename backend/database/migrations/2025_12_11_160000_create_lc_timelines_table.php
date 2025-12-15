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
        Schema::create('lc_timelines', function (Blueprint $table) {
            $table->id();
            
            // Foreign Key
            $table->foreignId('master_lc_id')->constrained('master_lcs')->onDelete('cascade');
            
            // Action Details
            $table->string('action', 100); // created, applied, issued, verified, etc.
            $table->text('description');
            
            // Status Transition
            $table->string('previous_status', 50)->nullable();
            $table->string('new_status', 50);
            
            // User Info
            $table->string('performed_by', 255);
            $table->string('user_role', 50)->nullable();
            
            // Additional Data
            $table->json('metadata')->nullable(); // Store additional context
            $table->text('remarks')->nullable();
            
            // Timestamp
            $table->timestamp('performed_at');
            
            // Indexes
            $table->index('master_lc_id');
            $table->index('action');
            $table->index('performed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lc_timelines');
    }
};
