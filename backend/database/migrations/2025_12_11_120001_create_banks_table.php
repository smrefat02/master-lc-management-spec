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
        Schema::create('banks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('swift_code', 50)->unique();
            $table->text('address')->nullable();
            $table->string('country', 100)->nullable();
            $table->string('branch', 255)->nullable();
            $table->string('contact_person', 255)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('status', 50)->default('active'); // active, inactive
            $table->timestamps();
            
            // Indexes
            $table->index('swift_code');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banks');
    }
};
