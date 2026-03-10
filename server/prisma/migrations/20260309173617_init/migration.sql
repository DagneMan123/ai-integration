-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "anti_cheat_data" JSONB,
ADD COLUMN     "application_id" INTEGER,
ADD COLUMN     "behavioral_metrics" JSONB,
ADD COLUMN     "confidence_metrics" JSONB,
ADD COLUMN     "confidence_score" INTEGER,
ADD COLUMN     "fluency_score" INTEGER,
ADD COLUMN     "identity_verification" JSONB,
ADD COLUMN     "integrity_risk" TEXT,
ADD COLUMN     "integrity_score" INTEGER,
ADD COLUMN     "interview_mode" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN     "plagiarism_flags" JSONB,
ADD COLUMN     "professionalism_score" INTEGER,
ADD COLUMN     "soft_skills_score" INTEGER,
ADD COLUMN     "strictness_level" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_expires" TIMESTAMP(3),
ADD COLUMN     "email_verification_token" TEXT,
ADD COLUMN     "is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reset_password_expires" TIMESTAMP(3),
ADD COLUMN     "reset_password_token" TEXT;
