import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "@prisma/client";
import { isMissingSavedViewsTableError } from "@/lib/saved-analytics-views";

test("detects missing saved analytics views table errors", () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    "The table does not exist.",
    {
      clientVersion: "test",
      code: "P2021",
      meta: { table: "public.saved_analytics_views" },
    },
  );

  assert.equal(isMissingSavedViewsTableError(error), true);
});

test("does not hide unrelated Prisma table errors", () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    "Another table does not exist.",
    {
      clientVersion: "test",
      code: "P2021",
      meta: { table: "public.domains" },
    },
  );

  assert.equal(isMissingSavedViewsTableError(error), false);
});
