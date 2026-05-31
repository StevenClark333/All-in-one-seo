import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${key}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");

  if (!salt || !key) {
    return false;
  }

  const candidate = scryptSync(password, salt, 64);
  const storedKey = Buffer.from(key, "hex");

  return (
    candidate.length === storedKey.length &&
    timingSafeEqual(candidate, storedKey)
  );
}
