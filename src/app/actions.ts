"use server";

import {
  AlertChannel,
  IssueNoteVisibility,
  IssueSeverity,
  IssueStatus,
  ReportScheduleFrequency,
  WorkspaceRole,
  WorkspaceType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createDomainVerification,
  verifyDomainOwnership,
  verifyDomainTxtRecord,
} from "@/lib/domain-verification";
import {
  AutomationProvider,
  upsertAutomationIntegration,
} from "@/lib/automation-integrations";
import { startPlanTrial } from "@/lib/billing";
import {
  assertCanCreateDomain,
  assertCanCreateReport,
  assertCanStartCrawl,
  assertCanUseCrawlFrequency,
  getWorkspacePlanLimits,
} from "@/lib/billing";
import {
  createStripeCheckoutSession,
  createStripePortalSession,
} from "@/lib/stripe-billing";
import { createAlertRule, evaluateAlertRules } from "@/lib/alerts";
import {
  loginWithPassword,
  logoutCurrentSession,
  requireCurrentUser,
  requestPasswordReset,
  resetPasswordWithToken,
  signUpWithPassword,
  verifyEmailWithToken,
} from "@/lib/auth";
import {
  generateIssueAiRecommendations,
  generatePageSeoRecommendations,
  generateTemplateAiFixBrief,
} from "@/lib/ai";
import {
  cancelCrawlRun,
  createManualCrawlRun,
  runHomepageCrawl,
} from "@/lib/crawler";
import {
  normalizeClientCrawlFrequency,
  parseBulkClientRows,
  serializeClientTags,
} from "@/lib/client-management";
import {
  normalizeDomain,
  normalizeDomainCrawlFrequency,
  normalizeDomainPlatform,
  parseBulkDomainRows,
} from "@/lib/domain-management";
import { getPrisma } from "@/lib/prisma";
import {
  buildBulkIssueStatusUpdate,
  buildIssueStatusUpdate,
  normalizeIssueAssignment,
} from "@/lib/issue-workflow";
import {
  createReport,
  createReportSchedule,
  createReportTemplate,
  createReportWhiteLabelDomain,
  publishReport,
  verifyReportWhiteLabelDomain,
} from "@/lib/reporting";
import {
  importGoogleSearchConsoleMetrics,
  mapGoogleSearchConsoleProperty,
} from "@/lib/google-search-console";
import { upsertVercelIntegration } from "@/lib/deployment-checks";
import { upsertNetlifyIntegration } from "@/lib/deployment-checks";
import {
  importGoogleAnalyticsMetrics,
  mapGoogleAnalyticsProperty,
} from "@/lib/google-analytics";
import { upsertSlackIntegration } from "@/lib/slack";
import {
  inviteWorkspaceMember,
  removeWorkspaceMember,
  revokeWorkspaceInvitation,
  updateWorkspaceMemberRole,
} from "@/lib/team";
import { mapWebflowSite } from "@/lib/webflow";
import {
  getPrimaryWorkspace,
  getWorkspacePlanForType,
  selectedWorkspaceCookieName,
} from "@/lib/workspace";

export async function createWorkspace(formData: FormData) {
  const user = await requireCurrentUserForAction();
  const name = getRequiredString(formData, "name");
  const type = getRequiredString(
    formData,
    "type",
  ).toUpperCase() as WorkspaceType;

  const workspace = await getPrisma().workspace.create({
    data: {
      name,
      type,
      plan: getWorkspacePlanForType(type),
      members: {
        create: {
          role: "OWNER",
          userId: user.id,
        },
      },
    },
  });

  await setSelectedWorkspace(workspace.id);

  revalidatePath("/");
  redirect("/");
}

