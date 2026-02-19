-- Add missing authentication fields to users table

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "email_verification_token" TEXT,
ADD COLUMN IF NOT EXISTS "email_verification_expires" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reset_password_token" TEXT,
ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP(3);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "users_email_verification_token_idx" ON "users"("email_verification_token");
CREATE INDEX IF NOT EXISTS "users_reset_password_token_idx" ON "users"("reset_password_token");
