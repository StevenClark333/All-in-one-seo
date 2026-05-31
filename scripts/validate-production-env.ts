import "dotenv/config";
import { validateProductionEnv } from "@/lib/env";

try {
  const result = validateProductionEnv();
  console.log(
    `Production environment OK. Required: ${result.required.join(", ")}. Optional: ${result.optionalProduction.join(", ")}.`,
  );
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "Production environment validation failed.",
  );
  process.exit(1);
}
