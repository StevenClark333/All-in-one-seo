import { del } from "@vercel/blob";
import { getPrisma } from "@/lib/prisma";

const defaultRetentionDays = 90;

export async function cleanupExpiredHtmlSnapshots({
  now = new Date(),
  retentionDays = getSnapshotRetentionDays(),
}: {
  now?: Date;
  retentionDays?: number;
} = {}) {
  const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
  const snapshots = await getPrisma().pageSnapshot.findMany({
    where: {
      createdAt: { lt: cutoff },
      htmlObjectKey: { not: null },
    },
    select: { htmlObjectKey: true, id: true },
    take: 250,
  });

  let deleted = 0;

  for (const snapshot of snapshots) {
    if (!snapshot.htmlObjectKey) {
      continue;
    }

    await deleteRemoteSnapshot(snapshot.htmlObjectKey);
    await getPrisma().pageSnapshot.update({
      where: { id: snapshot.id },
      data: { htmlObjectKey: null },
    });
    deleted += 1;
  }

  return { cutoff, deleted };
}

export function getSnapshotRetentionDays(
  env: Record<string, string | undefined> = process.env,
) {
  const configured = Number(env.HTML_SNAPSHOT_RETENTION_DAYS);

  if (Number.isFinite(configured) && configured > 0) {
    return Math.floor(configured);
  }

  return defaultRetentionDays;
}

async function deleteRemoteSnapshot(objectKey: string) {
  if (objectKey.startsWith("local://")) {
    return;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await del(objectKey);
  }
}
