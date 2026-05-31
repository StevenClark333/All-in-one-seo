import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import { Prisma } from "@prisma/client";

const encryptedMarker = "__encrypted";
const encryptedVersion = "v1";
const sensitiveKeys = new Set([
  "access_token",
  "refresh_token",
  "token",
  "webhookSecret",
  "webhookUrl",
]);

type JsonObject = Record<string, Prisma.JsonValue>;

export function encryptIntegrationConfig<T extends Prisma.InputJsonValue>(
  value: T,
): T {
  return transformConfig(value, encryptSensitiveValue) as T;
}

export function decryptIntegrationConfig<T extends Prisma.JsonValue>(
  value: T,
): T {
  return transformConfig(value, decryptSensitiveValue) as T;
}

export function isEncryptedSecret(value: unknown) {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>)[encryptedMarker] === encryptedVersion
  );
}

function transformConfig(
  value: Prisma.InputJsonValue | Prisma.JsonValue,
  transformSecret: (value: Prisma.JsonValue) => Prisma.JsonValue,
  key?: string,
): Prisma.JsonValue {
  if (key && sensitiveKeys.has(key)) {
    return transformSecret(value as Prisma.JsonValue);
  }

  if (Array.isArray(value)) {
    return value.map((item) => transformConfig(item, transformSecret));
  }

  if (value && typeof value === "object") {
    if (isEncryptedSecret(value)) {
      return transformSecret(value as Prisma.JsonValue);
    }

    return Object.fromEntries(
      Object.entries(value as JsonObject).map(([entryKey, entryValue]) => [
        entryKey,
        transformConfig(entryValue, transformSecret, entryKey),
      ]),
    );
  }

  return value as Prisma.JsonValue;
}

function encryptSensitiveValue(value: Prisma.JsonValue): Prisma.JsonValue {
  if (isEncryptedSecret(value)) {
    return value;
  }

  if (value === null || value === undefined || value === "") {
    return value ?? null;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const plaintext = JSON.stringify(value);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    [encryptedMarker]: encryptedVersion,
    iv: iv.toString("base64url"),
    tag: tag.toString("base64url"),
    value: encrypted.toString("base64url"),
  };
}

function decryptSensitiveValue(value: Prisma.JsonValue): Prisma.JsonValue {
  if (!isEncryptedSecret(value)) {
    return value;
  }

  const payload = value as Record<string, Prisma.JsonValue>;
  const iv = readBase64Url(payload.iv);
  const tag = readBase64Url(payload.tag);
  const encrypted = readBase64Url(payload.value);
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);

  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");

  return JSON.parse(decrypted) as Prisma.JsonValue;
}

function readBase64Url(value: Prisma.JsonValue) {
  if (typeof value !== "string") {
    throw new Error("Encrypted integration secret is malformed.");
  }

  return Buffer.from(value, "base64url");
}

function getEncryptionKey() {
  const configured = process.env.INTEGRATION_ENCRYPTION_KEY;

  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("INTEGRATION_ENCRYPTION_KEY is required in production.");
  }

  const source = configured ?? process.env.DATABASE_URL ?? "local-development";

  if (/^[a-f0-9]{64}$/i.test(source)) {
    return Buffer.from(source, "hex");
  }

  try {
    const decoded = Buffer.from(source, "base64");

    if (decoded.length === 32) {
      return decoded;
    }
  } catch {
    // Fall through to hash-based key derivation for local/dev strings.
  }

  return createHash("sha256").update(source).digest();
}
