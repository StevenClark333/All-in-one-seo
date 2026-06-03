import { Download, PlugZap } from "lucide-react";
import {
  connectAutomationIntegrationAction,
  connectNetlifyIntegrationAction,
  connectSlackIntegrationAction,
  connectVercelIntegrationAction,
  connectWordPressReceiverAction,
  createIntegrationAction,
  importGoogleAnalyticsMetricsAction,
  importGoogleSearchConsoleMetricsAction,
  mapGoogleAnalyticsPropertyAction,
  mapGoogleSearchConsolePropertyAction,
  mapWebflowSiteAction,
  testWordPressReceiverAction,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { readAutomationIntegrationConfig } from "@/lib/automation-integrations";
import { readDeploymentIntegrationConfig } from "@/lib/deployment-checks";
import { readGaProperties } from "@/lib/google-analytics";
import { findMatchingGscSite, readGscSites } from "@/lib/google-search-console";
import { getIntegrationSettingsData } from "@/lib/management-queries";
import { readSlackIntegrationConfig } from "@/lib/slack";
import { readShopifyShop } from "@/lib/shopify";
import { findMatchingWebflowSite, readWebflowSites } from "@/lib/webflow";
import {
  buildWordPressInstallValues,
  buildWordPressOnboardingSteps,
  readWordPressReceiverConfig,
} from "@/lib/wordpress";

export const dynamic = "force-dynamic";

type IntegrationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const providers = [
  "GOOGLE_SEARCH_CONSOLE",
  "GOOGLE_ANALYTICS",
  "WORDPRESS",
  "SHOPIFY",
  "WEBFLOW",
  "SLACK",
  "VERCEL",
  "NETLIFY",
  "ZAPIER",
  "MAKE",
];

const statuses = ["PLANNED", "CONNECTED", "NEEDS_AUTH", "ERROR"];

export default async function IntegrationsPage({
  searchParams,
}: IntegrationsPageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedDomainId = getSingle(params.domainId);
  const { workspace, clients, domains, integrations, deploymentChecks } =
    await getIntegrationSettingsData();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const wordpressPluginDownloadPath = "/downloads/all-in-one-seo-wordpress.zip";
  const wordpressPluginDownloadUrl = `${appUrl}${wordpressPluginDownloadPath}`;
  const searchConsoleIntegration = integrations.find(
    (integration) => integration.provider === "GOOGLE_SEARCH_CONSOLE",
  );
  const searchConsoleSites = searchConsoleIntegration
    ? readGscSites(searchConsoleIntegration.configJson)
    : [];
  const mappedSearchConsoleProperties = integrations.filter(
    (integration) => integration.provider === "GOOGLE_SEARCH_CONSOLE_PROPERTY",
  );
  const analyticsIntegration = integrations.find(
    (integration) => integration.provider === "GOOGLE_ANALYTICS",
  );
  const analyticsProperties = analyticsIntegration
    ? readGaProperties(analyticsIntegration.configJson)
    : [];
  const mappedAnalyticsProperties = integrations.filter(
    (integration) => integration.provider === "GOOGLE_ANALYTICS_PROPERTY",
  );
  const wordpressDomains = domains.filter(
    (domain) => domain.platform === "WORDPRESS",
  );
  const wordpressReceiverIntegrations = integrations.filter(
    (integration) => integration.provider === "WORDPRESS_RECEIVER",
  );
  const shopifyIntegrations = integrations.filter(
    (integration) => integration.provider === "SHOPIFY",
  );
  const webflowIntegration = integrations.find(
    (integration) => integration.provider === "WEBFLOW",
  );
  const webflowSites = webflowIntegration
    ? readWebflowSites(webflowIntegration.configJson)
    : [];
  const mappedWebflowSites = integrations.filter(
    (integration) => integration.provider === "WEBFLOW_SITE",
  );
  const slackIntegration = integrations.find(
    (integration) => integration.provider === "SLACK",
  );
  const slackConfig = readSlackIntegrationConfig(slackIntegration?.configJson);
  const vercelIntegrations = integrations.filter(
    (integration) => integration.provider === "VERCEL",
  );
  const netlifyIntegrations = integrations.filter(
    (integration) => integration.provider === "NETLIFY",
  );
  const automationIntegrations = integrations.filter((integration) =>
    ["ZAPIER", "MAKE"].includes(integration.provider),
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Integrations" activeDomainId={selectedDomainId} />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Integrations
              </h2>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <PlugZap className="size-4" aria-hidden="true" />
              {integrations.length} configured
              <InfoTooltip
                label="Connected or planned provider records in this workspace."
                passive
                side="left"
              />
            </div>
          </header>

          <ProjectWorkspaceBar
            active="integrations"
            domainId={selectedDomainId}
            note="Integration setup and receiver values are being viewed from this domain workspace."
            returnPath="/integrations"
          />

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <PlugZap className="size-5 text-slate-500" aria-hidden="true" />
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Create a provider record before OAuth mapping, plugin install, or webhook configuration.">
                  Add integration
                </HelpLabel>
              </h3>
            </div>

            <form
              action={createIntegrationAction}
              className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-4"
            >
              <Select
                help="External system or channel this portal should connect to."
                label="Provider"
                name="provider"
              >
                {providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {formatEnum(provider)}
                  </option>
                ))}
              </Select>
              <Select
                help="Current setup state for this integration."
                label="Status"
                name="status"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {formatEnum(status)}
                  </option>
                ))}
              </Select>
              <Select
                help="Attach this provider to one client, or keep it workspace-wide."
                label="Client"
                name="clientId"
              >
                <option value="">Workspace-wide</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
              <Select
                help="Attach this provider to one monitored domain."
                label="Domain"
                name="domainId"
                defaultValue={selectedDomainId ?? ""}
              >
                <option value="">All domains</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </Select>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Notes
                </span>
                <input
                  name="notes"
                  placeholder="Property ID, install notes, or next auth step"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <div className="md:col-span-2 2xl:col-span-4">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Save integration
                  <InfoTooltip
                    label="Save the provider setup record so it can be mapped or completed later."
                    passive
                    side="left"
                  />
                </button>
              </div>
            </form>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="Import owned Search Console properties and map them to monitored domains for query and page demand data.">
                    Google Search Console
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Connect OAuth, import verified Search Console properties, and
                  map them to monitored domains.
                </p>
              </div>
              <a
                href="/api/integrations/google-search-console/start"
                className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Connect Google
                <InfoTooltip
                  label="Start Google OAuth and import accessible Search Console sites."
                  passive
                  side="left"
                />
              </a>
            </div>

            <div className="grid gap-5 p-5">
              {searchConsoleIntegration ? (
                <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                  <Meta
                    label="Status"
                    value={formatEnum(searchConsoleIntegration.status)}
                  />
                  <Meta
                    label="Imported sites"
                    value={searchConsoleSites.length}
                  />
                  <Meta
                    label="Mapped domains"
                    value={mappedSearchConsoleProperties.length}
                  />
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Google Search Console is not connected yet.
                </div>
              )}

              {searchConsoleSites.length ? (
                <div className="grid divide-y divide-slate-100 rounded-md border border-slate-200">
                  {searchConsoleSites.map((site) => {
                    const suggestedDomain = domains.find(
                      (domain) =>
                        findMatchingGscSite(domain.domain, [site])?.siteUrl ===
                        site.siteUrl,
                    );

                    return (
                      <article
                        key={site.siteUrl}
                        className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_160px_260px]"
                      >
                        <div>
                          <p className="font-semibold">{site.siteUrl}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatEnum(site.permissionLevel || "unknown")}
                          </p>
                        </div>
                        <Meta
                          label="Suggested"
                          value={suggestedDomain?.domain ?? "Manual map"}
                        />
                        <form
                          action={mapGoogleSearchConsolePropertyAction}
                          className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <input
                            type="hidden"
                            name="propertyUrl"
                            value={site.siteUrl}
                          />
                          <select
                            name="domainId"
                            defaultValue={suggestedDomain?.id ?? ""}
                            required
                            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                          >
                            <option value="" disabled>
                              Select domain
                            </option>
                            {domains.map((domain) => (
                              <option key={domain.id} value={domain.id}>
                                {domain.domain}
                              </option>
                            ))}
                          </select>
                          <button className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                            Map
                          </button>
                        </form>
                      </article>
                    );
                  })}
                </div>
              ) : null}

              {mappedSearchConsoleProperties.length ? (
                <div className="grid gap-3 rounded-md border border-slate-200 p-4">
                  <h4 className="font-semibold">Mapped properties</h4>
                  <div className="grid divide-y divide-slate-100">
                    {mappedSearchConsoleProperties.map((integration) => (
                      <article
                        key={integration.id}
                        className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_160px_auto]"
                      >
                        <div>
                          <p className="font-semibold">
                            {integration.domain?.domain ?? "Domain"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {readConfigString(
                              integration.configJson,
                              "propertyUrl",
                            )}
                          </p>
                        </div>
                        <Meta
                          label="Status"
                          value={formatEnum(integration.status)}
                        />
                        {integration.domainId ? (
                          <form action={importGoogleSearchConsoleMetricsAction}>
                            <input
                              type="hidden"
                              name="domainId"
                              value={integration.domainId}
                            />
                            <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                              Import metrics
                            </button>
                          </form>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="Import GA4 properties and traffic metrics to enrich SEO reporting and prioritization.">
                    Google Analytics
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Connect GA4, import accessible properties, map them to
                  domains, and pull traffic metrics.
                </p>
              </div>
              <a
                href="/api/integrations/google-analytics/start"
                className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Connect Google Analytics
              </a>
            </div>

            <div className="grid gap-5 p-5">
              {analyticsIntegration ? (
                <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                  <Meta
                    label="Status"
                    value={formatEnum(analyticsIntegration.status)}
                  />
                  <Meta
                    label="Imported properties"
                    value={analyticsProperties.length}
                  />
                  <Meta
                    label="Mapped domains"
                    value={mappedAnalyticsProperties.length}
                  />
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Google Analytics is not connected yet.
                </div>
              )}

              {analyticsProperties.length ? (
                <div className="grid divide-y divide-slate-100 rounded-md border border-slate-200">
                  {analyticsProperties.map((property) => (
                    <article
                      key={property.property}
                      className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_180px_260px]"
                    >
                      <div>
                        <p className="font-semibold">{property.displayName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {property.accountDisplayName} - {property.property}
                        </p>
                      </div>
                      <Meta label="Source" value="GA4 property" />
                      <form
                        action={mapGoogleAnalyticsPropertyAction}
                        className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <input
                          type="hidden"
                          name="property"
                          value={property.property}
                        />
                        <select
                          name="domainId"
                          required
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                        >
                          <option value="" disabled>
                            Select domain
                          </option>
                          {domains.map((domain) => (
                            <option key={domain.id} value={domain.id}>
                              {domain.domain}
                            </option>
                          ))}
                        </select>
                        <button className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                          Map
                        </button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : null}

              {mappedAnalyticsProperties.length ? (
                <div className="grid gap-3 rounded-md border border-slate-200 p-4">
                  <h4 className="font-semibold">Mapped Analytics properties</h4>
                  <div className="grid divide-y divide-slate-100">
                    {mappedAnalyticsProperties.map((integration) => (
                      <article
                        key={integration.id}
                        className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_160px_auto]"
                      >
                        <div>
                          <p className="font-semibold">
                            {integration.domain?.domain ?? "Domain"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {readConfigString(
                              integration.configJson,
                              "property",
                            )}
                          </p>
                        </div>
                        <Meta
                          label="Status"
                          value={formatEnum(integration.status)}
                        />
                        {integration.domainId ? (
                          <form action={importGoogleAnalyticsMetricsAction}>
                            <input
                              type="hidden"
                              name="domainId"
                              value={integration.domainId}
                            />
                            <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                              Import metrics
                            </button>
                          </form>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Install the WordPress package to inject the monitoring script through WordPress APIs.">
                  WordPress plugin
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Install the All In One SEO plugin on WordPress client sites to
                load the monitoring script without editing theme files.
              </p>
            </div>

            <div className="grid gap-5 p-5">
              <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                <Meta
                  help="Installable WordPress plugin ZIP served from this portal."
                  label="Plugin package"
                  value={
                    <a
                      className="inline-flex items-center gap-2 text-slate-950 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-950"
                      href={wordpressPluginDownloadPath}
                    >
                      all-in-one-seo-wordpress.zip
                    </a>
                  }
                />
                <Meta label="App URL" value={appUrl} />
                <Meta
                  label="Eligible domains"
                  value={wordpressDomains.length}
                />
              </div>

              <div className="grid gap-4 rounded-md border border-slate-200 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div>
                  <p className="font-semibold">Download the WordPress plugin</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Upload this ZIP in WordPress admin under Plugins &gt; Add
                    Plugin &gt; Upload Plugin, then save the App URL, Site ID,
                    and Receiver API key below.
                  </p>
                  <p className="mt-2 break-all rounded-md bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
                    {wordpressPluginDownloadUrl}
                  </p>
                </div>
                <a
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
                  download
                  href={wordpressPluginDownloadPath}
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download plugin
                  <InfoTooltip
                    label="Download the installable WordPress ZIP for client sites."
                    passive
                    side="left"
                  />
                </a>
              </div>

              {wordpressDomains.length ? (
                <div className="grid divide-y divide-slate-100 rounded-md border border-slate-200">
                  {wordpressDomains.map((domain) => {
                    const receiverIntegration =
                      wordpressReceiverIntegrations.find(
                        (integration) => integration.domainId === domain.id,
                      );
                    const receiverConfig = readWordPressReceiverConfig(
                      receiverIntegration?.configJson,
                    );
                    const onboardingSteps = buildWordPressOnboardingSteps({
                      lastTestMessage: receiverConfig.lastTestMessage,
                      lastTestStatus: receiverConfig.lastTestStatus,
                      receiverKey: receiverConfig.receiverKey,
                      receiverUrl: receiverConfig.receiverUrl,
                      scriptStatus: domain.scriptStatus,
                    });
                    const installValues = buildWordPressInstallValues({
                      appUrl,
                      domain: domain.domain,
                      receiverKey: receiverConfig.receiverKey,
                      receiverUrl: receiverConfig.receiverUrl,
                      siteId: domain.id,
                    });

                    return (
                      <article key={domain.id} className="grid gap-4 p-4">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_180px_180px]">
                          <div>
                            <p className="font-semibold">{domain.domain}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              Enter this Site ID in Settings &gt; All In One SEO
                              after activating the plugin.
                            </p>
                          </div>
                          <Meta label="Site ID" value={domain.id} />
                          <Meta
                            label="Script"
                            value={formatEnum(domain.scriptStatus)}
                          />
                          <Meta
                            label="Fix receiver"
                            value={
                              receiverIntegration
                                ? formatEnum(receiverIntegration.status)
                                : "Not connected"
                            }
                          />
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              Values to paste into WordPress
                            </p>
                            <InfoTooltip
                              label="Use these exact values in the WordPress plugin settings for this domain."
                              passive
                              side="right"
                            />
                          </div>
                          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {installValues.map((item) => (
                              <div
                                key={item.label}
                                className="min-w-0 rounded-md border border-slate-200 bg-white p-3"
                              >
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    {item.label}
                                  </p>
                                  <InfoTooltip
                                    label={item.help}
                                    passive
                                    side="right"
                                  />
                                </div>
                                <code className="mt-2 block break-all rounded-md bg-slate-50 px-3 py-2 font-mono text-xs leading-5 text-slate-700">
                                  {item.value}
                                </code>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                          <Meta
                            help="Paste this value into the Receiver API key field inside the WordPress plugin settings."
                            label="Generated receiver key"
                            value={
                              receiverConfig.receiverKey ? (
                                <code className="block break-all rounded-md bg-white px-3 py-2 font-mono text-xs text-slate-700">
                                  {receiverConfig.receiverKey}
                                </code>
                              ) : (
                                "Generated when receiver is saved"
                              )
                            }
                          />
                          <div className="grid gap-3">
                            <Meta
                              help="The plugin sends applied-fix callbacks to this portal after a WordPress admin applies a fix."
                              label="Callback"
                              value={`${appUrl}/api/integrations/wordpress/link-fix-status`}
                            />
                            {receiverIntegration ? (
                              <form action={testWordPressReceiverAction}>
                                <input
                                  type="hidden"
                                  name="integrationId"
                                  value={receiverIntegration.id}
                                />
                                <button className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                                  Test receiver
                                  <InfoTooltip
                                    label="Send a harmless signed test event to the WordPress receiver endpoint."
                                    passive
                                    side="left"
                                  />
                                </button>
                              </form>
                            ) : null}
                          </div>
                          <Meta
                            help="Latest portal-side test of the WordPress receiver endpoint and API key."
                            label="Last receiver test"
                            value={
                              receiverConfig.lastTestStatus ? (
                                <span
                                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getReceiverTestClass(
                                    receiverConfig.lastTestStatus,
                                  )}`}
                                >
                                  {formatEnum(receiverConfig.lastTestStatus)}
                                  {receiverConfig.lastTestStatusCode
                                    ? ` - HTTP ${receiverConfig.lastTestStatusCode}`
                                    : ""}
                                </span>
                              ) : (
                                "Not tested"
                              )
                            }
                          />
                          <Meta
                            label="Test detail"
                            value={
                              receiverConfig.lastTestMessage ||
                              "Run a receiver test after saving endpoint and key."
                            }
                          />
                        </div>
                        <div className="rounded-md border border-slate-200 bg-white p-3">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              WordPress setup checklist
                            </p>
                            <InfoTooltip
                              label="Tracks the setup signals needed before this WordPress domain can receive fixes from Fix Center."
                              passive
                              side="right"
                            />
                          </div>
                          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {onboardingSteps.map((step) => (
                              <div
                                key={step.label}
                                className="rounded-md border border-slate-200 bg-slate-50 p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-sm font-semibold text-slate-800">
                                    {step.label}
                                  </p>
                                  <span
                                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getOnboardingStepClass(
                                      step.status,
                                    )}`}
                                  >
                                    {formatEnum(step.status)}
                                  </span>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                  {step.detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <form
                          action={connectWordPressReceiverAction}
                          className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)_auto]"
                        >
                          <input
                            type="hidden"
                            name="domainId"
                            value={domain.id}
                          />
                          <label className="grid gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                              Receiver endpoint
                            </span>
                            <input
                              name="receiverUrl"
                              type="url"
                              defaultValue={receiverConfig.receiverUrl}
                              placeholder={`https://${domain.domain}/wp-json/all-in-one-seo/v1/link-fixes`}
                              className="h-10 min-w-0 rounded-md border border-slate-200 px-3 text-sm"
                              required
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                              Receiver API key
                            </span>
                            <input
                              name="receiverKey"
                              type="password"
                              placeholder={
                                receiverIntegration
                                  ? "Leave blank to keep current key"
                                  : "Leave blank to generate a key"
                              }
                              className="h-10 min-w-0 rounded-md border border-slate-200 px-3 text-sm"
                            />
                          </label>
                          <button className="inline-flex h-10 items-center justify-center self-end rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                            Save receiver
                          </button>
                        </form>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No WordPress domains are configured yet. Set a domain platform
                  to WordPress to show plugin install values here.
                </div>
              )}

              <div className="rounded-md border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                Upload the plugin ZIP through WordPress admin or copy the{" "}
                <span className="font-medium">all-in-one-seo</span> folder to{" "}
                <span className="font-medium">wp-content/plugins</span>. After
                activation, save the App URL and Site ID from this panel. Full
                install notes live in{" "}
                <span className="font-medium">docs/WORDPRESS_PLUGIN.md</span>.
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Connect Shopify shops so storefront domains can be mapped to monitoring and deployment signals.">
                  Shopify app
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Start Shopify OAuth, connect a store, and optionally map it to a
                monitored domain for commerce-site SEO workflows.
              </p>
            </div>

            <div className="grid gap-5 p-5">
              <form
                action="/api/integrations/shopify/start"
                className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_1fr_auto]"
              >
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Store
                  </span>
                  <input
                    name="shop"
                    placeholder="client-store.myshopify.com"
                    required
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <Select label="Domain" name="domainId">
                  <option value="">Map later</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.domain}
                    </option>
                  ))}
                </Select>
                <div className="flex items-end">
                  <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                    Connect Shopify
                  </button>
                </div>
              </form>

              <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                <Meta
                  label="Callback URL"
                  value={`${appUrl}/api/integrations/shopify/callback`}
                />
                <Meta
                  label="Requested scopes"
                  value="read_content, read_products"
                />
                <Meta
                  label="Connected stores"
                  value={shopifyIntegrations.length}
                />
              </div>

              {shopifyIntegrations.length ? (
                <div className="grid divide-y divide-slate-100 rounded-md border border-slate-200">
                  {shopifyIntegrations.map((integration) => (
                    <article
                      key={integration.id}
                      className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px]"
                    >
                      <div>
                        <p className="font-semibold">
                          {readShopifyShop(integration.configJson)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {integration.domain?.domain ??
                            "Not mapped to a domain"}
                        </p>
                      </div>
                      <Meta
                        label="Status"
                        value={formatEnum(integration.status)}
                      />
                      <Meta
                        label="Connected"
                        value={integration.createdAt.toLocaleDateString()}
                      />
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No Shopify stores connected yet.
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="Connect Webflow, import sites, and map custom domains to monitored domains.">
                    Webflow integration
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Connect Webflow OAuth, import accessible sites, and map custom
                  domains to monitored All In One SEO domains.
                </p>
              </div>
              <a
                href="/api/integrations/webflow/start"
                className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Connect Webflow
              </a>
            </div>

            <div className="grid gap-5 p-5">
              {webflowIntegration ? (
                <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                  <Meta
                    label="Status"
                    value={formatEnum(webflowIntegration.status)}
                  />
                  <Meta label="Imported sites" value={webflowSites.length} />
                  <Meta
                    label="Mapped domains"
                    value={mappedWebflowSites.length}
                  />
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Webflow is not connected yet.
                </div>
              )}

              {webflowSites.length ? (
                <div className="grid divide-y divide-slate-100 rounded-md border border-slate-200">
                  {webflowSites.map((site) => {
                    const suggestedDomain = domains.find(
                      (domain) =>
                        findMatchingWebflowSite(domain.domain, [site])?.id ===
                        site.id,
                    );

                    return (
                      <article
                        key={site.id}
                        className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_180px_260px]"
                      >
                        <div>
                          <p className="font-semibold">{site.displayName}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {site.customDomains
                              .map((domain) => domain.url)
                              .join(", ") ||
                              site.shortName ||
                              site.id}
                          </p>
                        </div>
                        <Meta
                          label="Suggested"
                          value={suggestedDomain?.domain ?? "Manual map"}
                        />
                        <form
                          action={mapWebflowSiteAction}
                          className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <input type="hidden" name="siteId" value={site.id} />
                          <select
                            name="domainId"
                            defaultValue={suggestedDomain?.id ?? ""}
                            required
                            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                          >
                            <option value="" disabled>
                              Select domain
                            </option>
                            {domains.map((domain) => (
                              <option key={domain.id} value={domain.id}>
                                {domain.domain}
                              </option>
                            ))}
                          </select>
                          <button className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                            Map
                          </button>
                        </form>
                      </article>
                    );
                  })}
                </div>
              ) : null}

              {mappedWebflowSites.length ? (
                <div className="grid gap-3 rounded-md border border-slate-200 p-4">
                  <h4 className="font-semibold">Mapped Webflow sites</h4>
                  <div className="grid divide-y divide-slate-100">
                    {mappedWebflowSites.map((integration) => (
                      <article
                        key={integration.id}
                        className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_160px]"
                      >
                        <div>
                          <p className="font-semibold">
                            {integration.domain?.domain ?? "Domain"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {readConfigString(integration.configJson, "siteId")}
                          </p>
                        </div>
                        <Meta
                          label="Status"
                          value={formatEnum(integration.status)}
                        />
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Send alert notifications to Slack channels through an incoming webhook.">
                  Slack integration
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Configure a workspace Slack incoming webhook once and reuse it
                as the default destination for Slack alert rules.
              </p>
            </div>

            <div className="grid gap-5 p-5">
              <form
                action={connectSlackIntegrationAction}
                className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"
              >
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Channel
                  </span>
                  <input
                    name="channelName"
                    placeholder="#seo-alerts"
                    defaultValue={slackConfig.channelName}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Incoming webhook URL
                  </span>
                  <input
                    name="webhookUrl"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    required
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <div className="flex items-end">
                  <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                    Save Slack
                  </button>
                </div>
              </form>

              <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                <Meta
                  label="Status"
                  value={
                    slackIntegration
                      ? formatEnum(slackIntegration.status)
                      : "Not connected"
                  }
                />
                <Meta
                  label="Channel"
                  value={slackConfig.channelName || "Not configured"}
                />
                <Meta
                  label="Fallback behavior"
                  value="Used when Slack alert rule URL is empty"
                />
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                Vercel deployment checks
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Register Vercel project webhooks, verify signatures, record
                deployment events, and queue production recrawls automatically.
              </p>
            </div>

            <div className="grid gap-5 p-5">
              <form
                action={connectVercelIntegrationAction}
                className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Project ID
                  </span>
                  <input
                    name="projectId"
                    placeholder="prj_..."
                    required
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Project name
                  </span>
                  <input
                    name="projectName"
                    placeholder="marketing-site"
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Webhook secret
                  </span>
                  <input
                    name="webhookSecret"
                    placeholder="Paste Vercel secret or leave blank"
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <Select label="Domain" name="domainId">
                  <option value="">Map later</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.domain}
                    </option>
                  ))}
                </Select>
                <div className="flex items-end">
                  <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                    Save Vercel
                  </button>
                </div>
              </form>

              <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                <Meta
                  label="Webhook URL"
                  value={`${appUrl}/api/integrations/vercel/webhook`}
                />
                <Meta
                  label="Configured projects"
                  value={vercelIntegrations.length}
                />
                <Meta
                  label="Recent checks"
                  value={
                    deploymentChecks.filter(
                      (check) => check.provider === "VERCEL",
                    ).length
                  }
                />
              </div>

              {vercelIntegrations.length ? (
                <div className="grid divide-y divide-slate-100 rounded-md border border-slate-200">
                  {vercelIntegrations.map((integration) => {
                    const config = readDeploymentIntegrationConfig(
                      integration.configJson,
                    );

                    return (
                      <article
                        key={integration.id}
                        className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px]"
                      >
                        <div>
                          <p className="font-semibold">
                            {config.projectName || config.projectId}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {integration.domain?.domain ??
                              "Not mapped to a domain"}
                          </p>
                        </div>
                        <Meta label="Project ID" value={config.projectId} />
                        <Meta
                          label="Status"
                          value={formatEnum(integration.status)}
                        />
                      </article>
                    );
                  })}
                </div>
              ) : null}

              {deploymentChecks.some((check) => check.provider === "VERCEL") ? (
                <div className="grid gap-3 rounded-md border border-slate-200 p-4">
                  <h4 className="font-semibold">Recent Vercel checks</h4>
                  <div className="grid divide-y divide-slate-100">
                    {deploymentChecks
                      .filter((check) => check.provider === "VERCEL")
                      .map((check) => (
                        <article
                          key={check.id}
                          className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_140px_160px]"
                        >
                          <div>
                            <p className="font-semibold">
                              {check.projectName ?? check.projectId ?? "Vercel"}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {check.deploymentUrl ?? "No deployment URL"}
                            </p>
                          </div>
                          <Meta label="Status" value={check.status} />
                          <Meta
                            label="Domain"
                            value={check.domain?.domain ?? "Unmapped"}
                          />
                        </article>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                Netlify deployment checks
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Register Netlify deploy notification webhooks, verify JWS
                signatures, record deploy states, and queue production recrawls.
              </p>
            </div>

            <div className="grid gap-5 p-5">
              <form
                action={connectNetlifyIntegrationAction}
                className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Site ID
                  </span>
                  <input
                    name="siteId"
                    placeholder="netlify-site-id"
                    required
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Site name
                  </span>
                  <input
                    name="siteName"
                    placeholder="marketing-site"
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    JWS secret
                  </span>
                  <input
                    name="webhookSecret"
                    placeholder="Paste Netlify JWS secret or leave blank"
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <Select label="Domain" name="domainId">
                  <option value="">Map later</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.domain}
                    </option>
                  ))}
                </Select>
                <div className="flex items-end">
                  <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                    Save Netlify
                  </button>
                </div>
              </form>

              <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                <Meta
                  label="Webhook URL"
                  value={`${appUrl}/api/integrations/netlify/webhook`}
                />
                <Meta
                  label="Configured sites"
                  value={netlifyIntegrations.length}
                />
                <Meta
                  label="Recent checks"
                  value={
                    deploymentChecks.filter(
                      (check) => check.provider === "NETLIFY",
                    ).length
                  }
                />
              </div>

              {netlifyIntegrations.length ? (
                <div className="grid divide-y divide-slate-100 rounded-md border border-slate-200">
                  {netlifyIntegrations.map((integration) => {
                    const config = readDeploymentIntegrationConfig(
                      integration.configJson,
                    );

                    return (
                      <article
                        key={integration.id}
                        className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px]"
                      >
                        <div>
                          <p className="font-semibold">
                            {config.siteName || config.siteId}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {integration.domain?.domain ??
                              "Not mapped to a domain"}
                          </p>
                        </div>
                        <Meta label="Site ID" value={config.siteId} />
                        <Meta
                          label="Status"
                          value={formatEnum(integration.status)}
                        />
                      </article>
                    );
                  })}
                </div>
              ) : null}

              {deploymentChecks.some(
                (check) => check.provider === "NETLIFY",
              ) ? (
                <div className="grid gap-3 rounded-md border border-slate-200 p-4">
                  <h4 className="font-semibold">Recent Netlify checks</h4>
                  <div className="grid divide-y divide-slate-100">
                    {deploymentChecks
                      .filter((check) => check.provider === "NETLIFY")
                      .map((check) => (
                        <article
                          key={check.id}
                          className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_140px_160px]"
                        >
                          <div>
                            <p className="font-semibold">
                              {check.projectName ??
                                check.projectId ??
                                "Netlify"}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {check.deploymentUrl ?? "No deployment URL"}
                            </p>
                          </div>
                          <Meta label="Status" value={check.status} />
                          <Meta
                            label="Domain"
                            value={check.domain?.domain ?? "Unmapped"}
                          />
                        </article>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Forward SEO events to automation platforms through webhook URLs.">
                  Zapier and Make
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Connect no-code automation catch hooks for routing SEO events,
                deployment checks, and client workflow notifications.
              </p>
            </div>

            <div className="grid gap-5 p-5">
              <form
                action={connectAutomationIntegrationAction}
                className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2 2xl:grid-cols-[160px_minmax(0,1fr)_minmax(0,2fr)_auto]"
              >
                <Select label="Provider" name="provider">
                  <option value="ZAPIER">Zapier</option>
                  <option value="MAKE">Make</option>
                </Select>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Label
                  </span>
                  <input
                    name="label"
                    placeholder="Client handoff workflow"
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Webhook URL
                  </span>
                  <input
                    name="webhookUrl"
                    type="url"
                    placeholder="https://hooks.zapier.com/hooks/catch/... or https://hook.us1.make.com/..."
                    required
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <div className="flex items-end">
                  <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                    Save webhook
                  </button>
                </div>
              </form>

              {automationIntegrations.length ? (
                <div className="grid divide-y divide-slate-100 rounded-md border border-slate-200">
                  {automationIntegrations.map((integration) => {
                    const config = readAutomationIntegrationConfig(
                      integration.configJson,
                    );

                    return (
                      <article
                        key={integration.id}
                        className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_160px_160px]"
                      >
                        <div>
                          <p className="font-semibold">
                            {config.label || formatEnum(integration.provider)}
                          </p>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {config.webhookUrl}
                          </p>
                        </div>
                        <Meta
                          label="Provider"
                          value={formatEnum(integration.provider)}
                        />
                        <Meta
                          label="Status"
                          value={formatEnum(integration.status)}
                        />
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No Zapier or Make webhooks connected yet.
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="All provider records currently saved for this workspace, client, or domain.">
                  Configured integrations
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Connection records for analytics, search, CMS, alerting, and
                deployment providers.
              </p>
            </div>

            <div className="grid divide-y divide-slate-100">
              {integrations.length ? (
                integrations.map((integration) => (
                  <article
                    key={integration.id}
                    className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_150px_150px_140px]"
                  >
                    <div>
                      <p className="font-semibold">
                        {formatEnum(integration.provider)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {integration.client?.name ??
                          integration.domain?.domain ??
                          "Workspace-wide"}
                      </p>
                    </div>
                    <Meta
                      label="Status"
                      value={formatEnum(integration.status)}
                    />
                    <Meta
                      label="Domain"
                      value={integration.domain?.domain ?? "All domains"}
                    />
                    <Meta
                      label="Created"
                      value={integration.createdAt.toLocaleDateString()}
                    />
                  </article>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No integrations configured yet.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Select({
  children,
  defaultValue,
  help,
  label,
  name,
}: {
  children: React.ReactNode;
  defaultValue?: string;
  help?: string;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {help ? <HelpLabel help={help}>{label}</HelpLabel> : label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
      >
        {children}
      </select>
    </label>
  );
}

function Meta({
  help,
  label,
  value,
}: {
  help?: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {help ? <HelpLabel help={help}>{label}</HelpLabel> : label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function readConfigString(value: unknown, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const item = (value as Record<string, unknown>)[key];

  return typeof item === "string" ? item : "";
}

function getReceiverTestClass(status: string) {
  if (status === "PASSED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "FAILED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function getOnboardingStepClass(status: string) {
  if (status === "COMPLETE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "READY") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (status === "WARNING") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-white text-slate-600";
}
