-- CreateTable InterviewResponse
CREATE TABLE "interview_responses" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "video_path" TEXT NOT NULL,
    "video_url" TEXT,
    "video_size" INTEGER,
    "recording_time" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable InterviewAnalysis
CREATE TABLE "interview_analyses" (
    "id" SERIAL NOT NULL,
    "response_id" INTEGER NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable InterviewQuestion
CREATE TABLE "interview_questions" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_responses_user_id_idx" ON "interview_responses"("user_id");

-- CreateIndex
CREATE INDEX "interview_responses_session_id_idx" ON "interview_responses"("session_id");

-- CreateIndex
CREATE INDEX "interview_responses_status_idx" ON "interview_responses"("status");

-- CreateIndex
CREATE INDEX "interview_responses_created_at_idx" ON "interview_responses"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "interview_analyses_response_id_key" ON "interview_analyses"("response_id");

-- CreateIndex
CREATE INDEX "interview_analyses_response_id_idx" ON "interview_analyses"("response_id");

-- CreateIndex
CREATE INDEX "interview_analyses_created_at_idx" ON "interview_analyses"("created_at");

-- CreateIndex
CREATE INDEX "interview_questions_session_id_idx" ON "interview_questions"("session_id");

-- AddForeignKey
ALTER TABLE "interview_responses" ADD CONSTRAINT "interview_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_analyses" ADD CONSTRAINT "interview_analyses_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "interview_responses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
