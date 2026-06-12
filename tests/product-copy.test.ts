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
  PRODUCT_GLOBAL_SEARCH_COPY,
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
  assert.equal(
    getProductNavHelp("Rank Tracking"),
    "Watch search-term movement for your website and close competitors.",
  );
  assert.equal(
    getProductNavHelp("AI"),
    "Create writing ideas, fix notes, and simple next steps.",
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

test("uses soft global search action wording", () => {
  assert.equal(
    PRODUCT_GLOBAL_SEARCH_COPY.checkWebsiteDescription,
    "Open Websites to run a fresh check for a verified website.",
  );
  assert.equal(
    PRODUCT_GLOBAL_SEARCH_COPY.competitorInsightsDescription,
    "Compare your website against competitors and spot useful opportunities.",
  );
  assert.equal(
    PRODUCT_GLOBAL_SEARCH_COPY.competitorInsightsTitle,
    "Open competitor insights",
  );
  assert.equal(
    PRODUCT_GLOBAL_SEARCH_COPY.searchIdeasDescription,
    "Find useful search ideas and content ideas.",
  );
  assert.equal(
    PRODUCT_GLOBAL_SEARCH_COPY.searchIdeasTitle,
    "Open search ideas",
  );
  assert.equal(
    PRODUCT_GLOBAL_SEARCH_COPY.rankMovementDescription,
    "See how watched search terms are moving.",
  );
  assert.equal(
    PRODUCT_GLOBAL_SEARCH_COPY.rankMovementTitle,
    "Open rank movement",
  );
  assert.doesNotMatch(
    Object.values(PRODUCT_GLOBAL_SEARCH_COPY).join(" "),
    /Open Projects|Open competitors|Open keywords|keyword positions|Find useful keyword|Open rank$/,
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
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardAverageHealthHelp,
    "Average website health across websites that have finished setup.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardMetricFallbackHelp,
    "Key workspace metric used to understand everyday website care.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.dashboardOpenWebsites, "Open websites");
  assert.equal(
    PRODUCT_BEGINNER_COPY.connectInConnections,
    "Connect in Connections",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.openConnections, "Open Connections");
  assert.equal(
    PRODUCT_BEGINNER_COPY.pagesContentCheckDetail,
    "Page titles are the easiest place to check before reviewing the rest of the page details.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardProjectListDetail,
    "Start with your website list to see which websites need attention today.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardRankShortcut,
    "Watch search terms",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardStartPlanBody,
    "Follow these in order. Each card takes you to one focused screen, so you do not need to understand technical website wording first.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.dashboardStartPlanTitle,
    "Today's website plan",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.firstWebsiteAfterWorkspace,
    "The first website starts after the workspace is ready.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.firstWebsiteCarePlan,
    "Set up one workspace for your business. After this, you can add the first website and let the portal build a simple website care plan.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.linksPlanLabel, "Links care plan");
  assert.equal(
    PRODUCT_BEGINNER_COPY.linksHiddenProblemsNote,
    "more link-help items are kept out of this first view so the page stays easier to scan.",
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
    PRODUCT_BEGINNER_COPY.workspaceSearchClicksHelp,
    "Visits from Google Search Console search results.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.workspaceSearchImpressionsHelp,
    "Times this website appeared in Google Search Console search results.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.workspaceSearchIntro,
    "Search terms and page demand from Google Search Console imports.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.workspaceSearchLabel, "Search terms");
  assert.equal(
    PRODUCT_BEGINNER_COPY.workspaceSearchTermsHelp,
    "Distinct search terms found in imported Search Console rows.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.workspaceSearchTitleHelp,
    "Imported Google Search Console search visibility and demand signals for this website.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.workspaceSearchVisibilityHelp,
    "How visible this website is across imported Google Search Console search terms.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.passwordResetReturn,
    "Use at least 8 characters. Once saved, you can sign in again and keep working from your website care workspace.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankAdjustViewDetail,
    "Save this view or narrow the page by website and search term.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankAverageHelp,
    "Average latest owned spot across watched search terms with saved Google spots.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.rankAddTermAction, "Add search term");
  assert.equal(PRODUCT_BEGINNER_COPY.rankChooseTermOption, "Choose search term");
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankCompetitorGapEmpty,
    "Add competitor positions to reveal search terms where another page is ahead.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankCompetitorGapHiddenNote,
    "more competitor comparisons are available when you want deeper page review.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankCompetitorGapIntro,
    "Search terms where another page is ahead and your page may need work.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankCompetitorGapPositionLabel,
    "Positions",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankCompetitorGapTitle,
    "Competitor page gaps",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.rankCompetitionLabel, "Competition");
  assert.equal(PRODUCT_BEGINNER_COPY.rankAdjustViewTitle, "Adjust Google spots");
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankDetailEmpty,
    "No search terms are being watched yet. Add one above to begin rank movement tracking.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankDetailIntro,
    "Optional watched search-term list for Google spot, monthly searches, competition, and status.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.rankDetailTitle, "More search-term detail");
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankImportDetailsTitle,
    "Add search details",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankFirstStepAddDetail,
    "Add one important search term so the tracker can start showing progress.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankFirstStepAddLabel,
    "Add your first search term",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankFirstStepWatchDetail,
    "Watch the search terms that already have movement before adding more data.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankHeaderBadgeSuffix,
    "search terms watched",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankHeaderIntro,
    "See which search terms moved, what dropped, and where one page can be improved next.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankHiddenTermsNote,
    "more search terms are hidden so the first view stays focused on movement.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankMissingPositionsDetail,
    "Add one Google position so averages and top groups become useful.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankMissingPositionsLabel,
    "Add missing Google spots",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankMissingPositionsValueSuffix,
    "need a Google spot",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankManageDataIntro,
    "Add search terms, save a Google position, or add search details when you need to update the tracker manually.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankMetricHelp,
    "Active and paused search terms currently watched for movement.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.rankMetricLabel, "Watched search terms");
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankMovementMonitorTitle,
    "Movement watch",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankMonthlySearchesLabel,
    "Monthly searches",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.rankOwnedSpotHeader, "Your Google spot");
  assert.equal(PRODUCT_BEGINNER_COPY.rankPositionTitle, "Add Google position");
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankPositionYourSiteHint,
    "Leave blank for your website",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankReadyDetail,
    "Google spots are ready, so focus on the best search terms near page one.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankReadyLabel,
    "Improve page-one chances",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankStatusWaiting,
    "Waiting for Google spots",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.rankTableTermHeader, "Search term");
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankPlanHeading,
    "Know which search term needs attention next.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.rankPlanTitle, "Rank movement plan");
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankRecoverDetail,
    "Review the search terms that dropped and decide whether a page needs a content refresh.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankDistributionIntro,
    "Latest Google spots grouped for quick website scanning.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankDistributionTitle,
    "Google spot groups",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.rankSaveDetailsAction, "Save details");
  assert.equal(PRODUCT_BEGINNER_COPY.rankSavePositionAction, "Save position");
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankStableDetail,
    "No watched search-term drops are showing right now.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.rankTermExample, "best website help");
  assert.equal(PRODUCT_BEGINNER_COPY.rankTermFieldLabel, "Search term");
  assert.equal(PRODUCT_BEGINNER_COPY.rankTrackTermTitle, "Watch search term");
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankTopThreeHelp,
    "Latest owned spots in the top three organic results.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankTopTenHelp,
    "Latest owned spots in the top ten organic results.",
  );
  assert.equal(PRODUCT_BEGINNER_COPY.rankChooseWebsiteOption, "Choose website");
  assert.equal(PRODUCT_BEGINNER_COPY.rankKeywordWebsiteHeader, "Website");
  assert.equal(PRODUCT_BEGINNER_COPY.rankWebsiteFilterLabel, "Website");
  assert.equal(
    PRODUCT_BEGINNER_COPY.rankWebsiteScopeNote,
    "Rank movement keeps owned and competitor positions focused on this website.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.recommendationsIntro,
    "Create simple page copy ideas and clear fix notes without needing technical wording or prompt writing.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasContentGapHelp,
    "Search terms with impressions but weak clicks or rankings.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasCompetitorGapEmpty,
    "Add competitors and Google spots in Rank Movement to reveal search terms they win.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasCompetitorGapIntro,
    "Watched search terms where another page is ahead and yours may need a clearer answer.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasDetailEmpty,
    "No Search Console search terms match this view.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasDetailIntro,
    "Imported search terms kept for optional deeper review.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasDemandEmpty,
    "Connect Google Search Console search-term data to show what people want most.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasFilterTitle,
    "Adjust search idea filters",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasHiddenTermsNote,
    "more search terms are available through filters or exported reporting.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasMetricOpportunityHelp,
    "High-demand search ideas found from current and declining search terms.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasNoOpportunity,
    "No search ideas match this view yet. Try a wider date range or website filter.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasPlanIntro,
    "Pick one useful search idea, create a simple brief, then compare pages only when it helps. Deeper search-term detail is optional.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasSetupDetail,
    "Connect Google Search Console so search ideas come from real searches instead of guesswork.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasSetupTitle,
    "Connect search data",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasTrackTermsTitle,
    "Choose search terms to watch",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasImproveTitle,
    "Pick one search idea to improve",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasVisibilityHelp,
    "How visible the selected website is across these search terms.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasSearchTermGroupsHelp,
    "Unique search-term groups with imported Search Console metrics.",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasSearchTermsLabel,
    "Search terms",
  );
  assert.equal(
    PRODUCT_BEGINNER_COPY.searchIdeasWorkspaceNote,
    "Search ideas use imported Google Search Console search-term data.",
  );
  assert.doesNotMatch(
    Object.values(PRODUCT_BEGINNER_COPY).join(" "),
    /SEO dashboard|everyday SEO work|SEO operations|SEO jargon|SEO Teammate|raw audit detail|SEO checks|first SEO check|SEO plan|SEO term|compare projects|project list|scoped to this project|by project and keyword|by website and keyword|Choose project|Go to Projects|Loading projects|\bsite health value\b|\bSite health is\b|page-link problems|Page links plan|deeper SEO fields|Track keywords|Deeper query data|Search Console queries|more queries are available|Unique query groups|declining queries|Queries with impressions|tracked keywords|Track keyword|Add keyword|Choose keyword|More keyword detail|Optional keyword inventory|No tracked keywords|more keywords are hidden|seo audit software|which keywords moved|keywords that already have movement|keyword drops|which keyword needs attention|Active and paused keywords|ranking positions in the top|tracked keywords with rank data|with rank data|average search position|Organic impressions from imported Search Console metrics|Distinct queries found|Query and page demand|Competitor rank gaps|Record competitor ranks|deeper rank review|\bRanks\b|Record rank|Save rank|Import metric|Save metric|Owned rank|Leave blank for owned rank|\bVolume\b|\bDifficulty\b|Adjust rank view|Needs rank data|Fill missing rank data|need ranks|Waiting for ranks|Rank distribution|Latest owned positions|Movement monitor|\bKeyword\b|keyword opportunities|Adjust keyword filters|Import keyword data|Choose keywords to watch|Pick one keyword to improve|keyword ideas come from|Rank Tracking to reveal|Tracked keywords where|Organic visibility for the selected keyword set|Search Console visibility/,
  );
});
