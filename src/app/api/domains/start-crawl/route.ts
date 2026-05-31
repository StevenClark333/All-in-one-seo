import { NextRequest } from "next/server";
import { assertCanStartCrawl, BillingLimitError } from "@/lib/billing";
import { createManualCrawlRun, runHomepageCrawl } from "@/lib/crawler";
import { getAuthorizedDomain } from "@/lib/domain-route-auth";
import { getFormString, redirectToPath } from "@/lib/route-helpers";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const domainId = getFormString(formData, "domainId");
  const returnTo = getFormString(formData, "returnTo") || "/domains";

  if (!domainId) {
    return redirectToPath(request, "/domains", { error: "crawl-invalid" });
  }

  const authorization = await getAuthorizedDomain(domainId);

  if (authorization.reason === "unauthenticated") {
    return redirectToPath(request, "/login");
  }

  if (!authorization.domain) {
    return redirectToPath(request, "/domains", { error: "domain-access" });
  }

  try {
    await assertCanStartCrawl(domainId);
    const crawlRun = await createManualCrawlRun(domainId);
    await runHomepageCrawl(crawlRun.id);

    return redirectToPath(request, `/crawl-runs/${crawlRun.id}`);
  } catch (error) {
    return redirectToPath(request, returnTo, {
      error: getCrawlErrorCode(error),
    });
  }
}

function getCrawlErrorCode(error: unknown) {
  if (error instanceof BillingLimitError) {
    if (error.code === "DOMAIN_NOT_VERIFIED") {
      return "crawl-not-verified";
    }

    if (error.code === "PAGE_CRAWL_LIMIT") {
      return "crawl-page-limit";
    }

    if (error.code === "CRAWL_FREQUENCY_LIMIT") {
      return "crawl-plan-limit";
    }
  }

  return "crawl-failed";
}
