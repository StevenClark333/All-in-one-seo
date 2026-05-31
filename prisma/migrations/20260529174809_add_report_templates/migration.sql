-- AlterTable
ALTER TABLE "report_schedules" ADD COLUMN     "templateId" TEXT;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "report_templates" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sectionsJson" JSONB NOT NULL,
    "brandingJson" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_templates_workspaceId_isDefault_idx" ON "report_templates"("workspaceId", "isDefault");

-- CreateIndex
CREATE INDEX "report_templates_clientId_idx" ON "report_templates"("clientId");

-- CreateIndex
CREATE INDEX "report_schedules_templateId_idx" ON "report_schedules"("templateId");

-- CreateIndex
CREATE INDEX "reports_templateId_idx" ON "reports"("templateId");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
