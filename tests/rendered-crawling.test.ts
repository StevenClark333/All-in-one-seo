import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRenderedDomObjectKey,
  buildScreenshotObjectKey,
  calculateVisualDiffScore,
  calculateVisualHash,
  detectJavaScriptHeavyPage,
  extractRenderedMetadata,
  renderedBrowserPool,
  renderedCrawlTimeoutMs,
} from "@/lib/rendered-crawling";

test("detects JavaScript-heavy pages", () => {
  assert.equal(
    detectJavaScriptHeavyPage(
      '<div id="__next"></div><script src="/a.js"></script><script src="/b.js"></script><script src="/c.js"></script><script src="/d.js"></script>',
    ),
    true,
  );
  assert.equal(
    detectJavaScriptHeavyPage(
      "<main><h1>Rendered content</h1><p>Lots of meaningful body copy that does not need a browser fallback.</p></main>",
    ),
    false,
  );
});

test("extracts rendered metadata from browser HTML", () => {
  const metadata = extractRenderedMetadata(
    '<title>Rendered</title><meta name="description" content="Description"><link rel="canonical" href="https://example.com/"><h1>Hello</h1><h2>World</h2>',
  );

  assert.equal(metadata.title, "Rendered");
  assert.equal(metadata.metaDescription, "Description");
  assert.equal(metadata.canonical, "https://example.com/");
  assert.equal(metadata.h1, "Hello");
  assert.deepEqual(metadata.headings, [
    { level: 1, text: "Hello" },
    { level: 2, text: "World" },
  ]);
});

test("defines rendered crawl pool, timeout, object keys, and diff foundation", () => {
  const hash = calculateVisualHash("<html></html>");

  assert.equal(renderedBrowserPool.maxBrowsers, 2);
  assert.equal(renderedBrowserPool.maxPagesPerBrowser, 4);
  assert.equal(renderedCrawlTimeoutMs, 15000);
  assert.equal(
    buildRenderedDomObjectKey({ crawlRunId: "run", pageId: "page" }),
    "rendered/run/page.html",
  );
  assert.equal(
    buildScreenshotObjectKey({ crawlRunId: "run", pageId: "page" }),
    "screenshots/run/page.png",
  );
  assert.equal(
    calculateVisualDiffScore({ currentHash: hash, previousHash: hash }),
    0,
  );
  assert.equal(
    calculateVisualDiffScore({ currentHash: hash, previousHash: "other" }),
    1,
  );
});
