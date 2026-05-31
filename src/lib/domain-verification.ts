import * as cheerio from "cheerio";
import { randomBytes } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { VerificationMethod, VerificationStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export const VERIFICATION_RECORD_NAME = "@";
export const VERIFICATION_PREFIX = "allinone-seo-verification";
export const HTML_VERIFICATION_PATH =
  "/.well-known/allinone-seo-verification.txt";
export const META_VERIFICATION_NAME = "allinone-seo-verification";

type VerificationResult = {
  message: string;
  status: VerificationStatus;
};

export function createVerificationToken() {
  return randomBytes(18).toString("base64url");
}

export function formatVerificationValue(token: string) {
  return `${VERIFICATION_PREFIX}=${token}`;
}

export function formatHtmlVerificationUrl(domain: string) {
  return `https://${domain}${HTML_VERIFICATION_PATH}`;
}

export function calculateNextVerificationRetry(attemptCount: number) {
  const retryMinutes = Math.min(60, 2 ** Math.max(0, attemptCount - 1));
  return new Date(Date.now() + retryMinutes * 60_000);
}

export async function createDomainVerification(
  domainId: string,
  method: VerificationMethod = "DNS_TXT",
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  return getPrisma().domainVerification.create({
    data: {
      domainId,
      token: createVerificationToken(),
      method,
      status: "PENDING",
      expiresAt,
    },
  });
}

export async function verifyDomainOwnership({
  domainId,
  method,
}: {
  domainId: string;
  method: VerificationMethod;
}) {
  const prisma = getPrisma();
  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
    include: {
      integrations: {
        where: { provider: "GOOGLE_SEARCH_CONSOLE_PROPERTY" },
      },
      verifications: {
        where: { method },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!domain) {
    throw new Error("Domain not found.");
  }

  const verification =
    domain.verifications.at(0) ??
    (await createDomainVerification(domain.id, method));

  if (
    verification.nextRetryAt &&
    verification.nextRetryAt.getTime() > Date.now()
  ) {
    throw new Error("Verification was checked recently. Try again shortly.");
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    return recordVerificationResult({
      domainId: domain.id,
      method,
      result: {
        message: "Verification token expired. Generate a new token.",
        status: "EXPIRED",
      },
      verificationId: verification.id,
    });
  }

  const result = await runVerificationCheck({
    domain,
    method,
    token: verification.token,
  });

  return recordVerificationResult({
    domainId: domain.id,
    method,
    result,
    verificationId: verification.id,
  });
}

export async function verifyDomainTxtRecord(domainId: string) {
  return verifyDomainOwnership({ domainId, method: "DNS_TXT" });
}

async function runVerificationCheck({
  domain,
  method,
  token,
}: {
  domain: {
    domain: string;
    integrations: Array<{ status: string }>;
  };
  method: VerificationMethod;
  token: string;
}): Promise<VerificationResult> {
  if (method === "DNS_TXT") {
    const expectedValue = formatVerificationValue(token);
    const records = await resolveTxt(domain.domain).catch(() => []);
    const flattenedRecords = records.map((record) => record.join(""));

    return flattenedRecords.includes(expectedValue)
      ? { message: "DNS TXT record matched.", status: "VERIFIED" }
      : { message: "DNS TXT record was not found yet.", status: "FAILED" };
  }

  if (method === "HTML_FILE") {
    const expectedValue = formatVerificationValue(token);
    const response = await fetch(
      formatHtmlVerificationUrl(domain.domain),
    ).catch(() => null);
    const body = response?.ok ? await response.text() : "";

    return body.includes(expectedValue)
      ? { message: "HTML verification file matched.", status: "VERIFIED" }
      : { message: "HTML verification file was not found.", status: "FAILED" };
  }

  if (method === "META_TAG") {
    const response = await fetch(`https://${domain.domain}`).catch(() => null);
    const html = response?.ok ? await response.text() : "";
    const $ = cheerio.load(html);
    const content = $(`meta[name="${META_VERIFICATION_NAME}"]`).attr("content");

    return content === token || content === formatVerificationValue(token)
      ? { message: "Meta verification tag matched.", status: "VERIFIED" }
      : { message: "Meta verification tag was not found.", status: "FAILED" };
  }

  const hasMappedSearchConsoleProperty = domain.integrations.some(
    (integration) =>
      integration.status === "MAPPED" || integration.status === "IMPORTED",
  );

  return hasMappedSearchConsoleProperty
    ? {
        message: "Google Search Console property is mapped.",
        status: "VERIFIED",
      }
    : {
        message: "Map this domain to a Google Search Console property first.",
        status: "FAILED",
      };
}

async function recordVerificationResult({
  domainId,
  method,
  result,
  verificationId,
}: {
  domainId: string;
  method: VerificationMethod;
  result: VerificationResult;
  verificationId: string;
}) {
  const prisma = getPrisma();
  const nextAttempt = await prisma.domainVerification.findUniqueOrThrow({
    where: { id: verificationId },
    select: { attemptCount: true },
  });
  const attemptCount = nextAttempt.attemptCount + 1;
  const verifiedAt = result.status === "VERIFIED" ? new Date() : null;

  await prisma.domainVerification.update({
    where: { id: verificationId },
    data: {
      attemptCount,
      failureReason: result.status === "VERIFIED" ? null : result.message,
      lastCheckedAt: new Date(),
      nextRetryAt:
        result.status === "FAILED"
          ? calculateNextVerificationRetry(attemptCount)
          : null,
      status: result.status,
      verifiedAt,
    },
  });

  await prisma.domainVerificationCheck.create({
    data: {
      domainId,
      method,
      message: result.message,
      status: result.status,
      verificationId,
    },
  });

  await prisma.domain.update({
    where: { id: domainId },
    data: { verificationStatus: result.status },
  });

  return result.status === "VERIFIED";
}
