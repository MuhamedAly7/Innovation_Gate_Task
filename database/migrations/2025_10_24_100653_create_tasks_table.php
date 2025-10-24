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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->boolean('is_completed')->default(false);
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assignee_id')->constrained('users')->onDelete('cascade');
            $table->index('due_date');
            $table->index('assignee_id');
            $table->index('creator_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
