<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('UNIVERSITY_CAREER', function (Blueprint $table) {
            if (! Schema::hasColumn('UNIVERSITY_CAREER', 'support_document_url')) {
                $table->string('support_document_url', 255)->nullable();
            }

            if (! Schema::hasColumn('UNIVERSITY_CAREER', 'support_status')) {
                $table->string('support_status', 20)->default('none');
            }

            if (! Schema::hasColumn('UNIVERSITY_CAREER', 'support_reviewed_at')) {
                $table->timestamp('support_reviewed_at')->nullable();
            }

            if (! Schema::hasColumn('UNIVERSITY_CAREER', 'support_rejection_reason')) {
                $table->string('support_rejection_reason', 500)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('UNIVERSITY_CAREER', function (Blueprint $table) {
            foreach ([
                'support_rejection_reason',
                'support_reviewed_at',
                'support_status',
                'support_document_url',
            ] as $column) {
                if (Schema::hasColumn('UNIVERSITY_CAREER', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
