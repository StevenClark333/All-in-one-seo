import { randomBytes } from "node:crypto";

const formats = new Set(["base64", "hex"]);
const usages = new Set(["cron", "encryption"]);

const usage = process.argv[2] ?? "encryption";
const format = process.argv[3] ?? (usage === "cron" ? "base64" : "hex");

if (!usages.has(usage) || !formats.has(format)) {
  console.error(
    "Usage: npm run secret:generate -- [encryption|cron] [hex|base64]",
  );
  process.exit(1);
}

const byteLength = usage === "cron" ? 32 : 32;
const secret =
  format === "hex"
    ? randomBytes(byteLength).toString("hex")
    : randomBytes(byteLength).toString("base64url");

console.log(secret);
