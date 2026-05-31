CREATE TYPE "AuthTokenPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

ALTER TABLE "users" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "failedLoginCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "lockedUntil" TIMESTAMP(3);

CREATE TABLE "auth_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" "AuthTokenPurpose" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_tokens_tokenHash_key" ON "auth_tokens"("tokenHash");
CREATE INDEX "auth_tokens_userId_purpose_usedAt_idx" ON "auth_tokens"("userId", "purpose", "usedAt");
CREATE INDEX "auth_tokens_expiresAt_idx" ON "auth_tokens"("expiresAt");

ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
