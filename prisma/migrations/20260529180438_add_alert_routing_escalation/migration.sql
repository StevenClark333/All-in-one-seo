-- AlterEnum
ALTER TYPE "AlertChannel" ADD VALUE 'TEAMS';

-- AlterTable
ALTER TABLE "alert_rules" ADD COLUMN     "escalationChannel" "AlertChannel",
ADD COLUMN     "escalationTargetEmail" TEXT,
ADD COLUMN     "escalationTargetUrl" TEXT,
ADD COLUMN     "targetEmail" TEXT;

-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "escalatedAt" TIMESTAMP(3);
