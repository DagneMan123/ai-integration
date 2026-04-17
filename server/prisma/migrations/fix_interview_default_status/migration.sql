-- Fix interview status default from PENDING to IN_PROGRESS
-- This ensures new interviews start with IN_PROGRESS status by default

-- Update any existing PENDING interviews that should be IN_PROGRESS
UPDATE "interviews" 
SET "status" = 'IN_PROGRESS' 
WHERE "status" = 'PENDING' AND "started_at" IS NOT NULL AND "completed_at" IS NULL;

-- The schema.prisma file has been updated to set @default(IN_PROGRESS)
-- This migration ensures the database reflects that change
