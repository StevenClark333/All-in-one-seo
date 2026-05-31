import { Prisma, WorkerJobStatus, WorkerJobType } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export const workerConcurrencyLimits: Record<WorkerJobType, number> = {
  AI_RECOMMENDATION: 2,
  CRAWL_RUN: 3,
  DOMAIN_VERIFICATION: 10,
  SCHEDULED_REPORT: 4,
};

export const defaultWorkerMaxAttempts = 5;

export async function enqueueWorkerJob({
  availableAt = new Date(),
  maxAttempts = defaultWorkerMaxAttempts,
  payloadJson,
  resourceId,
  type,
  workspaceId,
}: {
  availableAt?: Date;
  maxAttempts?: number;
  payloadJson?: Prisma.InputJsonValue;
  resourceId?: string;
  type: WorkerJobType;
  workspaceId: string;
}) {
  return getPrisma().workerJob.create({
    data: {
      availableAt,
      maxAttempts,
      payloadJson,
      resourceId,
      type,
      workspaceId,
    },
  });
}

export async function claimNextWorkerJob({
  now = new Date(),
  type,
  workerId,
}: {
  now?: Date;
  type: WorkerJobType;
  workerId: string;
}) {
  if (!(await canClaimWorkerJob(type))) {
    return null;
  }

  const job = await getPrisma().workerJob.findFirst({
    where: {
      availableAt: { lte: now },
      status: { in: ["QUEUED", "FAILED"] },
      type,
    },
    orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
  });

  if (!job) {
    return null;
  }

  return getPrisma().workerJob.update({
    where: { id: job.id },
    data: {
      attempts: { increment: 1 },
      lockedAt: now,
      lockedBy: workerId,
      status: "RUNNING",
    },
  });
}

export async function completeWorkerJob(jobId: string) {
  return getPrisma().workerJob.update({
    where: { id: jobId },
    data: {
      completedAt: new Date(),
      lockedAt: null,
      lockedBy: null,
      status: "COMPLETED",
    },
  });
}

export async function failWorkerJob({
  error,
  jobId,
  now = new Date(),
}: {
  error: Error | string;
  jobId: string;
  now?: Date;
}) {
  const job = await getPrisma().workerJob.findUnique({ where: { id: jobId } });

  if (!job) {
    throw new Error("Worker job not found.");
  }

  const status = getFailureStatus({
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
  });

  return getPrisma().workerJob.update({
    where: { id: job.id },
    data: {
      availableAt:
        status === "DEAD_LETTER"
          ? job.availableAt
          : calculateNextAttemptAt(job.attempts, now),
      failedAt: status === "DEAD_LETTER" ? now : null,
      lastError: normalizeWorkerError(error),
      lockedAt: null,
      lockedBy: null,
      status,
    },
  });
}

export function calculateNextAttemptAt(attempts: number, now = new Date()) {
  const delaySeconds = Math.min(300, 2 ** Math.max(0, attempts - 1) * 30);
  return new Date(now.getTime() + delaySeconds * 1000);
}

export function getFailureStatus({
  attempts,
  maxAttempts,
}: {
  attempts: number;
  maxAttempts: number;
}): WorkerJobStatus {
  return attempts >= maxAttempts ? "DEAD_LETTER" : "FAILED";
}

async function canClaimWorkerJob(type: WorkerJobType) {
  const running = await getPrisma().workerJob.count({
    where: { status: "RUNNING", type },
  });

  return running < workerConcurrencyLimits[type];
}

function normalizeWorkerError(error: Error | string) {
  return (error instanceof Error ? error.message : error).slice(0, 1000);
}