export async function switchWorkspaceAction(formData: FormData) {
  const workspaceId = getRequiredString(formData, "workspaceId");
  const user = await requireCurrentUserForAction();
  const membership = user.workspaceMembers.find(
    (item) => item.workspaceId === workspaceId,
  );

  if (!membership) {
    throw new Error("You do not have access to that workspace.");
  }

  await setSelectedWorkspace(workspaceId);

  revalidatePath("/");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");
  const name = getOptionalString(formData, "name");
  const workspaceName = getRequiredString(formData, "workspaceName");

  await signUpWithPassword({ email, password, name, workspaceName });

  revalidatePath("/");
  redirect("/");
}

export async function login(formData: FormData) {
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");

  try {
    await loginWithPassword(email, password);
  } catch {
    redirect("/login?error=invalid");
  }

  revalidatePath("/");
  redirect("/");
}

export async function logout() {
  await logoutCurrentSession();

  redirect("/login");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = getRequiredString(formData, "email");

  await requestPasswordReset(email);

  redirect("/login?reset=requested");
}

export async function resetPasswordAction(formData: FormData) {
  const token = getRequiredString(formData, "token");
  const password = getRequiredString(formData, "password");

  await resetPasswordWithToken(token, password);

  redirect("/login?reset=complete");
}

export async function verifyEmailAction(formData: FormData) {
  const token = getRequiredString(formData, "token");

  await verifyEmailWithToken(token);

  redirect("/?verified=1");
}

