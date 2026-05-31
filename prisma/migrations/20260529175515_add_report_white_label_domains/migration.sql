-- CreateEnum
CREATE TYPE "WhiteLabelDomainStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateTable
CREATE TABLE "report_white_label_domains" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "hostname" TEXT NOT NULL,
    "status" "WhiteLabelDomainStatus" NOT NULL DEFAULT 'PENDING',
    "verificationToken" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_white_label_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_white_label_domains_hostname_key" ON "report_white_label_domains"("hostname");

-- CreateIndex
CREATE UNIQUE INDEX "report_white_label_domains_verificationToken_key" ON "report_white_label_domains"("verificationToken");

-- CreateIndex
CREATE INDEX "report_white_label_domains_workspaceId_status_idx" ON "report_white_label_domains"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "report_white_label_domains_clientId_idx" ON "report_white_label_domains"("clientId");

-- AddForeignKey
ALTER TABLE "report_white_label_domains" ADD CONSTRAINT "report_white_label_domains_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_white_label_domains" ADD CONSTRAINT "report_white_label_domains_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
