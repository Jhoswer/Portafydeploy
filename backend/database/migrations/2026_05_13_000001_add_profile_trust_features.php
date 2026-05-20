<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('SUGGESTION', function (Blueprint $table) {
            if (! Schema::hasColumn('SUGGESTION', 'title')) {
                $table->string('title', 120)->nullable()->after('id_profile');
            }

            if (! Schema::hasColumn('SUGGESTION', 'area')) {
                $table->string('area', 50)->nullable()->after('type');
            }
        });

        if (! Schema::hasTable('PROFILE_VIEW')) {
            Schema::create('PROFILE_VIEW', function (Blueprint $table) {
                $table->bigIncrements('id_profile_view');
                $table->unsignedBigInteger('id_profile_owner');
                $table->unsignedBigInteger('id_viewer_profile');
                $table->timestamp('viewed_at')->useCurrent();
                $table->string('source', 50)->nullable();
                $table->timestamps();

                $table->foreign('id_profile_owner')->references('id_profile')->on('PROFILE')->cascadeOnDelete();
                $table->foreign('id_viewer_profile')->references('id_profile')->on('PROFILE')->cascadeOnDelete();
                $table->index(['id_profile_owner', 'viewed_at']);
                $table->index(['id_viewer_profile', 'viewed_at']);
            });
        }

        if (! Schema::hasTable('ANALYTIC_EVENT')) {
            Schema::create('ANALYTIC_EVENT', function (Blueprint $table) {
                $table->bigIncrements('id_analytic_event');
                $table->unsignedBigInteger('id_profile_owner');
                $table->unsignedBigInteger('id_actor_profile')->nullable();
                $table->string('event_type', 50);
                $table->string('target_type', 50)->nullable();
                $table->unsignedBigInteger('target_id')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamp('occurred_at')->useCurrent();
                $table->timestamps();

                $table->foreign('id_profile_owner')->references('id_profile')->on('PROFILE')->cascadeOnDelete();
                $table->foreign('id_actor_profile')->references('id_profile')->on('PROFILE')->nullOnDelete();
                $table->index(['id_profile_owner', 'event_type', 'occurred_at']);
                $table->index(['target_type', 'target_id']);
            });
        }

        if (! Schema::hasTable('PROFILE_VERIFICATION_REQUEST')) {
            Schema::create('PROFILE_VERIFICATION_REQUEST', function (Blueprint $table) {
                $table->bigIncrements('id_verification_request');
                $table->unsignedBigInteger('id_profile');
                $table->string('status', 20)->default('pending');
                $table->string('document_front_url', 255)->nullable();
                $table->string('document_back_url', 255)->nullable();
                $table->string('document_pdf_url', 255)->nullable();
                $table->string('rejection_reason', 500)->nullable();
                $table->timestamp('submitted_at')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->unsignedBigInteger('reviewed_by_profile')->nullable();
                $table->timestamps();

                $table->foreign('id_profile')->references('id_profile')->on('PROFILE')->cascadeOnDelete();
                $table->foreign('reviewed_by_profile')->references('id_profile')->on('PROFILE')->nullOnDelete();
                $table->index(['id_profile', 'status']);
                $table->index('submitted_at');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('PROFILE_VERIFICATION_REQUEST');
        Schema::dropIfExists('ANALYTIC_EVENT');
        Schema::dropIfExists('PROFILE_VIEW');

        Schema::table('SUGGESTION', function (Blueprint $table) {
            if (Schema::hasColumn('SUGGESTION', 'area')) {
                $table->dropColumn('area');
            }

            if (Schema::hasColumn('SUGGESTION', 'title')) {
                $table->dropColumn('title');
            }
        });
    }
};
