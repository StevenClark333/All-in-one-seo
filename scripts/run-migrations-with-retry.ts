import { spawnSync } from "node:child_process";

const maxAttempts = Number.parseInt(
  process.env.PRISMA_MIGRATE_DEPLOY_ATTEMPTS ?? "4",
  10,
);
const retryDelayMs = Number.parseInt(
  process.env.PRISMA_MIGRATE_DEPLOY_RETRY_DELAY_MS ?? "5000",
  10,
);

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: "pipe",
  });

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  return {
    code: result.status ?? 1,
    output,
  };
}

function isRetryableMigrationLock(output: string) {
  return (
    output.includes("P1002") &&
    output.toLowerCase().includes("advisory lock")
  );
}

function sleep(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  process.stdout.write(
    `Running Prisma migrations (attempt ${attempt}/${maxAttempts})...\n`,
  );

  const resolveResult = run("npx", [
    "tsx",
    "scripts/resolve-known-migrations.ts",
  ]);

  process.stdout.write(resolveResult.output);

  if (resolveResult.code !== 0) {
    if (
      attempt < maxAttempts &&
      isRetryableMigrationLock(resolveResult.output)
    ) {
      process.stdout.write(
        `Prisma migration lock timed out while resolving known migrations; retrying in ${retryDelayMs}ms.\n`,
      );
      sleep(retryDelayMs);
      continue;
    }

    process.exit(resolveResult.code);
  }

  const deployResult = run("npx", ["prisma", "migrate", "deploy"]);

  process.stdout.write(deployResult.output);

  if (deployResult.code === 0) {
    process.exit(0);
  }

  if (attempt < maxAttempts && isRetryableMigrationLock(deployResult.output)) {
    process.stdout.write(
      `Prisma migration lock timed out during deploy; retrying in ${retryDelayMs}ms.\n`,
    );
    sleep(retryDelayMs);
    continue;
  }

  process.exit(deployResult.code);
}

process.exit(1);