export async function createClient(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const name = getRequiredString(formData, "name");
  const contactEmail = getOptionalString(formData, "contactEmail");
  const notes = getOptionalString(formData, "notes");
  const logoUrl = getOptionalString(formData, "logoUrl");
  const tags = serializeClientTags(
    (getOptionalString(formData, "tags") ?? "").split(","),
  );
  const crawlFrequency = normalizeClientCrawlFrequency(
    getOptionalString(formData, "crawlFrequency") ?? "WEEKLY",
  );

  await getPrisma().client.create({
    data: {
      workspaceId: workspace.id,
      name,
      contactEmail,
      crawlFrequency,
      logoUrl,
      notes,
      tags,
    },
  });

  revalidatePath("/");
  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClientAction(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const clientId = getRequiredString(formData, "clientId");
  const name = getRequiredString(formData, "name");
  const contactEmail = getOptionalString(formData, "contactEmail");
  const notes = getOptionalString(formData, "notes");
  const logoUrl = getOptionalString(formData, "logoUrl");
  const tags = serializeClientTags(
    (getOptionalString(formData, "tags") ?? "").split(","),
  );
  const crawlFrequency = normalizeClientCrawlFrequency(
    getOptionalString(formData, "crawlFrequency") ?? "WEEKLY",
  );

  await getPrisma().client.updateMany({
    where: { id: clientId, workspaceId: workspace.id },
    data: { contactEmail, crawlFrequency, logoUrl, name, notes, tags },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function archiveClientAction(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const clientId = getRequiredString(formData, "clientId");

  await getPrisma().client.updateMany({
    where: { id: clientId, workspaceId: workspace.id },
    data: { archivedAt: new Date() },
  });

  revalidatePath("/clients");
  redirect("/clients");
}

export async function deleteClientAction(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const clientId = getRequiredString(formData, "clientId");

  await getPrisma().client.deleteMany({
    where: { id: clientId, workspaceId: workspace.id },
  });

  revalidatePath("/clients");
  redirect("/clients");
}

export async function bulkImportClientsAction(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const rows = parseBulkClientRows(getRequiredString(formData, "clients"));

  if (rows.length) {
    await getPrisma().client.createMany({
      data: rows.map((row) => ({
        contactEmail: row.contactEmail,
        name: row.name,
        tags: row.tags,
        workspaceId: workspace.id,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function createDomain(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const domain = normalizeDomain(getRequiredString(formData, "domain"));
  const clientId = getOptionalString(formData, "clientId");
  const platform = normalizeDomainPlatform(
    getOptionalString(formData, "platform"),
  );
  const crawlFrequency = normalizeDomainCrawlFrequency(
    getOptionalString(formData, "crawlFrequency"),
  );

  await assertCanCreateDomain(workspace.id);
  await assertCanUseCrawlFrequency({
    frequency: crawlFrequency,
    workspaceId: workspace.id,
  });

  const createdDomain = await getPrisma().domain.create({
    data: {
      workspaceId: workspace.id,
      clientId,
      domain,
      platform,
      crawlFrequency,
      verificationStatus: "PENDING",
    },
  });

  await createDomainVerification(createdDomain.id);

  revalidatePath("/");
  revalidatePath("/domains");
  redirect("/domains");
}

export async function updateDomainAction(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const domainId = getRequiredString(formData, "domainId");
  const clientId = getOptionalString(formData, "clientId");
  const platform = normalizeDomainPlatform(
    getOptionalString(formData, "platform"),
  );
  const crawlFrequency = normalizeDomainCrawlFrequency(
    getOptionalString(formData, "crawlFrequency"),
  );

  await assertCanUseCrawlFrequency({
    frequency: crawlFrequency,
    workspaceId: workspace.id,
  });

  await getPrisma().domain.updateMany({
    where: { archivedAt: null, id: domainId, workspaceId: workspace.id },
    data: { clientId, crawlFrequency, platform },
  });

  revalidatePath("/domains");
  revalidatePath(`/domains/${domainId}`);
  redirect(`/domains/${domainId}`);
}

export async function archiveDomainAction(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const domainId = getRequiredString(formData, "domainId");

  await getPrisma().domain.updateMany({
    where: { archivedAt: null, id: domainId, workspaceId: workspace.id },
    data: { archivedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/domains");
  redirect("/domains");
}

export async function deleteDomainAction(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const domainId = getRequiredString(formData, "domainId");

  await getPrisma().domain.deleteMany({
    where: { id: domainId, workspaceId: workspace.id },
  });

  revalidatePath("/");
  revalidatePath("/domains");
  redirect("/domains");
}

export async function bulkImportDomainsAction(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const rows = parseBulkDomainRows(getRequiredString(formData, "domains"));

  if (rows.length) {
    const clientNames = rows
      .map((row) => row.clientName)
      .filter((name): name is string => Boolean(name));
    const clients = clientNames.length
      ? await getPrisma().client.findMany({
          where: {
            archivedAt: null,
            name: { in: clientNames },
            workspaceId: workspace.id,
          },
          select: { id: true, name: true },
        })
      : [];
    const clientIdsByName = new Map(
      clients.map((client) => [client.name.toLowerCase(), client.id]),
    );
    const existingDomains = await getPrisma().domain.findMany({
      where: {
        domain: { in: rows.map((row) => row.domain) },
        workspaceId: workspace.id,
      },
      select: { domain: true },
    });
    const existing = new Set(existingDomains.map((item) => item.domain));
    const availableSlots = await getRemainingDomainSlots(workspace.id);
    const seen = new Set<string>();
    const importRows = rows
      .filter((row) => {
        if (existing.has(row.domain) || seen.has(row.domain)) {
          return false;
        }

        seen.add(row.domain);
        return true;
      })
      .slice(0, availableSlots);

    if (importRows.length) {
      for (const row of importRows) {
        await assertCanUseCrawlFrequency({
          frequency: row.crawlFrequency,
          workspaceId: workspace.id,
        });
      }

      for (const row of importRows) {
        const createdDomain = await getPrisma().domain.create({
          data: {
            clientId: row.clientName
              ? clientIdsByName.get(row.clientName.toLowerCase())
              : undefined,
            crawlFrequency: row.crawlFrequency,
            domain: row.domain,
            platform: row.platform,
            verificationStatus: "PENDING",
            workspaceId: workspace.id,
          },
          select: { id: true },
        });

        await createDomainVerification(createdDomain.id);
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/domains");
  redirect("/domains");
}

export async function generateDomainVerification(formData: FormData) {
  const domainId = getRequiredString(formData, "domainId");
  const method = getVerificationMethod(formData);

  await createDomainVerification(domainId, method);

  revalidatePath("/domains");
  revalidatePath(`/domains/${domainId}/verification`);
  redirect(`/domains/${domainId}/verification`);
}

export async function checkDomainVerification(formData: FormData) {
  const domainId = getRequiredString(formData, "domainId");

  await verifyDomainTxtRecord(domainId);

  revalidatePath("/");
  revalidatePath("/domains");
  revalidatePath(`/domains/${domainId}/verification`);
  redirect(`/domains/${domainId}/verification`);
}

export async function checkDomainVerificationMethod(formData: FormData) {
  const domainId = getRequiredString(formData, "domainId");
  const method = getVerificationMethod(formData);

  await verifyDomainOwnership({ domainId, method });

  revalidatePath("/");
  revalidatePath("/domains");
  revalidatePath(`/domains/${domainId}/verification`);
  redirect(`/domains/${domainId}/verification`);
}

export async function startManualCrawl(formData: FormData) {
  const domainId = getRequiredString(formData, "domainId");

  await assertCanStartCrawl(domainId);

  const crawlRun = await createManualCrawlRun(domainId);

  await runHomepageCrawl(crawlRun.id);

  revalidatePath("/");
  revalidatePath("/domains");
  revalidatePath(`/crawl-runs/${crawlRun.id}`);
  redirect(`/crawl-runs/${crawlRun.id}`);
}

export async function cancelCrawl(formData: FormData) {
  const crawlRunId = getRequiredString(formData, "crawlRunId");

  await cancelCrawlRun(crawlRunId);

  revalidatePath(`/crawl-runs/${crawlRunId}`);
  redirect(`/crawl-runs/${crawlRunId}`);
}

export async function updateIssueStatus(formData: FormData) {
  const issueId = getRequiredString(formData, "issueId");
  const status = getRequiredString(
    formData,
    "status",
  ).toUpperCase() as IssueStatus;

  await getPrisma().seoIssue.update({
    where: { id: issueId },
    data: buildIssueStatusUpdate(status),
  });

  revalidatePath("/issues");
  revalidatePath(`/issues/${issueId}`);
  redirect(`/issues/${issueId}`);
}

export async function bulkUpdateIssues(formData: FormData) {
  const issueIds = formData
    .getAll("issueId")
    .filter((value): value is string => typeof value === "string" && !!value);
  const status = getRequiredString(
    formData,
    "status",
  ).toUpperCase() as IssueStatus;

  if (!issueIds.length) {
    redirect("/issues");
  }

  await getPrisma().seoIssue.updateMany({
    where: { id: { in: issueIds } },
    data: buildBulkIssueStatusUpdate(status),
  });

  revalidatePath("/");
  revalidatePath("/issues");
  redirect("/issues");
}

export async function assignIssue(formData: FormData) {
  const issueId = getRequiredString(formData, "issueId");
  const assignedToId = normalizeIssueAssignment(formData.get("assignedToId"));

  await getPrisma().seoIssue.update({
    where: { id: issueId },
    data: { assignedToId },
  });

  revalidatePath("/issues");
  revalidatePath(`/issues/${issueId}`);
  redirect(`/issues/${issueId}`);
}

export async function addIssueNote(formData: FormData) {
  const issueId = getRequiredString(formData, "issueId");
  const body = getRequiredString(formData, "body");
  const authorId = getOptionalString(formData, "authorId");
  const visibility = getRequiredString(
    formData,
    "visibility",
  ).toUpperCase() as IssueNoteVisibility;

  await getPrisma().seoIssueNote.create({
    data: {
      issueId,
      authorId,
      body,
      visibility,
    },
  });

  revalidatePath(`/issues/${issueId}`);
  redirect(`/issues/${issueId}`);
}

export async function generateReport(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const title = getRequiredString(formData, "title");
  const clientId = getOptionalString(formData, "clientId");
  const domainId = getOptionalString(formData, "domainId");
  const templateId = getOptionalString(formData, "templateId");
  const periodStart = getDateOrDefault(formData, "periodStart", daysAgo(7));
  const periodEnd = getDateOrDefault(formData, "periodEnd", new Date());

  await assertCanCreateReport(workspace.id);

  const report = await createReport({
    clientId,
    domainId,
    templateId,
    periodStart,
    periodEnd,
    title,
  });

  revalidatePath("/");
  revalidatePath("/reports");
  redirect(`/reports/${report.id}`);
}

export async function scheduleReport(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const title = getRequiredString(formData, "title");
  const clientId = getOptionalString(formData, "clientId");
  const domainId = getOptionalString(formData, "domainId");
  const templateId = getOptionalString(formData, "templateId");
  const frequency = getRequiredString(
    formData,
    "frequency",
  ).toUpperCase() as ReportScheduleFrequency;

  await assertCanCreateReport(workspace.id);

  await createReportSchedule({
    clientId,
    domainId,
    templateId,
    frequency,
    title,
  });

  revalidatePath("/reports");
  redirect("/reports");
}

export async function createCustomReportTemplate(formData: FormData) {
  const name = getRequiredString(formData, "name");
  const description = getOptionalString(formData, "description");
  const clientId = getOptionalString(formData, "clientId");
  const sections = formData
    .getAll("sections")
    .filter((value): value is string => typeof value === "string");

  await createReportTemplate({
    clientId,
    description,
    name,
    sections,
  });

  revalidatePath("/reports");
  redirect("/reports");
}

export async function createReportWhiteLabelDomainAction(formData: FormData) {
  const hostname = getRequiredString(formData, "hostname");
  const clientId = getOptionalString(formData, "clientId");

  await createReportWhiteLabelDomain({
    clientId,
    hostname,
  });

  revalidatePath("/reports");
  redirect("/reports");
}

export async function verifyReportWhiteLabelDomainAction(formData: FormData) {
  const whiteLabelDomainId = getRequiredString(formData, "whiteLabelDomainId");

  await verifyReportWhiteLabelDomain(whiteLabelDomainId);

  revalidatePath("/reports");
  redirect("/reports");
}

export async function publishReportAction(formData: FormData) {
  const reportId = getRequiredString(formData, "reportId");

  await publishReport(reportId);

  revalidatePath("/reports");
  revalidatePath(`/reports/${reportId}`);
  redirect(`/reports/${reportId}`);
}

export async function createAlertRuleAction(formData: FormData) {
  const name = getRequiredString(formData, "name");
  const eventType = getRequiredString(formData, "eventType");
  const clientId = getOptionalString(formData, "clientId");
  const domainId = getOptionalString(formData, "domainId");
  const targetEmail = getOptionalString(formData, "targetEmail");
  const targetUrl = getOptionalString(formData, "targetUrl");
  const severityThreshold = getRequiredString(
    formData,
    "severityThreshold",
  ).toUpperCase() as IssueSeverity;
  const channel = getRequiredString(
    formData,
    "channel",
  ).toUpperCase() as AlertChannel;
  const escalationChannelValue = getOptionalString(
    formData,
    "escalationChannel",
  );
  const escalationChannel = escalationChannelValue
    ? (escalationChannelValue.toUpperCase() as AlertChannel)
    : undefined;
  const escalationTargetEmail = getOptionalString(
    formData,
    "escalationTargetEmail",
  );
  const escalationTargetUrl = getOptionalString(
    formData,
    "escalationTargetUrl",
  );

  await createAlertRule({
    name,
    eventType,
    clientId,
    domainId,
    severityThreshold,
    channel,
    targetEmail,
    targetUrl,
    escalationChannel,
    escalationTargetEmail,
    escalationTargetUrl,
  });

  revalidatePath("/alerts");
  redirect("/alerts");
}

export async function createIntegrationAction(formData: FormData) {
  const workspace = await requirePrimaryWorkspace();
  const provider = getRequiredString(formData, "provider").toUpperCase();
  const status = getRequiredString(formData, "status").toUpperCase();
  const clientId = getOptionalString(formData, "clientId");
  const domainId = getOptionalString(formData, "domainId");
  const notes = getOptionalString(formData, "notes");

  await getPrisma().integration.create({
    data: {
      workspaceId: workspace.id,
      clientId,
      domainId,
      provider,
      status,
      configJson: notes ? { notes } : undefined,
    },
  });

  revalidatePath("/integrations");
  redirect("/integrations");
}

export async function mapGoogleSearchConsolePropertyAction(formData: FormData) {
  const domainId = getRequiredString(formData, "domainId");
  const propertyUrl = getRequiredString(formData, "propertyUrl");

  await mapGoogleSearchConsoleProperty({ domainId, propertyUrl });

  revalidatePath("/integrations");
  redirect("/integrations");
}

export async function importGoogleSearchConsoleMetricsAction(
  formData: FormData,
) {
  const domainId = getRequiredString(formData, "domainId");

  await importGoogleSearchConsoleMetrics(domainId);

  revalidatePath("/integrations");
  redirect("/integrations");
}

export async function mapGoogleAnalyticsPropertyAction(formData: FormData) {
  const domainId = getRequiredString(formData, "domainId");
  const property = getRequiredString(formData, "property");

  await mapGoogleAnalyticsProperty({ domainId, property });

  revalidatePath("/integrations");
  redirect("/integrations");
}

export async function importGoogleAnalyticsMetricsAction(formData: FormData) {
  const domainId = getRequiredString(formData, "domainId");

  await importGoogleAnalyticsMetrics(domainId);

  revalidatePath("/integrations");
  redirect("/integrations");
}

export async function mapWebflowSiteAction(formData: FormData) {
  const domainId = getRequiredString(formData, "domainId");
  const siteId = getRequiredString(formData, "siteId");

  await mapWebflowSite({ domainId, siteId });

  revalidatePath("/integrations");
  redirect("/integrations");
}

export async function connectSlackIntegrationAction(formData: FormData) {
  const channelName = getOptionalString(formData, "channelName");
  const webhookUrl = getRequiredString(formData, "webhookUrl");

  await upsertSlackIntegration({ channelName, webhookUrl });

  revalidatePath("/integrations");
  redirect("/integrations");
}

export async function connectVercelIntegrationAction(formData: FormData) {
  const domainId = getOptionalString(formData, "domainId");
  const projectId = getRequiredString(formData, "projectId");
  const projectName = getOptionalString(formData, "projectName");
  const webhookSecret = getOptionalString(formData, "webhookSecret");

  await upsertVercelIntegration({
    domainId,
    projectId,
    projectName,
    webhookSecret,
  });

  revalidatePath("/integrations");
  redirect("/integrations");
}

export async function connectNetlifyIntegrationAction(formData: FormData) {
  const domainId = getOptionalString(formData, "domainId");
  const siteId = getRequiredString(formData, "siteId");
  const siteName = getOptionalString(formData, "siteName");
  const webhookSecret = getOptionalString(formData, "webhookSecret");

  await upsertNetlifyIntegration({
    domainId,
    siteId,
    siteName,
    webhookSecret,
  });

  revalidatePath("/integrations");
  redirect("/integrations");
}

export async function connectAutomationIntegrationAction(formData: FormData) {
  const label = getOptionalString(formData, "label");
  const provider = getRequiredString(
    formData,
    "provider",
  ).toUpperCase() as AutomationProvider;
  const webhookUrl = getRequiredString(formData, "webhookUrl");

  if (!["MAKE", "ZAPIER"].includes(provider)) {
    throw new Error("Automation provider must be Zapier or Make.");
  }

  await upsertAutomationIntegration({ label, provider, webhookUrl });

  revalidatePath("/integrations");
  redirect("/integrations");
}

export async function startBillingTrialAction(formData: FormData) {
  const planKey = getRequiredString(formData, "planKey");

  await startPlanTrial(planKey);

  revalidatePath("/billing");
  redirect("/billing");
}

export async function startStripeCheckoutAction(formData: FormData) {
  const planKey = getRequiredString(formData, "planKey");
  const origin = await getRequestOrigin();
  const url = await createStripeCheckoutSession(planKey, origin);

  redirect(url);
}

export async function openStripePortalAction() {
  const origin = await getRequestOrigin();
  const url = await createStripePortalSession(origin);

  redirect(url);
}

export async function inviteWorkspaceMemberAction(formData: FormData) {
  const email = getRequiredString(formData, "email");
  const role = getRequiredString(
    formData,
    "role",
  ).toUpperCase() as WorkspaceRole;

  await inviteWorkspaceMember({ email, role });

  revalidatePath("/settings");
  redirect("/settings");
}

export async function updateWorkspaceMemberRoleAction(formData: FormData) {
  const memberId = getRequiredString(formData, "memberId");
  const role = getRequiredString(
    formData,
    "role",
  ).toUpperCase() as WorkspaceRole;

  await updateWorkspaceMemberRole({ memberId, role });

  revalidatePath("/settings");
  redirect("/settings");
}

export async function removeWorkspaceMemberAction(formData: FormData) {
  const memberId = getRequiredString(formData, "memberId");

  await removeWorkspaceMember(memberId);

  revalidatePath("/settings");
  redirect("/settings");
}

export async function revokeWorkspaceInvitationAction(formData: FormData) {
  const invitationId = getRequiredString(formData, "invitationId");

  await revokeWorkspaceInvitation(invitationId);

  revalidatePath("/settings");
  redirect("/settings");
}

export async function evaluateAlertsAction() {
  await evaluateAlertRules();

  revalidatePath("/alerts");
  redirect("/alerts");
}

export async function generatePageRecommendations(formData: FormData) {
  const pageId = getRequiredString(formData, "pageId");

  await generatePageSeoRecommendations(pageId);

  revalidatePath("/recommendations");
  revalidatePath(`/pages/${pageId}`);
  redirect(`/pages/${pageId}`);
}

export async function generateIssueRecommendations(formData: FormData) {
  const issueId = getRequiredString(formData, "issueId");

  await generateIssueAiRecommendations(issueId);

  revalidatePath("/recommendations");
  revalidatePath(`/issues/${issueId}`);
  redirect(`/issues/${issueId}`);
}

export async function generateTemplateFixBrief(formData: FormData) {
  const domainId = getRequiredString(formData, "domainId");
  const templateKey = getRequiredString(formData, "templateKey");

  await generateTemplateAiFixBrief({ domainId, templateKey });

  revalidatePath("/recommendations");
  revalidatePath("/issues");
  redirect(`/issues?templateKey=${encodeURIComponent(templateKey)}`);
}

async function requirePrimaryWorkspace() {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before adding clients or domains.");
  }

  return workspace;
}

async function requireCurrentUserForAction() {
  return requireCurrentUser();
}

async function setSelectedWorkspace(workspaceId: string) {
  const cookieStore = await cookies();
  cookieStore.set(selectedWorkspaceCookieName, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return value.trim();
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  return origin;
}

function getDateOrDefault(formData: FormData, key: string, fallback: Date) {
  const value = getOptionalString(formData, key);

  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date;
}

function getVerificationMethod(formData: FormData) {
  const method = getOptionalString(formData, "method")?.toUpperCase();

  if (
    method === "DNS_TXT" ||
    method === "HTML_FILE" ||
    method === "META_TAG" ||
    method === "GSC_OAUTH"
  ) {
    return method;
  }

  return "DNS_TXT";
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function getRemainingDomainSlots(workspaceId: string) {
  const [plan, domainsUsed] = await Promise.all([
    getWorkspacePlanLimits(workspaceId),
    getPrisma().domain.count({
      where: { archivedAt: null, workspaceId },
    }),
  ]);

  return Math.max(0, plan.domainLimit - domainsUsed);
}
