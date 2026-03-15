-- Add indexes for dashboard performance optimization

-- Job indexes
CREATE INDEX IF NOT EXISTS "jobs_created_by_id_idx" ON "jobs"("created_by_id");
CREATE INDEX IF NOT EXISTS "jobs_company_id_idx" ON "jobs"("company_id");

-- Application indexes
CREATE INDEX IF NOT EXISTS "applications_candidate_id_idx" ON "applications"("candidate_id");
CREATE INDEX IF NOT EXISTS "applications_job_id_idx" ON "applications"("job_id");
CREATE INDEX IF NOT EXISTS "applications_applied_at_idx" ON "applications"("applied_at");

-- Interview indexes
CREATE INDEX IF NOT EXISTS "interviews_candidate_id_idx" ON "interviews"("candidate_id");
CREATE INDEX IF NOT EXISTS "interviews_job_id_idx" ON "interviews"("job_id");
CREATE INDEX IF NOT EXISTS "interviews_status_idx" ON "interviews"("status");
CREATE INDEX IF NOT EXISTS "interviews_created_at_idx" ON "interviews"("created_at");

-- Payment indexes
CREATE INDEX IF NOT EXISTS "payments_user_id_idx" ON "payments"("user_id");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "payments_created_at_idx" ON "payments"("created_at");

-- ActivityLog indexes
CREATE INDEX IF NOT EXISTS "activity_logs_user_id_idx" ON "activity_logs"("user_id");
CREATE INDEX IF NOT EXISTS "activity_logs_created_at_idx" ON "activity_logs"("created_at");
