ALTER TYPE "WorkerJobType" ADD VALUE 'KEYWORD_IMPORT';

CREATE TABLE "saved_analytics_views" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "filtersJson" JSONB NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "lastUsedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "saved_analytics_views_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saved_analytics_views_workspaceId_route_name_key"
  ON "saved_analytics_views"("workspaceId", "route", "name");

CREATE INDEX "saved_analytics_views_workspaceId_route_updatedAt_idx"
  ON "saved_analytics_views"("workspaceId", "route", "updatedAt");

CREATE INDEX "saved_analytics_views_userId_idx"
  ON "saved_analytics_views"("userId");

ALTER TABLE "saved_analytics_views"
  ADD CONSTRAINT "saved_analytics_views_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saved_analytics_views"
  ADD CONSTRAINT "saved_analytics_views_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
