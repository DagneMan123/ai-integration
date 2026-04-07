-- Create DashboardMessage table
CREATE TABLE IF NOT EXISTS "DashboardMessage" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "fromDashboard" TEXT NOT NULL,
  "toDashboard" TEXT,
  "eventType" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create ApplicationActivity table
CREATE TABLE IF NOT EXISTS "ApplicationActivity" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "applicationId" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationActivity_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create InterviewActivity table
CREATE TABLE IF NOT EXISTS "InterviewActivity" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "interviewId" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterviewActivity_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create DashboardNotification table
CREATE TABLE IF NOT EXISTS "DashboardNotification" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "dashboard" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "data" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create SystemUpdate table
CREATE TABLE IF NOT EXISTS "SystemUpdate" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "adminId" INTEGER NOT NULL,
  "updateType" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SystemUpdate_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "DashboardMessage_fromDashboard_idx" ON "DashboardMessage"("fromDashboard");
CREATE INDEX IF NOT EXISTS "DashboardMessage_toDashboard_idx" ON "DashboardMessage"("toDashboard");
CREATE INDEX IF NOT EXISTS "DashboardMessage_timestamp_idx" ON "DashboardMessage"("timestamp");
CREATE INDEX IF NOT EXISTS "ApplicationActivity_applicationId_idx" ON "ApplicationActivity"("applicationId");
CREATE INDEX IF NOT EXISTS "InterviewActivity_interviewId_idx" ON "InterviewActivity"("interviewId");
CREATE INDEX IF NOT EXISTS "DashboardNotification_dashboard_idx" ON "DashboardNotification"("dashboard");
CREATE INDEX IF NOT EXISTS "DashboardNotification_read_idx" ON "DashboardNotification"("read");
CREATE INDEX IF NOT EXISTS "SystemUpdate_adminId_idx" ON "SystemUpdate"("adminId");
