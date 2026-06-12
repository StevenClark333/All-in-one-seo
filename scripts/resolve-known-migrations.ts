import { spawnSync } from "node:child_process";

const knownAppliedMigrations = [
  "20260602200000_add_link_fix_verification_status",
];

for (const migration of knownAppliedMigrations) {
  const result = spawnSync(
    "npx",
    ["prisma", "migrate", "resolve", "--applied", migration],
    {
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: "pipe",
    },
  );

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  if (result.status === 0) {
    process.stdout.write(output);
    continue;
  }

  if (output.includes("P3008")) {
    process.stdout.write(
      `Migration ${migration} is already marked as applied; continuing.\n`,
    );
    continue;
  }

  process.stderr.write(output);
  process.exit(result.status ?? 1);
}
