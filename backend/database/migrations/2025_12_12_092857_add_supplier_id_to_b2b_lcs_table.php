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
        Schema::table('b2b_lcs', function (Blueprint $table) {
            $table->unsignedBigInteger('supplier_id')->nullable()->after('buyer_id');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('restrict')->onUpdate('cascade');
            $table->index('supplier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('b2b_lcs', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropIndex(['supplier_id']);
            $table->dropColumn('supplier_id');
        });
    }
};
