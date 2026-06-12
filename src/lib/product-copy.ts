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
    "Watch search-term movement for your website and close competitors.",
  Issues: "See problems that need attention and the easiest way to solve them.",
  "Fix Center": "Review, send, and check fixes without extra technical detail.",
  AI: "Create writing ideas, fix notes, and simple next steps.",
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
  brandedLinkCountLabel: "branded share links",
  brandedLinkEmpty: "No branded share links yet.",
  brandedLinkHelp:
    "Set up a branded report share link, such as reports.client.com.",
  brandedLinkSetupHelp:
    "Create a branded report share link and show the setup values to copy.",
  brandedLinkStatusHelp:
    "Setup status for this branded report share link.",
  brandedLinkVerifiedHelp:
    "Date the branded report share link became active.",
  brandedLinkAddressHelp:
    "Address where shared reports should open after setup is confirmed.",
  brandedLinkAddressLabel: "Share link address",
  brandedLinkCheckAction: "Check branding",
  brandedLinkCheckHelp:
    "Check the copied setup values and turn on the branded share link when they match.",
  brandedLinkSetupNameLabel: "Setup name",
  brandedLinkSetupValueLabel: "Setup value",
  addBrandedLinkAction: "Add branded link",
  changeSummaryDetail:
    "Important website changes found during this report period.",
  changeSummaryEmpty:
    "No important website changes during this report period.",
  changeSummaryQuietTitle: "No major website changes",
  freshScoreDetail:
    "A fresh website progress score is still being prepared for this update.",
  listIntro:
    "Turn the latest website progress into a short update someone can read without opening the full website workspace.",
  manualTitlePlaceholder: "Weekly website update",
  nextFixQuietTitle: "No quick fix to highlight",
  planHeading: "Send clearer website updates with fewer steps.",
  scheduledTitlePlaceholder: "Regular client website update",
  sharedHeaderLabel: "Shared website update",
  issueMovementNeedsCareLabel: "Needs care",
  issueMovementImportantChangesLabel: "Important changes",
};

