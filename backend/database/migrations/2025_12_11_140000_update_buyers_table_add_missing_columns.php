<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite compatibility, we need to handle this differently
        // First, add nullable columns and then update them

        Schema::table('buyers', function (Blueprint $table) {
            // Add new columns as nullable first (SQLite compatibility)
            $table->string('code', 50)->nullable()->after('name');
            $table->string('contact_person', 255)->nullable()->after('code');
            $table->string('country', 100)->nullable()->after('address');
            $table->string('status')->default('active')->after('country');
        });

        // Generate unique codes for existing buyers
        $buyers = DB::table('buyers')->get();
        foreach ($buyers as $buyer) {
            DB::table('buyers')
                ->where('id', $buyer->id)
                ->update(['code' => 'BUY' . str_pad($buyer->id, 4, '0', STR_PAD_LEFT)]);
        }

        // Rename existing columns if they exist
        if (Schema::hasColumn('buyers', 'contact_email')) {
            Schema::table('buyers', function (Blueprint $table) {
                $table->renameColumn('contact_email', 'email');
            });
        }

        if (Schema::hasColumn('buyers', 'contact_phone')) {
            Schema::table('buyers', function (Blueprint $table) {
                $table->renameColumn('contact_phone', 'phone');
            });
        }

        // Add indexes
        Schema::table('buyers', function (Blueprint $table) {
            $table->unique('code');
            $table->index('status');
            $table->index('name');
            $table->index('country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buyers', function (Blueprint $table) {
            // Remove indexes
            $table->dropUnique(['code']);
            $table->dropIndex(['status']);
            $table->dropIndex(['name']);
            $table->dropIndex(['country']);

            // Remove new columns
            $table->dropColumn(['code', 'contact_person', 'country', 'status']);
        });

        // Rename columns back
        if (Schema::hasColumn('buyers', 'email')) {
            Schema::table('buyers', function (Blueprint $table) {
                $table->renameColumn('email', 'contact_email');
            });
        }

        if (Schema::hasColumn('buyers', 'phone')) {
            Schema::table('buyers', function (Blueprint $table) {
                $table->renameColumn('phone', 'contact_phone');
            });
        }
    }
};
