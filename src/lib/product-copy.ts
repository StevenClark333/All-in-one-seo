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

export const PRODUCT_CONNECTION_COPY = {
  automationHelp: "Send important website care updates to Zapier or Make.",
  automationIntro:
    "Send website care updates to simple automations when a team wants another tool involved.",
};
