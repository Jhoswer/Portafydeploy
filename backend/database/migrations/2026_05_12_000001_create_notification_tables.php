<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
DO $$
BEGIN
    IF to_regclass('"NOTIFICATION"') IS NULL AND to_regclass('notification') IS NOT NULL THEN
        ALTER TABLE notification RENAME TO "NOTIFICATION";
    END IF;

    IF to_regclass('"NOTIFICATION_SETTINGS"') IS NULL AND to_regclass('notification_settings') IS NOT NULL THEN
        ALTER TABLE notification_settings RENAME TO "NOTIFICATION_SETTINGS";
    END IF;
END $$;
SQL);

        DB::statement(<<<'SQL'
CREATE TABLE IF NOT EXISTS "NOTIFICATION" (
    id_notification BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_receiver BIGINT NOT NULL,
    id_sender BIGINT,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    device VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_receiver
        FOREIGN KEY (id_receiver)
        REFERENCES "USER"(id_user),
    CONSTRAINT fk_notification_sender
        FOREIGN KEY (id_sender)
        REFERENCES "USER"(id_user)
)
SQL);

        DB::statement(<<<'SQL'
CREATE TABLE IF NOT EXISTS "NOTIFICATION_SETTINGS" (
    id_notification_settings BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_user BIGINT UNIQUE NOT NULL,
    activity_notifications BOOLEAN DEFAULT TRUE,
    portfolio_notifications BOOLEAN DEFAULT TRUE,
    offer_notifications BOOLEAN DEFAULT TRUE,
    support_notifications BOOLEAN DEFAULT TRUE,
    platform_notifications BOOLEAN DEFAULT TRUE,
    security_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_settings_user
        FOREIGN KEY (id_user)
        REFERENCES "USER"(id_user)
)
SQL);

        DB::statement('CREATE INDEX IF NOT EXISTS idx_notification_receiver ON "NOTIFICATION" (id_receiver)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_notification_read ON "NOTIFICATION" (is_read)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_notification_created ON "NOTIFICATION" (created_at DESC)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_notification_created');
        DB::statement('DROP INDEX IF EXISTS idx_notification_read');
        DB::statement('DROP INDEX IF EXISTS idx_notification_receiver');
        DB::statement('DROP TABLE IF EXISTS "NOTIFICATION_SETTINGS"');
        DB::statement('DROP TABLE IF EXISTS "NOTIFICATION"');
    }
};
