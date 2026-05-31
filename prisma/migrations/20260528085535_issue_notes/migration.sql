-- CreateEnum
CREATE TYPE "IssueNoteVisibility" AS ENUM ('INTERNAL', 'CLIENT_VISIBLE');

-- CreateTable
CREATE TABLE "seo_issue_notes" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "authorId" TEXT,
    "visibility" "IssueNoteVisibility" NOT NULL DEFAULT 'INTERNAL',
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_issue_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seo_issue_notes_issueId_createdAt_idx" ON "seo_issue_notes"("issueId", "createdAt");

-- CreateIndex
CREATE INDEX "seo_issue_notes_authorId_idx" ON "seo_issue_notes"("authorId");

-- AddForeignKey
ALTER TABLE "seo_issue_notes" ADD CONSTRAINT "seo_issue_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_issue_notes" ADD CONSTRAINT "seo_issue_notes_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "seo_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
