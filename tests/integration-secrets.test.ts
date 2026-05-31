import assert from "node:assert/strict";
import test from "node:test";
import {
  decryptIntegrationConfig,
  encryptIntegrationConfig,
  isEncryptedSecret,
} from "@/lib/integration-secrets";

test("encrypts sensitive integration config fields and preserves query keys", () => {
  const encrypted = encryptIntegrationConfig({
    projectId: "project_123",
    token: {
      access_token: "access-secret",
      refresh_token: "refresh-secret",
    },
    webhookSecret: "webhook-secret",
  });

  assert.equal(encrypted.projectId, "project_123");
  assert.equal(isEncryptedSecret(encrypted.token), true);
  assert.equal(isEncryptedSecret(encrypted.webhookSecret), true);

  const decrypted = decryptIntegrationConfig(encrypted);

  assert.deepEqual(decrypted, {
    projectId: "project_123",
    token: {
      access_token: "access-secret",
      refresh_token: "refresh-secret",
    },
    webhookSecret: "webhook-secret",
  });
});

test("leaves legacy plaintext integration configs readable", () => {
  assert.deepEqual(
    decryptIntegrationConfig({
      token: {
        access_token: "legacy-access",
        refresh_token: "legacy-refresh",
      },
    }),
    {
      token: {
        access_token: "legacy-access",
        refresh_token: "legacy-refresh",
      },
    },
  );
});
