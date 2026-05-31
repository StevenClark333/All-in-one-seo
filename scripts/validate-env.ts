import "dotenv/config";
import { validateEnv } from "@/lib/env";

try {
  const result = validateEnv();
  console.log(
    `Environment OK. Required: ${result.required.join(", ")}. Optional production: ${result.optionalProduction.join(", ")}.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Environment validation failed.",
  );
  process.exit(1);
}