export function formatProductReportBrandingStatus(value: string) {
  const labels: Record<string, string> = {
    FAILED: "Needs setup help",
    PENDING: "Waiting for setup",
    VERIFIED: "Active",
  };

  return labels[value] ?? value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatProductReportChangeTitle(count: number) {
  return count
    ? `${count.toLocaleString()} important ${count === 1 ? "change" : "changes"}`
    : PRODUCT_REPORT_UPDATE_COPY.changeSummaryQuietTitle;
}

export function formatProductReportImportance(value: string) {
  if (value === "CRITICAL") {
    return "Needs quick care";
  }

  if (value === "WARNING") {
    return "Planned";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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

export const PRODUCT_LINK_FIX_COPY = {
  addHelpfulLinkSummary: (website: string) =>
    `Add helpful page link for ${website}`,
  replaceStoppedLinkSummary: (website: string) =>
    `Replace link that stopped working for ${website}`,
};

export const PRODUCT_GLOBAL_SEARCH_COPY = {
  checkWebsiteDescription:
    "Open Websites to run a fresh check for a verified website.",
  competitorInsightsDescription:
    "Compare your website against competitors and spot useful opportunities.",
  competitorInsightsTitle: "Open competitor insights",
  searchIdeasDescription: "Find useful search ideas and content ideas.",
  searchIdeasTitle: "Open search ideas",
  rankMovementDescription: "See how watched search terms are moving.",
  rankMovementTitle: "Open rank movement",
  importantChangeLabel: "Important change",
};

export const PRODUCT_DOMAIN_VERIFICATION_COPY = {
  durableSetupDescription:
    "Best choice for most websites. Add one setup value and it keeps working across platforms.",
  durableSetupHelp:
    "Add the generated setup value where your domain is managed. This is the most durable ownership method.",
  durableSetupName: "Domain setup value",
  generatedValueEmpty:
    "Create the setup value, add it to the website or domain settings, then run the first check.",
  setupValueHelper:
    "Copy the value into your domain settings, site file, or page head.",
  checkFailed:
    "The ownership check could not run right now. Website or domain-setting checks may fail until the value is in place.",
  recordKindLabel: "Setup kind",
  recordNameLabel: "Setup name",
  recordValueLabel: "Setup value",
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
  dashboardDetailTableHelp:
    "Website table showing ownership, recent check status, pages, and problem volume across saved websites.",
  dashboardDetailWebsiteColumn: "Website",
  dashboardDetailPagesHelp:
    "Pages currently known for this saved website.",
  dashboardLinkHealthHelp:
    "Estimated link health based on page links and page-list gaps.",
  dashboardFirstWebsiteBody:
    "Websites keep each check, problem, and update in one place.",
  dashboardLatestCheckHelp: "Most recent website check for this website.",
  dashboardMetricFallbackHelp:
    "Key workspace metric used to understand everyday website care.",
  dashboardAverageHealthHelp:
    "Average website health across websites that have finished setup.",
  dashboardFixImportantDetail:
    "{domain} has a problem that needs quick care. Open it and follow the clearest fix steps.",
  dashboardFixImportantTitle: "Fix the problem needing care first",
  dashboardHealthRiskLabel: "Below 60 needs care",
  dashboardImportantChangeLabel: "Important change",
  dashboardImportantProblemsHelp:
    "Problems that can meaningfully hurt search visibility and should be fixed first.",
  dashboardImportantWorkLabel: "Needs care",
  dashboardNoImportantProblems:
    "No quick-care problems are showing. Run a fresh website check to keep progress current.",
  dashboardOpenWebsites: "Open websites",
  dashboardPlanFirstStep: "Handle quick-care problems before browsing reports.",
  connectInConnections: "Connect in Connections",
  crawlRecapQuietNextStep:
    "Nothing needs quick care right now. You can move on or open details only if you want them.",
  dashboardProjectListDetail:
    "Start with your website list to see which websites need attention today.",
  dashboardRankShortcut: "Watch search terms",
  dashboardStartPlanBody:
    "Follow these in order. Each card takes you to one focused screen, so you do not need to understand technical website wording first.",
  dashboardStartPlanTitle: "Today's website plan",
  issuesCareFilterHelp:
    "Quick-care problems go first, planned work can follow, and ideas are optional improvements.",
  issuesCareFilterLabel: "Care level",
  issuesCareFilterPlaceholder: "All care levels",
  issuesFilterSummary:
    "Optional filters for client, website, owner, problem area, or repeated page patterns.",
  issuesTypeFilterHelp:
    "Problem area, such as a missing page title or a page link that needs help.",
  issuesTypeFilterLabel: "Problem area",
  issuesTypeFilterPlaceholder: "All problem areas",
  issuesPlanBody:
    "Start with the first quick-care problem, open its guided solution, then use filters only when you want a narrower list.",
  issuesPlanQuickCareDetail:
    "planned work can wait until quick-care work is handled.",
  issuesPlanQuickCareLabel: "Care level",
  issuesPlanQuickCareValueSuffix: "quick care",
  issuesPlanVisibleWorkDetail:
    "important work visible and hides lower-priority items until you ask for them.",
  issuesPriorityHelp:
    "Care order blends care level, page importance, and fix impact. Higher numbers should be handled sooner.",
  clientSetupDetail:
    "Connect a website before website checks can begin.",
  clientCarePlanIntro:
    "Start with the client that has no website connected or has quick-care fixes. Keep the full client table as detail below.",
  clientNeedsReviewValueSuffix: "need review",
  clientNoQuickCareClients: "No quick-care clients",
  clientQuickCareDetail: "Open the client with quick-care work first.",
  clientDetailIntro:
    "Keep this client easy to manage: confirm their website setup, review quick-care fixes, then send a report when there is progress to share.",
  clientDetailMetricLabel: "Quick care / planned",
  clientDetailPlanIntro:
    "Check website setup first, then handle quick-care fixes, then use reports to show progress in plain language.",
  clientDetailNoQuickCareTitle: "Nothing needs quick care today",
  clientDetailNoQuickCareBody:
    "This client does not have quick-care open fixes right now.",
  clientDetailQuickCareDetail:
    "Open the highest-impact fix before reviewing details.",
  clientDetailQuickCareValueSuffix: "need quick care",
  clientDetailQuickCareEmptyValue: "Nothing needs quick care",
  firstWebsiteAfterWorkspace:
    "The first website starts after the workspace is ready.",
  firstWebsiteCarePlan:
    "Set up one workspace for your business. After this, you can add the first website and let the portal build a simple website care plan.",
  fixesAddHelpfulLinkTitle: "Add helpful page link",
  fixesBetterPageLabel: "Better page to use",
  fixesLinkTextLabel: "Link text",
  fixesNoCheckNeeded: "Nothing to check",
  fixesPageWithLinkLabel: "Page with the link",
  fixesReplaceStoppedLinkTitle: "Replace link that stopped working",
  fixesStoppedLinkLabel: "Link that needs help",
  linksHiddenProblemsNote:
    "more link-help items are kept out of this first view so the page stays easier to scan.",
  linksPlanLabel: "Links care plan",
  memberTitle: "Website Care Teammate",
  openConnections: "Open Connections",
  pagesContentCheckDetail:
    "Page titles are the easiest place to check before reviewing the rest of the page details.",
  pagesFirstActionQuiet: "No page needs quick care",
  pagesFirstActionSomeProblems: "pages have fixable items",
  pagesFirstActionNeedsCare: "pages need quick care",
  pagesImportantCountLabel: "Need care",
  pagesImportantGroupLabel: "need care",
  pagesMetricNeedsCare: "Pages needing care",
  pageDetailHeaderIntro:
    "Start with the next page fix, then review what search engines see on this page. More link and change detail is still available when you need it.",
  pageDetailMoreIntro:
    "Open this for page changes and helpful-link detail.",
  pageDetailMoreTitle: "More page detail",
  pageDetailMissingLinkText: "No visible link words saved yet",
  pageDetailNoLinks: "No helpful links recorded yet.",
  pagesNoQuickFix: "No quick fix waiting",
  pagesOpenProblemsLabel: "Open problems",
  pagesPageChangesEmpty: "No important page changes yet.",
  pagesPlanDetail:
    "Open the page list and start with pages that need the quickest care.",
  pagesPlanIntro:
    "This view is focused on {scope}. Check the pages needing care first, then use patterns when one repeated fix can help a whole group.",
  passwordResetReturn:
    "Use at least 8 characters. Once saved, you can sign in again and keep working from your website care workspace.",
  rankAdjustViewDetail:
    "Save this view or narrow the page by website and search term.",
  rankAdjustViewTitle: "Adjust Google spots",
  rankAverageHelp:
    "Average latest owned spot across watched search terms with saved Google spots.",
  rankAddTermAction: "Add search term",
  rankChooseTermOption: "Choose search term",
  rankCompetitorGapEmpty:
    "Add competitor positions to reveal search terms where another page is ahead.",
  rankCompetitorGapHiddenNote:
    "more competitor comparisons are available when you want deeper page review.",
  rankCompetitorGapIntro:
    "Search terms where another page is ahead and your page may need work.",
  rankCompetitorGapPositionLabel: "Positions",
  rankCompetitorGapTitle: "Competitor page gaps",
  rankCompetitorWebsiteFieldLabel: "Other website",
  rankCompetitionLabel: "Competition",
  rankDetailEmpty:
    "No search terms are being watched yet. Add one above to begin rank movement tracking.",
  rankDetailIntro:
    "Optional watched search-term list for Google spot, monthly searches, competition, and status.",
  rankDetailTitle: "More search-term detail",
  rankImportDetailsTitle: "Add search details",
  rankFirstStepAddDetail:
    "Add one important search term so the tracker can start showing progress.",
  rankFirstStepAddLabel: "Add your first search term",
  rankFirstStepWatchDetail:
    "Watch the search terms that already have movement before adding more data.",
  rankHeaderBadgeSuffix: "search terms watched",
  rankHeaderIntro:
    "See which search terms moved, what dropped, and where one page can be improved next.",
  rankHiddenTermsNote:
    "more search terms are hidden so the first view stays focused on movement.",
  rankMissingPositionsDetail:
    "Add one Google position so averages and top groups become useful.",
  rankMissingPositionsLabel: "Add missing Google spots",
  rankMissingPositionsValueSuffix: "need a Google spot",
  rankManageAction: "Add updates",
  rankManageDataIntro:
    "Add a search term, save a Google spot, or add monthly search details when you want to update this page.",
  rankManageHideAction: "Hide updates",
  rankManageTitle: "Update search terms",
  rankMetricHelp:
    "Active and paused search terms currently watched for movement.",
  rankMetricLabel: "Watched search terms",
  rankMovementMonitorTitle: "Movement watch",
  rankMonthlySearchesLabel: "Monthly searches",
  rankOwnedSpotHeader: "Your Google spot",
  rankPositionTitle: "Add Google position",
  rankPositionYourSiteHint: "Leave blank for your website",
  rankProviderFieldLabel: "Where this came from",
  rankProviderPlaceholder: "Optional source name",
  rankReadyDetail:
    "Google spots are ready, so focus on the best search terms near page one.",
  rankReadyLabel: "Improve page-one chances",
  rankStatusWaiting: "Waiting for Google spots",
  rankTableTermHeader: "Search term",
  rankPlanHeading: "Know which search term needs attention next.",
  rankPlanTitle: "Rank movement plan",
  rankPlanNoDropsLabel: "Nothing slipped today",
  rankRecoverDetail:
    "Review the search terms that dropped and decide whether a page needs a content refresh.",
  rankRecoverLabel: "Help slipped search terms",
  rankDistributionIntro:
    "Latest Google spots grouped for quick website scanning.",
  rankDistributionTitle: "Google spot groups",
  rankSaveDetailsAction: "Save details",
  rankSavePositionAction: "Save position",
  rankStableDetail:
    "No watched search-term drops are showing right now.",
  rankTermExample: "best website help",
  rankTermFieldLabel: "Search term",
  rankTrackTermTitle: "Watch search term",
  rankWatchedValueSuffix: "watched",
  rankTopThreeHelp:
    "Latest owned spots in the top three organic results.",
  rankTopTenHelp:
    "Latest owned spots in the top ten organic results.",
  rankChooseWebsiteOption: "Choose website",
  rankKeywordWebsiteHeader: "Website",
  rankWebsiteFilterLabel: "Website",
  rankWebsiteScopeNote:
    "Rank movement keeps owned and competitor positions focused on this website.",
  recommendationsIntro:
    "Create simple page copy ideas and clear fix notes without needing technical wording or prompt writing.",
  recommendationsNeedsCareLabel: "Needs quick care",
  recommendationsPlannedLabel: "Planned",
  recommendationsPriorityNeedsCare: "Needs care first",
  recommendationsPriorityHigh: "High care priority",
  recommendationsPriorityPlanned: "Planned care",
  recommendationsRepeatedNeedsCareLabel: "need care",
  searchIdeasContentGapHelp:
    "Search terms with many views but weak visits or Google spots.",
  searchIdeasCompetitorGapEmpty:
    "Add competitors and Google spots in Rank Movement to reveal search terms they win.",
  searchIdeasCompetitorGapIntro:
    "Watched search terms where another page is ahead and yours may need a clearer answer.",
  searchIdeasCompetitorSpotLabel: "Their Google spot",
  searchIdeasClickRateLabel: "Click rate",
  searchIdeasDetailEmpty:
    "No Search Console search terms match this view.",
  searchIdeasDetailIntro:
    "Imported search terms kept for optional deeper review.",
  searchIdeasDemandEmpty:
    "Connect Google Search Console search-term data to show what people want most.",
  searchIdeasFilterTitle: "Adjust search idea filters",
  searchIdeasHiddenTermsNote:
    "more search terms are available through filters or exported reporting.",
  searchIdeasMetricOpportunityHelp:
    "High-demand search ideas found from current and declining search terms.",
  searchIdeasNoOpportunity:
    "No search ideas match this view yet. Try a wider date range or website filter.",
  searchIdeasPlanIntro:
    "Pick one useful search idea, create a simple brief, then compare pages only when it helps. Deeper search-term detail is optional.",
  searchIdeasSetupDetail:
    "Connect Google Search Console so search ideas come from real searches instead of guesswork.",
  searchIdeasSetupTitle: "Connect search data",
  searchIdeasTrackTermsTitle: "Choose search terms to watch",
  searchIdeasImproveTitle: "Pick one search idea to improve",
  searchIdeasMonthlySearchesLabel: "Monthly searches",
  searchIdeasMonthlySearchesMissing: "No monthly searches yet",
  searchIdeasPositionLabel: "Google spot",
  searchIdeasVisitsLabel: "Visits",
  searchIdeasVisibilityHelp:
    "How visible the selected website is across these search terms.",
  searchIdeasSearchTermGroupsHelp:
    "Unique search-term groups with imported Search Console metrics.",
  searchIdeasSearchTermsLabel: "Search terms",
  searchIdeasTimesSeenLabel: "Times seen",
  searchIdeasWorkspaceNote:
    "Search ideas use imported Google Search Console search-term data.",
  searchIdeasYourSpotFallback: "not in view yet",
  searchIdeasYourSpotLabel: "Your Google spot",
  searchGrowthIdeasFallback:
    "Use search ideas to create or improve pages before the next search import.",
  searchGrowthNoDropDetail:
    "No clear search-term drop in this range. Keep watching the next import.",
  searchGrowthMoreDetailHidden:
    "more search items are available through filters or saved reporting.",
  searchGrowthMoreDetailIntro:
    "Open the full search-term and page tables when you want to compare more details.",
  searchGrowthMoreDetailTitle: "More search detail",
  searchGrowthShowTablesAction: "Show details",
  searchGrowthSetupDetail:
    "Connect Google Search Console so this page can show clicks, visits, Google spots, and easy growth opportunities.",
  searchGrowthTableClickRateLabel: "Click rate",
  searchGrowthTrackAction: "Watch search terms",
  searchGrowthTrackDetail:
    "Choose the search terms you care about first, then compare them with Search Console data after import.",
  searchGrowthTrackTitle: "Choose search terms to watch",
  websitesPageHeading: "Websites",
  websitesCareShortlistIntro:
    "Sorted by setup needs, quick-care problems, and lower health so you do not have to scan the full table.",
  websitesCareTableQuickCareHeader: "Quick care",
  websitesCareReadyDetail:
    "Websites with ownership confirmed and no quick-care problems are the calm group.",
  websitesCareCardQuickCareLabel: "Quick care",
  workspaceHealthDetail: "Latest website health score.",
  workspaceHealthFocusPrefix: "Website health is",
  workspaceHealthHelp:
    "Gauge-style score from the latest website health value and website check history.",
  workspaceHealthLabel: "Website health",
  workspaceSearchClicksHelp:
    "Visits from Google Search Console search results.",
  workspaceSearchImpressionsHelp:
    "Times this website appeared in Google Search Console search results.",
  workspaceSearchIntro:
    "Search terms and page demand from Google Search Console imports.",
  workspaceSearchLabel: "Search terms",
  workspaceSearchTermsHelp:
    "Distinct search terms found in imported Search Console rows.",
  workspaceSearchTitleHelp:
    "Imported Google Search Console search visibility and demand signals for this website.",
  workspaceSearchVisibilityHelp:
    "How visible this website is across imported Google Search Console search terms.",
  workspaceCareProblemsDetail:
    "Quick-care and planned problems for this website.",
  workspaceCareProblemsHelp:
    "Open quick-care and planned problems.",
  workspaceCareProblemsLabel: "Care priorities",
  workspaceCareProblemsMetricHelp:
    "Quick-care problems first, planned work second.",
  workspaceCareProblemsMetricLabel: "Quick care / planned",
  workspaceCareProblemsSectionHelp:
    "Problems that need attention for this website only.",
  workspaceCareProblemsSectionIntro:
    "Website findings ordered by what needs care first.",
  workspaceCareProblemsSectionTitle: "Care priorities",
  workspaceCommandQuickCareLabel: "Fix quick-care problems",
  workspaceQuickCareSignalLabel: "Needs care",
  websiteDetailCareMetricHelp:
    "Quick-care problems first, planned work second.",
  websiteDetailCareMetricLabel: "Quick care / planned",
  websiteDetailCarePlanBody:
    "Start with verification if the website is new. Once it is verified, run a website check and open the problem that needs care first.",
  websiteDetailCarePlanEmpty: "Nothing needs quick care",
  websiteDetailCarePlanProblemDetail:
    "Open care priorities after the check finishes.",
  websiteDetailCarePlanProblemValueSuffix: "need care",
  websiteDetailCareSectionBody:
    "This website does not have care-priority problems right now.",
  websiteDetailCareSectionHelp:
    "The first problems worth opening for this website.",
  websiteDetailCareSectionTitle: "Care priorities",
  workspaceFocusQuickCareDetail:
    "These are the problems most likely to affect visitors or search visibility.",
  workspaceFocusQuickCareValueSuffix: "need quick care",
  workspaceFocusPlannedDetail:
    "No quick-care problems are blocking you. Review the planned list next.",
  workspaceFocusPlannedValueSuffix: "planned fixes",
};

export function formatProductPagesFirstAction(input: {
  pagesNeedingCare: number;
  pagesWithProblems: number;
}) {
  if (input.pagesNeedingCare > 0) {
    return `${input.pagesNeedingCare.toLocaleString()} ${
      PRODUCT_BEGINNER_COPY.pagesFirstActionNeedsCare
    }`;
  }

  if (input.pagesWithProblems > 0) {
    return `${input.pagesWithProblems.toLocaleString()} ${
      PRODUCT_BEGINNER_COPY.pagesFirstActionSomeProblems
    }`;
  }

  return PRODUCT_BEGINNER_COPY.pagesFirstActionQuiet;
}

export function formatProductSearchIdeasContentGapDetail(searchTerm: string) {
  return `"${searchTerm}" gets impressions but needs a better answer, page title, or helpful page links.`;
}

export function formatProductPageDetailType(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("critical") || normalized.includes("regression")) {
    return "Important page change";
  }

  if (normalized.includes("noindex") || normalized.includes("robots")) {
    return "Search visibility setting";
  }

  if (normalized.includes("canonical")) {
    return "Preferred page setting";
  }

  if (normalized.includes("schema")) {
    return "Page detail";
  }

  if (normalized.includes("title") || normalized.includes("description")) {
    return "Search result text";
  }

  const problemArea = formatProductProblemArea(value);

  if (problemArea !== formatEnumLabel(value)) {
    return problemArea;
  }

  return formatEnumLabel(value);
}

export function formatProductProblemArea(value: string) {
  const groupKey = value.split(":").at(0) ?? value;
  const normalized = groupKey.toLowerCase();
  const labels: Record<string, string> = {
    broken_canonical: "Preferred page link needs help",
    broken_internal_link: "Page link that needs help",
    canonical_non_200: "Preferred page is not loading",
    critical_regression: "Important change",
    deep_page: "Page is hard to reach",
    duplicate_content_cluster: "Repeated content group",
    duplicate_meta_description: "Repeated page description",
    duplicate_title: "Repeated page title",
    homepage_blocked_by_robots: "Homepage blocked from Google",
    internally_linked_url_missing_from_sitemap:
      "Linked page missing from page list",
    invalid_hreflang: "Language setting needs attention",
    missing_canonical: "Preferred page link missing",
    missing_h1: "Main heading missing",
    missing_image_alt: "Image description missing",
    missing_meta_description: "Page description missing",
    missing_pagination_links: "Page series links missing",
    missing_schema: "Page details for Google missing",
    missing_title: "Page title missing",
    multiple_h1: "Too many main headings",
    page_4xx: "Page is not loading",
    page_5xx: "Website error page",
    page_noindex: "Page hidden from Google",
    poor_heading_hierarchy: "Heading order needs attention",
    product_schema_missing: "Product details for Google missing",
    redirect_chain: "Page redirect path needs attention",
    robots_txt_unavailable_or_malformed: "Robots file needs attention",
    sitemap_unavailable: "Page list needs attention",
    sitemap_url_not_internally_linked:
      "Page is in the page list but needs links",
    thin_content: "Page needs more helpful content",
    weak_meta_description: "Page description needs polish",
    weak_title: "Page title needs polish",
  };

  return labels[normalized] ?? formatEnumLabel(groupKey)
    .replace(/\bMeta Description\b/g, "Page description")
    .replace(/\bH1\b/g, "Main heading")
    .replace(/\bCanonical\b/g, "Preferred page")
    .replace(/\bNoindex\b/g, "Hidden from Google")
    .replace(/\bSitemap\b/g, "Page list")
    .replace(/\bSchema\b/g, "Page details for Google")
    .replace(/\bInternal Link\b/g, "Page link");
}

export function formatProductRecommendationImportance(value: string) {
  if (value === "CRITICAL") {
    return PRODUCT_BEGINNER_COPY.recommendationsNeedsCareLabel;
  }

  if (value === "WARNING") {
    return PRODUCT_BEGINNER_COPY.recommendationsPlannedLabel;
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatProductRecommendationPriority(score: number) {
  if (score >= 80) {
    return PRODUCT_BEGINNER_COPY.recommendationsPriorityNeedsCare;
  }

  if (score >= 50) {
    return PRODUCT_BEGINNER_COPY.recommendationsPriorityHigh;
  }

  return PRODUCT_BEGINNER_COPY.recommendationsPriorityPlanned;
}

export function formatProductWorkspaceProblemSeverity(value: string) {
  if (value === "CRITICAL") {
    return "Needs quick care";
  }

  if (value === "WARNING") {
    return "Planned";
  }

  if (value === "INFO") {
    return "Idea";
  }

  return formatEnumLabel(value);
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
