CREATE TYPE "WorkerJobType" AS ENUM ('CRAWL_RUN', 'DOMAIN_VERIFICATION', 'SCHEDULED_REPORT', 'AI_RECOMMENDATION');
CREATE TYPE "WorkerJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'DEAD_LETTER');

CREATE TABLE "worker_jobs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "WorkerJobType" NOT NULL,
    "status" "WorkerJobStatus" NOT NULL DEFAULT 'QUEUED',
    "resourceId" TEXT,
    "payloadJson" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "worker_jobs_status_availableAt_idx" ON "worker_jobs"("status", "availableAt");
CREATE INDEX "worker_jobs_workspaceId_type_status_idx" ON "worker_jobs"("workspaceId", "type", "status");
CREATE INDEX "worker_jobs_lockedAt_idx" ON "worker_jobs"("lockedAt");

ALTER TABLE "worker_jobs" ADD CONSTRAINT "worker_jobs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
