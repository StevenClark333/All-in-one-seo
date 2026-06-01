import { mkdir, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { del, put } from "@vercel/blob";
import { getPrisma } from "@/lib/prisma";

const localStorageRoot = ".storage";
const serverlessStorageRoot = path.join(os.tmpdir(), "all-in-one-seo");
const defaultRetentionDays = 90;

export async function storeHtmlSnapshot({
  crawlRunId,
  domainId,
  html,
  pageId,
}: {
  crawlRunId: string;
  domainId: string;
  html: string;
  pageId: string;
}) {
  const key = buildHtmlSnapshotKey({ crawlRunId, domainId, pageId });

  if (hasVercelBlobToken()) {
    const blob = await put(key, html, {
      access: "private",
      contentType: "text/html; charset=utf-8",
    });

    return blob.url;
  }

  const filePath = getLocalSnapshotPath(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html, "utf8");

  return `local://${key}`;
}

export async function readHtmlSnapshot(objectKey: string) {
  if (!objectKey.startsWith("local://")) {
    throw new Error(
      "Remote snapshot reads are handled by the storage provider.",
    );
  }

  const key = objectKey.replace("local://", "");
  return readFile(getLocalSnapshotPath(key), "utf8");
}

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

    await deleteHtmlSnapshot(snapshot.htmlObjectKey);
    await getPrisma().pageSnapshot.update({
      where: { id: snapshot.id },
      data: { htmlObjectKey: null },
    });
    deleted += 1;
  }

  return { cutoff, deleted };
}

export function buildHtmlSnapshotKey({
  crawlRunId,
  domainId,
  pageId,
}: {
  crawlRunId: string;
  domainId: string;
  pageId: string;
}) {
  return `html-snapshots/${domainId}/${pageId}/${crawlRunId}.html`;
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

export function getLocalSnapshotRoot(
  env: Record<string, string | undefined> = process.env,
) {
  if (env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME) {
    return serverlessStorageRoot;
  }

  return path.join(/* turbopackIgnore: true */ process.cwd(), localStorageRoot);
}

function hasVercelBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function deleteHtmlSnapshot(objectKey: string) {
  if (objectKey.startsWith("local://")) {
    const key = objectKey.replace("local://", "");
    await rm(getLocalSnapshotPath(key), {
      force: true,
    });
    return;
  }

  if (hasVercelBlobToken()) {
    await del(objectKey);
  }
}

function getLocalSnapshotPath(key: string) {
  return path.join(getLocalSnapshotRoot(), key);
}
