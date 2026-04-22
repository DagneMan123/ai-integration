-- CreateTable interview_responses
CREATE TABLE IF NOT EXISTS "interview_responses" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "session_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "video_path" TEXT NOT NULL,
    "video_url" TEXT,
    "video_size" INTEGER,
    "recording_time" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interview_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "interview_responses_user_id_idx" ON "interview_responses"("user_id");

-- CreateIndex
CREATE INDEX "interview_responses_session_id_idx" ON "interview_responses"("session_id");

-- CreateIndex
CREATE INDEX "interview_responses_status_idx" ON "interview_responses"("status");

-- CreateIndex
CREATE INDEX "interview_responses_created_at_idx" ON "interview_responses"("created_at");

-- CreateTable interview_analyses
CREATE TABLE IF NOT EXISTS "interview_analyses" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "response_id" INTEGER NOT NULL UNIQUE,
    "transcript" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "strengths" TEXT[],
    "improvements" TEXT[],
    "observations" TEXT[],
    "filler_words" JSONB NOT NULL,
    "speech_patterns" JSONB NOT NULL,
    "feedback" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interview_analyses_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "interview_responses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "interview_analyses_response_id_idx" ON "interview_analyses"("response_id");

-- CreateIndex
CREATE INDEX "interview_analyses_created_at_idx" ON "interview_analyses"("created_at");

-- CreateTable interview_questions
CREATE TABLE IF NOT EXISTS "interview_questions" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "session_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "interview_questions_session_id_idx" ON "interview_questions"("session_id");
