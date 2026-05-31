import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getWorkspacePlanLimits } from "@/lib/billing";
import { getPrisma } from "@/lib/prisma";

export const renderedCrawlTimeoutMs = 15_000;
export const renderedBrowserPool = {
  maxBrowsers: 2,
  maxPagesPerBrowser: 4,
};

export type RenderedPageMetadata = {
  canonical: string | null;
  h1: string | null;
  headings: Array<{ level: number; text: string }>;
  metaDescription: string | null;
  title: string | null;
};

export function detectJavaScriptHeavyPage(html: string) {
  const $ = cheerio.load(html);
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const scriptCount = $("script[src],script:not([type])").length;
  const appRootCount = $("#__next,#root,#app,[data-reactroot]").length;

  return bodyText.length < 250 && (scriptCount >= 4 || appRootCount > 0);
}

export function extractRenderedMetadata(html: string): RenderedPageMetadata {
  const $ = cheerio.load(html);

  return {
    canonical: $('link[rel="canonical"]').first().attr("href")?.trim() || null,
    h1: $("h1").first().text().replace(/\s+/g, " ").trim() || null,
    headings: $("h1,h2,h3,h4,h5,h6")
      .map((_, element) => ({
        level: Number(element.tagName.replace("h", "")),
        text: $(element).text().replace(/\s+/g, " ").trim(),
      }))
      .get()
      .filter((heading) => heading.text),
    metaDescription:
      $('meta[name="description"]').first().attr("content")?.trim() || null,
    title: $("title").first().text().trim() || null,
  };
}

export function buildRenderedDomObjectKey(input: {
  crawlRunId: string;
  pageId: string;
}) {
  return `rendered/${input.crawlRunId}/${input.pageId}.html`;
}

export function buildScreenshotObjectKey(input: {
  crawlRunId: string;
  pageId: string;
}) {
  return `screenshots/${input.crawlRunId}/${input.pageId}.png`;
}

export function calculateVisualHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function calculateVisualDiffScore({
  currentHash,
  previousHash,
}: {
  currentHash: string | null;
  previousHash: string | null;
}) {
  if (!currentHash || !previousHash) {
    return null;
  }

  return currentHash === previousHash ? 0 : 1;
}

export async function assertRenderedCrawlAllowed(workspaceId: string) {
  const plan = await getWorkspacePlanLimits(workspaceId);

  if (!plan.renderedCrawling) {
    throw new Error(
      "Rendered crawling is available on Growth plans and above.",
    );
  }
}

export async function createRenderedCaptureRecord({
  crawlRunId,
  html,
  pageId,
  screenshotEnabled,
}: {
  crawlRunId: string;
  html: string;
  pageId: string;
  screenshotEnabled: boolean;
}) {
  const metadata = extractRenderedMetadata(html);
  const visualHash = calculateVisualHash(html);
  const previousCapture = await getPrisma().renderedPageCapture.findFirst({
    where: { pageId },
    orderBy: { createdAt: "desc" },
    select: { id: true, visualHash: true },
  });
  const diffScore = calculateVisualDiffScore({
    currentHash: visualHash,
    previousHash: previousCapture?.visualHash ?? null,
  });

  return getPrisma().renderedPageCapture.create({
    data: {
      crawlRunId,
      diffScore,
      domObjectKey: buildRenderedDomObjectKey({ crawlRunId, pageId }),
      metadataJson: metadata as Prisma.InputJsonObject,
      pageId,
      previousCaptureId: previousCapture?.id,
      provider: "PLAYWRIGHT",
      screenshotObjectKey: screenshotEnabled
        ? buildScreenshotObjectKey({ crawlRunId, pageId })
        : null,
      status: "CAPTURED",
      visualHash,
    },
  });
}
