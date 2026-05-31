CREATE TABLE "deployment_checks" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "domainId" TEXT,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "projectId" TEXT,
    "projectName" TEXT,
    "deploymentId" TEXT,
    "deploymentUrl" TEXT,
    "target" TEXT,
    "commitSha" TEXT,
    "payloadJson" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deployment_checks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "deployment_checks_workspaceId_provider_receivedAt_idx" ON "deployment_checks"("workspaceId", "provider", "receivedAt");
CREATE INDEX "deployment_checks_domainId_receivedAt_idx" ON "deployment_checks"("domainId", "receivedAt");
CREATE INDEX "deployment_checks_projectId_idx" ON "deployment_checks"("projectId");

ALTER TABLE "deployment_checks" ADD CONSTRAINT "deployment_checks_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deployment_checks" ADD CONSTRAINT "deployment_checks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
