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
import { PRODUCT_CONNECTION_COPY } from "@/lib/product-copy";
import { readSlackIntegrationConfig } from "@/lib/slack";
import { readShopifyShop } from "@/lib/shopify";
import { findMatchingWebflowSite, readWebflowSites } from "@/lib/webflow";
import {
  buildWordPressInstallValues,
  buildWordPressOnboardingSteps,
  formatWordPressConnectionMessage,
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
                Connections
              </h2>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <PlugZap className="size-4" aria-hidden="true" />
              {integrations.length} set up
              <InfoTooltip
                label="Tools and website platforms already saved for this workspace."
                passive
                side="left"
              />
            </div>
          </header>

          <IntegrationPlan
            analyticsCount={
              mappedSearchConsoleProperties.length +
              mappedAnalyticsProperties.length
            }
            automationCount={
              Number(Boolean(slackIntegration)) +
              vercelIntegrations.length +
              netlifyIntegrations.length +
              automationIntegrations.length
            }
            cmsCount={
              wordpressReceiverIntegrations.length +
              shopifyIntegrations.length +
              mappedWebflowSites.length
            }
            connectedCount={
              integrations.filter(
                (integration) => integration.status === "CONNECTED",
              ).length
            }
            needsAttentionCount={
              integrations.filter((integration) =>
                ["ERROR", "NEEDS_AUTH", "PLANNED"].includes(integration.status),
              ).length
            }
          />

          <ProjectWorkspaceBar
            active="integrations"
            domainId={selectedDomainId}
            note="Connection steps are shown for this website workspace."
            returnPath="/integrations"
          />

          <details className="group mt-5 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-orange-50 text-orange-600">
                  <PlugZap className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Add a saved connection only when the guided setup below does not cover the tool you need.">
                      Add a connection manually
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Use this only when the guided setup below does not already
                    cover the tool you want to connect.
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium text-orange-600 group-open:hidden">
                Add manually
              </span>
              <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:inline">
                Hide
              </span>
            </summary>

            <form
              action={createIntegrationAction}
              className="grid gap-3 border-t border-slate-100 p-5 md:grid-cols-2 2xl:grid-cols-4"
            >
              <Select
                help="The outside tool or website platform this portal should use."
                label="Tool"
                name="provider"
              >
                {providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {formatProvider(provider)}
                  </option>
                ))}
              </Select>
              <Select
                help="Current setup state for this integration."
                label="Setup status"
                name="status"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {formatConnectionStatus(status)}
                  </option>
                ))}
              </Select>
              <Select
                help="Attach this connection to one client, or keep it for the whole workspace."
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
                help="Attach this connection to one website."
                label="Website"
                name="domainId"
                defaultValue={selectedDomainId ?? ""}
              >
                <option value="">All websites</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </Select>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-500">
                  Notes
                </span>
                <input
                  name="notes"
                  placeholder="Account ID, install note, or next setup step"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <div className="md:col-span-2 2xl:col-span-4">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Save connection
                  <InfoTooltip
                    label="Save this setup note so it can be finished later."
                    passive
                    side="left"
                  />
                </button>
              </div>
            </form>
          </details>

          <section
            id="search-console"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="Bring in verified Google Search Console sites and match them to websites in this portal.">
                    Google Search Console
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Sign in with Google, bring in verified sites, and match each
                  one to the right website.
                </p>
              </div>
              <a
                href="/api/integrations/google-search-console/start"
                className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Connect Google
                <InfoTooltip
                  label="Open Google sign-in and bring back the sites this account can access."
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
                    value={formatConnectionStatus(
                      searchConsoleIntegration.status,
                    )}
                  />
                  <Meta
                    label="Imported sites"
                    value={searchConsoleSites.length}
                  />
                  <Meta
                    label="Matched websites"
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
                            {formatGooglePermission(
                              site.permissionLevel || "unknown",
                            )}
                          </p>
                        </div>
                        <Meta
                          label="Best match"
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
                              Select website
                            </option>
                            {domains.map((domain) => (
                              <option key={domain.id} value={domain.id}>
                                {domain.domain}
                              </option>
                            ))}
                          </select>
                          <button className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                            Match
                          </button>
                        </form>
                      </article>
                    );
                  })}
                </div>
              ) : null}

              {mappedSearchConsoleProperties.length ? (
                <div className="grid gap-3 rounded-md border border-slate-200 p-4">
                  <h4 className="font-semibold">Matched sites</h4>
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
                          value={formatConnectionStatus(integration.status)}
                        />
                        {integration.domainId ? (
                          <form action={importGoogleSearchConsoleMetricsAction}>
                            <input
                              type="hidden"
                              name="domainId"
                              value={integration.domainId}
                            />
                            <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                              Refresh data
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

          <section
            id="google-analytics"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help={PRODUCT_CONNECTION_COPY.analyticsHelp}>
                    Google Analytics
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Connect GA4, choose the right website, and refresh traffic
                  data when you need updated reports.
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
                    value={formatConnectionStatus(analyticsIntegration.status)}
                  />
                  <Meta
                    label="Imported accounts"
                    value={analyticsProperties.length}
                  />
                  <Meta
                    label="Matched websites"
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
                            Select website
                          </option>
                          {domains.map((domain) => (
                            <option key={domain.id} value={domain.id}>
                              {domain.domain}
                            </option>
                          ))}
                        </select>
                        <button className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                          Match
                        </button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : null}

              {mappedAnalyticsProperties.length ? (
                <div className="grid gap-3 rounded-md border border-slate-200 p-4">
                  <h4 className="font-semibold">Matched traffic accounts</h4>
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
                          value={formatConnectionStatus(integration.status)}
                        />
                        {integration.domainId ? (
                          <form action={importGoogleAnalyticsMetricsAction}>
                            <input
                              type="hidden"
                              name="domainId"
                              value={integration.domainId}
                            />
                            <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                              Refresh data
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

          <section
            id="wordpress-plugin"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Install the WordPress helper so this portal can check the site and help send fixes.">
                  WordPress plugin
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {PRODUCT_CONNECTION_COPY.wordpressIntro}
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
                  label="WordPress websites"
                  value={wordpressDomains.length}
                />
              </div>

              <div className="grid gap-4 rounded-md border border-slate-200 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div>
                  <p className="font-semibold">Download the WordPress plugin</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Upload this ZIP in WordPress admin under Plugins &gt; Add
                    Plugin &gt; Upload Plugin, then save the app link, website
                    setup code, and connection key below.
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
                    label="Download the installable WordPress ZIP for websites."
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
                              {PRODUCT_CONNECTION_COPY.wordpressSettingsHint}
                            </p>
                          </div>
                          <Meta label="Website setup code" value={domain.id} />
                          <Meta
                            label="Script"
                            value={formatWebsiteTagStatus(domain.scriptStatus)}
                          />
                          <Meta
                            label="Fix connection"
                            value={
                              receiverIntegration
                                ? formatConnectionStatus(
                                    receiverIntegration.status,
                                  )
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
                              label="Use these exact values in the WordPress plugin settings for this website."
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
                                    {getFriendlyInstallLabel(item.label)}
                                  </p>
                                  <InfoTooltip
                                    label={getFriendlyInstallHelp(item.label)}
                                    passive
                                    side="right"
                                  />
                                </div>
                                <code className="mt-2 block break-all rounded-md bg-slate-50 px-3 py-2 font-mono text-xs leading-5 text-slate-700">
                                  {getFriendlyInstallValue(item.value)}
                                </code>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                          <Meta
                            help="Paste this value into the connection key field inside the WordPress plugin settings."
                            label="Generated connection key"
                            value={
                              receiverConfig.receiverKey ? (
                                <code className="block break-all rounded-md bg-white px-3 py-2 font-mono text-xs text-slate-700">
                                  {receiverConfig.receiverKey}
                                </code>
                              ) : (
                                "Generated when connection is saved"
                              )
                            }
                          />
                          <div className="grid gap-3">
                            <Meta
                              help="The plugin uses this return link after a WordPress fix has been applied or reviewed."
                              label="Return link"
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
                                  Test connection
                                  <InfoTooltip
                                    label="Send a harmless test message to confirm WordPress can talk to this portal."
                                    passive
                                    side="left"
                                  />
                                </button>
                              </form>
                            ) : null}
                          </div>
                          <Meta
                            help="Latest connection test between this portal and the WordPress plugin."
                            label="Last connection test"
                            value={
                              receiverConfig.lastTestStatus ? (
                                <span
                                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getReceiverTestClass(
                                    receiverConfig.lastTestStatus,
                                  )}`}
                                >
                                  {formatReceiverTestStatus(
                                    receiverConfig.lastTestStatus,
                                  )}
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
                              receiverConfig.lastTestMessage
                                ? formatWordPressConnectionMessage(
                                    receiverConfig.lastTestMessage,
                                  )
                                : "Run a connection test after saving the site values."
                            }
                          />
                        </div>
                        <div className="rounded-md border border-slate-200 bg-white p-3">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              WordPress setup steps
                            </p>
                            <InfoTooltip
                              label="Shows what is left before this WordPress site can receive fixes."
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
                                    {getFriendlyWordPressStepLabel(step.label)}
                                  </p>
                                  <span
                                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getOnboardingStepClass(
                                      step.status,
                                    )}`}
                                  >
                                    {formatSetupStepStatus(step.status)}
                                  </span>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                  {getFriendlyWordPressStepDetail(step.detail)}
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
                              WordPress update link
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
                              WordPress connection key
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
                            Save connection
                          </button>
                        </form>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No WordPress websites are set up yet. Choose WordPress as the
                  website platform to show plugin install values here.
                </div>
              )}

              <div className="rounded-md border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                Upload the plugin ZIP through WordPress admin or copy the{" "}
                <span className="font-medium">all-in-one-seo</span> folder to{" "}
                <span className="font-medium">wp-content/plugins</span>. After
                activation, save the app link and website setup code from this
                panel. Full install notes live in{" "}
                <span className="font-medium">docs/WORDPRESS_PLUGIN.md</span>.
              </div>
            </div>
          </section>

          <section
            id="shopify-app"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Connect Shopify stores and match them to websites in this portal.">
                  Shopify app
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {PRODUCT_CONNECTION_COPY.shopifyIntro}
              </p>
            </div>

            <div className="grid gap-5 p-5">
              <form
                action="/api/integrations/shopify/start"
                className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_1fr_auto]"
              >
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Store URL
                  </span>
                  <input
                    name="shop"
                    placeholder="client-store.myshopify.com"
                    required
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <Select label="Website" name="domainId">
                  <option value="">Match later</option>
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
                  label="Return URL"
                  value="Available in Shopify app settings"
                />
                <Meta
                  label="Access needed"
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
                            "Not matched to a website"}
                        </p>
                      </div>
                      <Meta
                        label="Status"
                        value={formatConnectionStatus(integration.status)}
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

          <section
            id="configured-integrations"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="Connect Webflow and match imported sites to websites in this portal.">
                    Webflow site
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Sign in to Webflow, bring in sites you can access, and match
                  each one to the right website.
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
                    value={formatConnectionStatus(webflowIntegration.status)}
                  />
                  <Meta label="Imported sites" value={webflowSites.length} />
                  <Meta
                    label="Matched websites"
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
                          label="Best match"
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
                              Select website
                            </option>
                            {domains.map((domain) => (
                              <option key={domain.id} value={domain.id}>
                                {domain.domain}
                              </option>
                            ))}
                          </select>
                          <button className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                            Match
                          </button>
                        </form>
                      </article>
                    );
                  })}
                </div>
              ) : null}

              {mappedWebflowSites.length ? (
                <div className="grid gap-3 rounded-md border border-slate-200 p-4">
                  <h4 className="font-semibold">Matched Webflow sites</h4>
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
                          value={formatConnectionStatus(integration.status)}
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
                <HelpLabel help={PRODUCT_CONNECTION_COPY.slackHelp}>
                  Slack messages
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Choose the Slack channel that should receive important website
                changes.
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
                    placeholder={PRODUCT_CONNECTION_COPY.slackChannelPlaceholder}
                    defaultValue={slackConfig.channelName}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Slack message URL
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
                    Save Slack messages
                  </button>
                </div>
              </form>

              <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                <Meta
                  label="Status"
                  value={
                    slackIntegration
                      ? formatConnectionStatus(slackIntegration.status)
                      : "Not connected"
                  }
                />
                <Meta
                  label="Channel"
                  value={slackConfig.channelName || "Not configured"}
                />
                <Meta
                  label="Backup use"
                  value="Used when a watch does not choose its own Slack URL"
                />
              </div>
            </div>
          </section>

          <details className="group mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="flex items-center justify-between gap-4 p-5">
              <div>
                <h3 className="text-lg font-semibold">
                  Advanced connection settings
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Keep launch checks, no-code messages, and saved connection
                  details here when you need them.
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium text-orange-600 group-open:hidden">
                Show settings
              </span>
              <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:inline">
                Hide
              </span>
            </summary>
            <div className="border-t border-slate-100 px-5 pb-5">
              <section className="mt-5 rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h3 className="text-lg font-semibold">
                    Vercel launch checks
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Watch Vercel launches and run a fresh website check when the
                    live site changes.
                  </p>
                </div>

                <div className="grid gap-5 p-5">
                  <form
                    action={connectVercelIntegrationAction}
                    className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                  >
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Vercel setup code
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
                        Website launch name
                      </span>
                      <input
                        name="projectName"
                        placeholder="marketing-site"
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Signing secret
                      </span>
                      <input
                        name="webhookSecret"
                        placeholder="Paste Vercel secret or leave blank"
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </label>
                    <Select label="Website" name="domainId">
                      <option value="">Match later</option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.domain}
                        </option>
                      ))}
                    </Select>
                    <div className="flex items-end">
                      <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                        Save Vercel check
                      </button>
                    </div>
                  </form>

                  <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                    <Meta
                      label="Message URL"
                      value={`${appUrl}/api/integrations/vercel/webhook`}
                    />
                    <Meta
                      label="Saved launch checks"
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
                                  "Not matched to a website"}
                              </p>
                            </div>
                            <Meta
                              label="Setup code"
                              value={config.projectId}
                            />
                            <Meta
                              label="Status"
                              value={formatConnectionStatus(
                                integration.status,
                              )}
                            />
                          </article>
                        );
                      })}
                    </div>
                  ) : null}

                  {deploymentChecks.some(
                    (check) => check.provider === "VERCEL",
                  ) ? (
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
                                  {check.projectName ??
                                    check.projectId ??
                                    "Vercel"}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {check.deploymentUrl ?? "No deployment URL"}
                                </p>
                              </div>
                              <Meta
                                label="Status"
                                value={formatLaunchCheckStatus(check.status)}
                              />
                              <Meta
                                label="Website"
                                value={check.domain?.domain ?? "Not matched"}
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
                    Netlify launch checks
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Watch Netlify launches and run a fresh website check when
                    the live site changes.
                  </p>
                </div>

                <div className="grid gap-5 p-5">
                  <form
                    action={connectNetlifyIntegrationAction}
                    className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                  >
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Netlify setup code
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
                        Signing secret
                      </span>
                      <input
                        name="webhookSecret"
                        placeholder="Paste Netlify JWS secret or leave blank"
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </label>
                    <Select label="Website" name="domainId">
                      <option value="">Match later</option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.domain}
                        </option>
                      ))}
                    </Select>
                    <div className="flex items-end">
                      <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                        Save Netlify check
                      </button>
                    </div>
                  </form>

                  <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                    <Meta
                      label="Message URL"
                      value={`${appUrl}/api/integrations/netlify/webhook`}
                    />
                    <Meta
                      label="Saved launch checks"
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
                                  "Not matched to a website"}
                              </p>
                            </div>
                            <Meta label="Setup code" value={config.siteId} />
                            <Meta
                              label="Status"
                              value={formatConnectionStatus(
                                integration.status,
                              )}
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
                              <Meta
                                label="Status"
                                value={formatLaunchCheckStatus(check.status)}
                              />
                              <Meta
                                label="Website"
                                value={check.domain?.domain ?? "Not matched"}
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
                    <HelpLabel help={PRODUCT_CONNECTION_COPY.automationHelp}>
                      Zapier and Make
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {PRODUCT_CONNECTION_COPY.automationIntro}
                  </p>
                </div>

                <div className="grid gap-5 p-5">
                  <form
                    action={connectAutomationIntegrationAction}
                    className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2 2xl:grid-cols-[160px_minmax(0,1fr)_minmax(0,2fr)_auto]"
                  >
                    <Select label="Tool" name="provider">
                      <option value="ZAPIER">Zapier</option>
                      <option value="MAKE">Make</option>
                    </Select>
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Name
                      </span>
                      <input
                        name="label"
                        placeholder="Client update message"
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Message URL
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
                        Save automation
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
                                {config.label ||
                                  formatProvider(integration.provider)}
                              </p>
                              <p className="mt-1 truncate text-sm text-slate-500">
                                {config.webhookUrl}
                              </p>
                            </div>
                            <Meta
                              label="Tool"
                              value={formatProvider(integration.provider)}
                            />
                            <Meta
                              label="Status"
                              value={formatConnectionStatus(
                                integration.status,
                              )}
                            />
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      No Zapier or Make automations connected yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="All saved connections for this workspace, client, or website.">
                      Saved connection details
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Saved analytics, search, website, message, and launch-check
                    details.
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
                            {formatProvider(integration.provider)}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {integration.client?.name ??
                              integration.domain?.domain ??
                              "Workspace-wide"}
                          </p>
                        </div>
                        <Meta
                          label="Status"
                          value={formatConnectionStatus(integration.status)}
                        />
                        <Meta
                          label="Website"
                          value={integration.domain?.domain ?? "All websites"}
                        />
                        <Meta
                          label="Created"
                          value={integration.createdAt.toLocaleDateString()}
                        />
                      </article>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No connections saved yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </details>
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
      <span className="text-sm font-medium text-slate-500">
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
      <p className="text-sm font-medium text-slate-500">
        {help ? <HelpLabel help={help}>{label}</HelpLabel> : label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function IntegrationPlan({
  analyticsCount,
  automationCount,
  cmsCount,
  connectedCount,
  needsAttentionCount,
}: {
  analyticsCount: number;
  automationCount: number;
  cmsCount: number;
  connectedCount: number;
  needsAttentionCount: number;
}) {
  const plan = [
    {
      detail: analyticsCount
        ? "Search and traffic data is matched, so reports can use real performance signals."
        : "Connect Search Console first so the product can show real clicks, keywords, and pages.",
      href: analyticsCount ? "#google-analytics" : "#search-console",
      label: analyticsCount
        ? "Analytics data is ready"
        : "Start with Google data",
      value: analyticsCount ? `${analyticsCount} matched` : "Best first step",
    },
    {
      detail: cmsCount
        ? "Website platform connections are ready for install steps and easier fixes."
        : "Choose the platform your website uses so fixes can become easier to apply.",
      href: cmsCount ? "#configured-integrations" : "#wordpress-plugin",
      label: cmsCount
        ? "Website platform connected"
        : "Connect the website platform",
      value: cmsCount ? `${cmsCount} ready` : "Website setup",
    },
    {
      detail: automationCount
        ? "Messages, launch checks, or automations can help keep changes moving."
        : "Add messages and launch checks after the main data and website connections are done.",
      href: automationCount
        ? "#configured-integrations"
        : "#configured-integrations",
      label: automationCount ? "Keep updates moving" : "Automate after setup",
      value: automationCount ? `${automationCount} active` : "Optional later",
    },
  ];

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-600">
            Connection setup plan
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-normal">
            {PRODUCT_CONNECTION_COPY.planHeading}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
            {connectedCount} connected
          </span>
          {needsAttentionCount ? (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              {needsAttentionCount} need attention
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {plan.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
          >
            <span className="text-sm font-semibold text-slate-950">
              {item.label}
            </span>
            <span className="mt-2 block text-sm font-medium text-orange-600">
              {item.value}
            </span>
            <span className="mt-2 block text-sm leading-6 text-slate-500">
              {item.detail}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatProvider(value: string) {
  const labels: Record<string, string> = {
    GOOGLE_ANALYTICS: "Google Analytics",
    GOOGLE_ANALYTICS_PROPERTY: "Google Analytics property",
    GOOGLE_SEARCH_CONSOLE: "Google Search Console",
    GOOGLE_SEARCH_CONSOLE_PROPERTY: "Search Console site",
    MAKE: "Make automation",
    NETLIFY: "Netlify launch check",
    SHOPIFY: "Shopify store",
    SLACK: "Slack messages",
    VERCEL: "Vercel launch check",
    WEBFLOW: "Webflow",
    WEBFLOW_SITE: "Webflow site",
    WORDPRESS: "WordPress site",
    WORDPRESS_RECEIVER: "WordPress fix connection",
    ZAPIER: "Zapier automation",
  };

  return labels[value] ?? formatEnum(value);
}

function formatConnectionStatus(value: string) {
  const labels: Record<string, string> = {
    CONNECTED: "Connected",
    ERROR: "Needs another try",
    NEEDS_AUTH: "Needs sign-in",
    PLANNED: "Not connected yet",
  };

  return labels[value] ?? formatEnum(value);
}

function formatWebsiteTagStatus(value: string) {
  const labels: Record<string, string> = {
    DETECTED: "Monitoring connected",
    ERROR: "Needs another try",
    MISSING: "Not installed yet",
    NOT_INSTALLED: "Not installed yet",
    PENDING: "Waiting to detect",
  };

  return labels[value] ?? formatEnum(value);
}

function formatGooglePermission(value: string) {
  const labels: Record<string, string> = {
    owner: "Owner access",
    siteFullUser: "Full website access",
    siteOwner: "Owner access",
    siteRestrictedUser: "Limited website access",
    unknown: "Access level unknown",
  };

  return labels[value] ?? formatEnum(value);
}

function formatReceiverTestStatus(value: string) {
  const labels: Record<string, string> = {
    FAILED: "Needs another try",
    PASSED: "Connection works",
    PENDING: "Waiting to test",
  };

  return labels[value] ?? formatEnum(value);
}

function formatSetupStepStatus(value: string) {
  const labels: Record<string, string> = {
    COMPLETE: "Done",
    READY: "Ready",
    TODO: "To do",
    WARNING: "Needs a look",
  };

  return labels[value] ?? formatEnum(value);
}

function formatLaunchCheckStatus(value: string) {
  const labels: Record<string, string> = {
    CANCELLED: "Stopped",
    ERROR: "Needs another try",
    FAILED: "Needs another try",
    PENDING: "Waiting to start",
    QUEUED: "Waiting to start",
    READY: "Ready",
    RUNNING: "Checking now",
    SUCCESS: "Finished",
    SUCCEEDED: "Finished",
  };

  return labels[value] ?? formatEnum(value);
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

function getFriendlyInstallLabel(label: string) {
  const labels: Record<string, string> = {
    "callback url": "RETURN LINK",
    "connection key": "CONNECTION KEY",
    "receiver api key": "CONNECTION KEY",
    "receiver endpoint": "WORDPRESS UPDATE LINK",
    "return link": "RETURN LINK",
    "wordpress update link": "WORDPRESS UPDATE LINK",
  };

  return labels[label.toLowerCase()] ?? label;
}

function getFriendlyInstallHelp(label: string) {
  const help: Record<string, string> = {
    "callback url":
      "This is where WordPress tells the portal that a fix was applied or reviewed.",
    "connection key":
      "Paste this key in WordPress so the portal knows the message came from the right site.",
    "receiver api key":
      "Paste this key in WordPress so the portal knows the message came from the right site.",
    "receiver endpoint":
      "Save this WordPress update link here, then test the connection before sending fixes.",
    "return link":
      "This is where WordPress tells the portal that a fix was applied or reviewed.",
    "wordpress update link":
      "Save this WordPress update link here, then test the connection before sending fixes.",
  };

  return (
    help[label.toLowerCase()] ??
    "Paste this value into the matching WordPress field."
  );
}

function getFriendlyInstallValue(value: string) {
  return value
    .replaceAll("receiver endpoint", "WordPress update link")
    .replaceAll("Receiver endpoint", "WordPress update link")
    .replaceAll("Receiver API key", "Connection key")
    .replaceAll("receiver", "connection")
    .replaceAll("callback", "return");
}

function getFriendlyWordPressStepLabel(label: string) {
  const labels: Record<string, string> = {
    "Connection key generated": "Connection key ready",
    "Fix delivery enabled": "Fix sending ready",
    "Receiver endpoint saved": "Update link saved",
    "Receiver key generated": "Connection key ready",
    "Receiver tested": "Connection tested",
  };

  return labels[label] ?? label;
}

function getFriendlyWordPressStepDetail(detail: string) {
  return detail
    .replaceAll("receiver endpoint", "WordPress update link")
    .replaceAll("receiver test", "connection test")
    .replaceAll("receiver", "connection")
    .replaceAll("endpoint", "update link")
    .replaceAll("API key", "connection key")
    .replaceAll("api key", "connection key")
    .replaceAll("receiver key", "connection key")
    .replaceAll("Receiver key", "Connection key")
    .replaceAll("Run Test connection", "Run Test connection")
    .replaceAll("Fix Center", "Fixes");
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
