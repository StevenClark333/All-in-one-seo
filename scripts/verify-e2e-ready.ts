import "dotenv/config";
import { getPrisma } from "@/lib/prisma";

const defaultEmail = "keccc@gmail.com";

async function main() {
  const email = process.env.E2E_TEST_EMAIL ?? defaultEmail;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for authenticated E2E checks.");
  }

  await getPrisma().$queryRaw`SELECT 1`;

  const user = await getPrisma().user.findUnique({
    where: { email },
    select: {
      email: true,
      id: true,
      workspaceMembers: { select: { workspaceId: true }, take: 1 },
    },
  });

  if (!user) {
    throw new Error(
      `E2E user ${email} was not found. Run npm run db:seed or set E2E_TEST_EMAIL.`,
    );
  }

  if (!user.workspaceMembers.length) {
    throw new Error(`E2E user ${email} is not attached to a workspace.`);
  }

  console.log(
    `Authenticated E2E ready for ${user.email} in workspace ${user.workspaceMembers[0].workspaceId}.`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "E2E readiness failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
