import { VerificationMethod } from "@prisma/client";
import { NextRequest } from "next/server";
import { createDomainVerification } from "@/lib/domain-verification";
import { getAuthorizedDomain } from "@/lib/domain-route-auth";
import { getFormString, redirectToPath } from "@/lib/route-helpers";

const verificationMethods = new Set<VerificationMethod>([
  "DNS_TXT",
  "HTML_FILE",
  "META_TAG",
  "GSC_OAUTH",
]);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const domainId = getFormString(formData, "domainId");
  const method = getVerificationMethod(formData);
  const fallbackPath = domainId
    ? `/domains/${domainId}/verification`
    : "/domains";

  if (!domainId || !method) {
    return redirectToPath(request, fallbackPath, {
      error: "verification-invalid",
    });
  }

  const authorization = await getAuthorizedDomain(domainId);

  if (authorization.reason === "unauthenticated") {
    return redirectToPath(request, "/login");
  }

  if (!authorization.domain) {
    return redirectToPath(request, "/domains", { error: "domain-access" });
  }

  try {
    await createDomainVerification(domainId, method);

    return redirectToPath(request, fallbackPath, {
      status: "verification-generated",
    });
  } catch {
    return redirectToPath(request, fallbackPath, {
      error: "verification-generate-failed",
    });
  }
}

function getVerificationMethod(formData: FormData) {
  const method = getFormString(formData, "method") as VerificationMethod;

  return verificationMethods.has(method) ? method : null;
}
