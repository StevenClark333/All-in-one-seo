-- AlterTable
ALTER TABLE "domain_verifications" ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "failureReason" TEXT,
ADD COLUMN "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN "nextRetryAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "domain_verification_checks" (
    "id" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "method" "VerificationMethod" NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_verification_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "domain_verification_checks_domainId_createdAt_idx" ON "domain_verification_checks"("domainId", "createdAt");

-- CreateIndex
CREATE INDEX "domain_verification_checks_verificationId_createdAt_idx" ON "domain_verification_checks"("verificationId", "createdAt");

-- AddForeignKey
ALTER TABLE "domain_verification_checks" ADD CONSTRAINT "domain_verification_checks_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_verification_checks" ADD CONSTRAINT "domain_verification_checks_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "domain_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
