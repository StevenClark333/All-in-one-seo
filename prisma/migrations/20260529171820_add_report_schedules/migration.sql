-- CreateEnum
CREATE TYPE "ReportScheduleFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "report_schedules" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "domainId" TEXT,
    "title" TEXT NOT NULL,
    "frequency" "ReportScheduleFrequency" NOT NULL DEFAULT 'WEEKLY',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_schedules_workspaceId_enabled_nextRunAt_idx" ON "report_schedules"("workspaceId", "enabled", "nextRunAt");

-- CreateIndex
CREATE INDEX "report_schedules_clientId_idx" ON "report_schedules"("clientId");

-- CreateIndex
CREATE INDEX "report_schedules_domainId_idx" ON "report_schedules"("domainId");

-- AddForeignKey
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
