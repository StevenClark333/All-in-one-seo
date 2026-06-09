import assert from "node:assert/strict";
import test from "node:test";
import {
  formatProductReportTitle,
  getProductNavHelp,
  getProductNavLabel,
  getProductWorkspaceToolLabel,
  getProductReportTitle,
  PRODUCT_AREA_NAME,
  PRODUCT_BEGINNER_COPY,
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
    PRODUCT_REPORT_UPDATE_COPY.freshScoreDetail,
    "A fresh website progress score is still being prepared for this update.",
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
  assert.equal(
    formatProductReportTitle("Northstar Dental weekly SEO report"),
    "Northstar Dental weekly website update",
  );
  assert.equal(
    formatProductReportTitle("Urban Thread technical SEO report"),
    "Urban Thread website health update",
  );
  assert.doesNotMatch(
    [
      ...Object.values(PRODUCT_REPORT_UPDATE_COPY),
      getProductReportTitle("example.com"),
      formatProductReportTitle("Northstar Dental weekly SEO report"),
      formatProductReportTitle("Urban Thread technical SEO report"),
    ].join(" "),
    /SEO workspace|SEO update|SEO report|SEO changes|Fresh audit data/,
  );
});

test("uses soft connection wording for automation handoffs", () => {
  assert.equal(
    PRODUCT_CONNECTION_COPY.analyticsHelp,
    "Bring in GA4 traffic data so reports can show which website pages matter most.",
  );
  assert.equal(
    PRODUCT_CONNECTION_COPY.automationHelp,
    "Send important website care updates to Zapier or Make.",
  );
  assert.equal(
    PRODUCT_CONNECTION_COPY.automationIntro,
    "Send website care updates to simple automations when a team wants another tool involved.",
  );
  assert.equal(
    PRODUCT_CONNECTION_COPY.planHeading,
    "Connect only what helps the next website step.",
  );
  assert.equal(
    PRODUCT_CONNECTION_COPY.shopifyIntro,
    "Connect a store, choose the matching website, and keep store checks tied to the right website.",
  );
  assert.equal(PRODUCT_CONNECTION_COPY.slackChannelPlaceholder, "#website-care");
  assert.equal(
    PRODUCT_CONNECTION_COPY.slackHelp,
    "Send important website messages to a Slack channel.",
  );
  assert.equal(
    PRODUCT_CONNECTION_COPY.wordpressIntro,
    "Install the Website Care plugin on WordPress sites without touching theme files.",
  );
  assert.equal(
    PRODUCT_CONNECTION_COPY.wordpressSettingsHint,
    "Paste this website setup code in the Website Care settings screen after the plugin is active.",
  );
  assert.doesNotMatch(
    Object.values(PRODUCT_CONNECTION_COPY).join(" "),
    /SEO step|SEO pages|SEO messages|store SEO|All In One SEO/,
  );
});

test("uses beginner-safe wording for broad account and ideas surfaces", () => {
  assert.equal(
    PRODUCT_BEGINNER_COPY.addWebsiteIntro,
    "Add the website first. After it is saved, the portal will guide you through ownership, check rhythm, and the first website check.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.adminDescription,
    "Trusted teammate who can manage access and everyday website care work.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.memberTitle, "Website Care Teammate");
  assert.equal(
    PRODUCT_BEGINNER_COPY.agencyProgressBody,
    "Reports can explain what improved without opening extra technical detail.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.clientSetupDetail,
    "Connect a website before website checks can begin.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardCompareIntro,
    "Use this when you want to compare websites, review search visibility, or prepare a report after the top plan is handled.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardCheckWebsiteHelp,
    "Go to Websites to start a fresh website check.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardDetailIntro,
    "Optional website tables and setup notes for deeper review.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardDetailSummary,
    "Ownership, check status, and problem volume when you need to compare websites.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardFirstWebsiteBody,
    "Websites keep each check, problem, and update in one place.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardLatestCheckHelp,
    "Most recent website check for this website.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.dashboardOpenWebsites, "Open websites");
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardProjectListDetail,
    "Start with your website list to see which websites need attention today.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.firstWebsiteAfterWorkspace,
    "The first website starts after the workspace is ready.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.websitesPageHeading, "Websites");
  assert.equal(
    PRODUCT_BEGINNER_COPY.workspaceHealthDetail,
    "Latest website health score.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.workspaceHealthFocusPrefix,
    "Website health is",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.workspaceHealthHelp,
    "Gauge-style score from the latest website health value and website check history.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.workspaceHealthLabel, "Website health");
  assert.equal(
    PRODUCT_BEGINNER_COPY.passwordResetReturn,
    "Use at least 8 characters. Once saved, you can sign in again and keep working from your website care workspace.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.recommendationsIntro,
    "Create simple page copy ideas and clear fix notes without needing technical wording or prompt writing.",
  );
  assert.doesNotMatch(
    Object.values(PRODUCT_BEGINNER_COPY).join(" "),
    /SEO dashboard|everyday SEO work|SEO jargon|SEO Teammate|raw audit detail|SEO checks|first SEO check|compare projects|project list|Go to Projects|Loading projects|\bsite health value\b|\bSite health is\b/,
  );
});
