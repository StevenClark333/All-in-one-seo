import assert from "node:assert/strict";
import test from "node:test";
import {
  getProductNavHelp,
  getProductNavLabel,
  getProductWorkspaceToolLabel,
  getProductReportTitle,
  PRODUCT_AREA_NAME,
  PRODUCT_BRAND_NAME,
  PRODUCT_CONNECTION_COPY,
  PRODUCT_DISPLAY_NAME,
  PRODUCT_META_DESCRIPTION,
  PRODUCT_REPORT_UPDATE_COPY,
} from "@/lib/product-copy";

test("uses soft product framing for nontechnical website care", () => {
  assert.equal(PRODUCT_BRAND_NAME, "All In One");
  assert.equal(PRODUCT_AREA_NAME, "Website Care");
  assert.equal(PRODUCT_DISPLAY_NAME, "All In One Website Care");
  assert.match(PRODUCT_META_DESCRIPTION, /Calm website care/);
  assert.doesNotMatch(PRODUCT_DISPLAY_NAME, /Ops/);
});

test("uses softer product navigation labels for beginner scanning", () => {
  assert.equal(getProductNavLabel("Sites"), "Websites");
  assert.equal(getProductNavLabel("Search Performance"), "Search Growth");
  assert.equal(
    getProductNavLabel("Competitive Analysis"),
    "Competitor Insights",
  );
  assert.equal(getProductNavLabel("Keyword Research"), "Search Ideas");
  assert.equal(getProductNavLabel("Rank Tracking"), "Rank Movement");
  assert.equal(getProductNavLabel("AI"), "Ideas");
  assert.equal(getProductNavLabel("Technical"), "Links");
  assert.equal(getProductNavLabel("Integrations"), "Connections");
  assert.equal(
    getProductNavHelp("Keyword Research"),
    "Find useful search ideas, content gaps, and easier opportunities.",
  );
  assert.doesNotMatch(
    Object.values({
      competitor: getProductNavLabel("Competitive Analysis"),
      keyword: getProductNavLabel("Keyword Research"),
      rank: getProductNavLabel("Rank Tracking"),
      search: getProductNavLabel("Search Performance"),
      integrations: getProductNavLabel("Integrations"),
    }).join(" "),
    /Analysis|Research|Tracking|Performance|Integrations/,
  );
});

test("uses the same soft labels inside website tool navigation", () => {
  assert.equal(getProductWorkspaceToolLabel("issues"), "Problems");
  assert.equal(getProductWorkspaceToolLabel("search"), "Search Growth");
  assert.equal(
    getProductWorkspaceToolLabel("competitive"),
    "Competitor Insights",
  );
  assert.equal(getProductWorkspaceToolLabel("keywords"), "Search Ideas");
  assert.equal(getProductWorkspaceToolLabel("rank"), "Rank Movement");
  assert.equal(getProductWorkspaceToolLabel("technical"), "Links");
  assert.equal(getProductWorkspaceToolLabel("ai"), "Ideas");
  assert.equal(getProductWorkspaceToolLabel("integrations"), "Connections");
  assert.doesNotMatch(
    [
      getProductWorkspaceToolLabel("search"),
      getProductWorkspaceToolLabel("competitive"),
      getProductWorkspaceToolLabel("keywords"),
      getProductWorkspaceToolLabel("rank"),
      getProductWorkspaceToolLabel("integrations"),
    ].join(" "),
    /Search$|Competitors|Keywords|Rank$|Integrations/,
  );
});

test("uses soft report update wording for client handoffs", () => {
  assert.equal(
    PRODUCT_REPORT_UPDATE_COPY.listIntro,
    "Turn the latest website progress into a short update someone can read without opening the full website workspace.",
  );
  assert.equal(
    PRODUCT_REPORT_UPDATE_COPY.manualTitlePlaceholder,
    "Weekly website update",
  );
  assert.equal(
    PRODUCT_REPORT_UPDATE_COPY.scheduledTitlePlaceholder,
    "Regular client website update",
  );
  assert.equal(
    PRODUCT_REPORT_UPDATE_COPY.planHeading,
    "Send clearer website updates with fewer steps.",
  );
  assert.equal(
    PRODUCT_REPORT_UPDATE_COPY.sharedHeaderLabel,
    "Shared website update",
  );
  assert.equal(
    PRODUCT_REPORT_UPDATE_COPY.changeSummaryDetail,
    "Important website changes found during this report period.",
  );
  assert.equal(
    getProductReportTitle("example.com"),
    "example.com website update",
  );
  assert.doesNotMatch(
    [
      ...Object.values(PRODUCT_REPORT_UPDATE_COPY),
      getProductReportTitle("example.com"),
    ].join(" "),
    /SEO workspace|SEO update|SEO report|SEO changes/,
  );
});

test("uses soft connection wording for automation handoffs", () => {
  assert.equal(
    PRODUCT_CONNECTION_COPY.automationHelp,
    "Send important website care updates to Zapier or Make.",
  );
  assert.equal(
    PRODUCT_CONNECTION_COPY.automationIntro,
    "Send website care updates to simple automations when a team wants another tool involved.",
  );
  assert.doesNotMatch(
    Object.values(PRODUCT_CONNECTION_COPY).join(" "),
    /SEO update|SEO updates/,
  );
});
