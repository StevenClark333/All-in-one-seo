export const PRODUCT_BRAND_NAME = "All In One";
export const PRODUCT_AREA_NAME = "Website Care";
export const PRODUCT_DISPLAY_NAME = `${PRODUCT_BRAND_NAME} ${PRODUCT_AREA_NAME}`;

export const PRODUCT_META_DESCRIPTION =
  "Calm website care for search health, fixes, reports, and next steps.";

export const PRODUCT_NAV_DISPLAY_LABELS: Record<string, string> = {
  AI: "Ideas",
  "Competitive Analysis": "Competitor Insights",
  "Fix Center": "Fixes",
  Issues: "Problems",
  "Keyword Research": "Search Ideas",
  "Rank Tracking": "Rank Movement",
  "Search Performance": "Search Growth",
  Sites: "Websites",
  Technical: "Links",
  Billing: "Plan",
  Integrations: "Connections",
};

export const PRODUCT_NAV_HELP: Record<string, string> = {
  Overview:
    "Start here for today's plan, website health, and the next best action.",
  Clients: "Care for clients, their websites, and updates worth sharing.",
  Sites: "Add websites, confirm ownership, run checks, and stay organized.",
  Pages: "Review checked pages, titles, descriptions, and page problems.",
  "Search Performance":
    "See Google clicks, searches, top pages, and easy growth opportunities.",
  "Competitive Analysis":
    "Compare nearby competitors and spot pages or topics to improve.",
  "Keyword Research":
    "Find useful search ideas, content gaps, and easier opportunities.",
  "Rank Tracking":
    "Watch keyword movement for your website and close competitors.",
  Issues: "See problems that need attention and the easiest way to solve them.",
  "Fix Center": "Review, send, and check fixes without extra technical detail.",
  AI: "Create page writing ideas, fix notes, and simple next steps.",
  Technical: "Find pages that need better links and easier paths.",
  Reports: "Create simple updates for clients, teammates, or your own records.",
  Alerts: "Get notified when something important changes.",
  Integrations: "Connect Google, website tools, alerts, and automations.",
  Billing: "Check your plan, usage room, invoices, and billing details.",
  Settings: "Manage teammates, invitations, and account settings.",
};

export function getProductNavLabel(label: string) {
  return PRODUCT_NAV_DISPLAY_LABELS[label] ?? label;
}

export function getProductNavHelp(label: string) {
  return PRODUCT_NAV_HELP[label] ?? "Open this helpful product area.";
}

export const PRODUCT_WORKSPACE_TOOL_LABELS: Record<string, string> = {
  overview: "Overview",
  issues: getProductNavLabel("Issues"),
  pages: "Pages",
  search: getProductNavLabel("Search Performance"),
  competitive: getProductNavLabel("Competitive Analysis"),
  keywords: getProductNavLabel("Keyword Research"),
  rank: getProductNavLabel("Rank Tracking"),
  technical: getProductNavLabel("Technical"),
  fixes: getProductNavLabel("Fix Center"),
  ai: getProductNavLabel("AI"),
  reports: "Reports",
  integrations: getProductNavLabel("Integrations"),
};

export function getProductWorkspaceToolLabel(key: string) {
  return PRODUCT_WORKSPACE_TOOL_LABELS[key] ?? key;
}

export const PRODUCT_REPORT_UPDATE_COPY = {
  changeSummaryDetail:
    "Important website changes found during this report period.",
  freshScoreDetail:
    "A fresh website progress score is still being prepared for this update.",
  listIntro:
    "Turn the latest website progress into a short update someone can read without opening the full website workspace.",
  manualTitlePlaceholder: "Weekly website update",
  planHeading: "Send clearer website updates with fewer steps.",
  scheduledTitlePlaceholder: "Regular client website update",
  sharedHeaderLabel: "Shared website update",
};

export function getProductReportTitle(domain: string) {
  return `${domain} website update`;
}

export function formatProductReportTitle(title: string) {
  return title
    .replace(/\btechnical SEO report\b/gi, "website health update")
    .replace(/\bSEO report\b/gi, "website update")
    .replace(/\bSEO reports\b/gi, "website updates");
}

export const PRODUCT_CONNECTION_COPY = {
  analyticsHelp:
    "Bring in GA4 traffic data so reports can show which website pages matter most.",
  automationHelp: "Send important website care updates to Zapier or Make.",
  automationIntro:
    "Send website care updates to simple automations when a team wants another tool involved.",
  planHeading: "Connect only what helps the next website step.",
  shopifyIntro:
    "Connect a store, choose the matching website, and keep store checks tied to the right website.",
  slackChannelPlaceholder: "#website-care",
  slackHelp: "Send important website messages to a Slack channel.",
  wordpressIntro:
    "Install the Website Care plugin on WordPress sites without touching theme files.",
  wordpressSettingsHint:
    "Paste this website setup code in the Website Care settings screen after the plugin is active.",
};

export const PRODUCT_BEGINNER_COPY = {
  addWebsiteIntro:
    "Add the website first. After it is saved, the portal will guide you through ownership, check rhythm, and the first website check.",
  adminDescription:
    "Trusted teammate who can manage access and everyday website care work.",
  agencyProgressBody:
    "Reports can explain what improved without opening extra technical detail.",
  dashboardCompareIntro:
    "Use this when you want to compare websites, review search visibility, or prepare a report after the top plan is handled.",
  dashboardCheckWebsiteHelp:
    "Go to Websites to start a fresh website check.",
  dashboardDetailIntro:
    "Optional website tables and setup notes for deeper review.",
  dashboardDetailSummary:
    "Ownership, check status, and problem volume when you need to compare websites.",
  dashboardFirstWebsiteBody:
    "Websites keep each check, problem, and update in one place.",
  dashboardLatestCheckHelp: "Most recent website check for this website.",
  dashboardOpenWebsites: "Open websites",
  connectInConnections: "Connect in Connections",
  dashboardProjectListDetail:
    "Start with your website list to see which websites need attention today.",
  dashboardStartPlanBody:
    "Follow these in order. Each card takes you to one focused screen, so you do not need to understand technical website wording first.",
  dashboardStartPlanTitle: "Today's website plan",
  clientSetupDetail:
    "Connect a website before website checks can begin.",
  firstWebsiteAfterWorkspace:
    "The first website starts after the workspace is ready.",
  firstWebsiteCarePlan:
    "Set up one workspace for your business. After this, you can add the first website and let the portal build a simple website care plan.",
  memberTitle: "Website Care Teammate",
  openConnections: "Open Connections",
  passwordResetReturn:
    "Use at least 8 characters. Once saved, you can sign in again and keep working from your website care workspace.",
  rankAdjustViewDetail:
    "Save this view or narrow the page by website and keyword.",
  rankChooseWebsiteOption: "Choose website",
  rankKeywordWebsiteHeader: "Website",
  rankWebsiteFilterLabel: "Website",
  rankWebsiteScopeNote:
    "Rank movement keeps owned and competitor positions focused on this website.",
  recommendationsIntro:
    "Create simple page copy ideas and clear fix notes without needing technical wording or prompt writing.",
  websitesPageHeading: "Websites",
  workspaceHealthDetail: "Latest website health score.",
  workspaceHealthFocusPrefix: "Website health is",
  workspaceHealthHelp:
    "Gauge-style score from the latest website health value and website check history.",
  workspaceHealthLabel: "Website health",
};
