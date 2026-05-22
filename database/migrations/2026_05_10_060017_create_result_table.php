<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('result', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('nutrition_id')->constrained('nutrition')->onDelete('cascade');
            $table->string('scan_image');
            $table->text('analisis_ai');
            $table->float('confidence')->nullable();
            $table->decimal('serving_qty', 5, 2)->default(1);
            $table->decimal('total_calories', 8, 2)->nullable();  
            $table->enum('meal_type', ['breakfast','lunch','dinner','snack'])->nullable(); // waktu makan
            $table->date('consumed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('result');
    }
};
