import { AlertChannel, IssueSeverity } from "@prisma/client";
import { assertCrawlUrlIsSafe } from "@/lib/crawler-security";
import { logger } from "@/lib/logger";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { getWorkspaceSlackWebhookUrl } from "@/lib/slack";
import { getPrimaryWorkspace } from "@/lib/workspace";

const severityRank: Record<IssueSeverity, number> = {
  CRITICAL: 3,
  WARNING: 2,
  SUGGESTION: 1,
};

export async function getAlertCenterData() {
  if (!hasDatabaseUrl()) {
    return { workspace: null, clients: [], domains: [], rules: [], alerts: [] };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { workspace: null, clients: [], domains: [], rules: [], alerts: [] };
  }

  const [clients, domains, rules, alerts] = await Promise.all([
    getPrisma().client.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: "asc" },
    }),
    getPrisma().domain.findMany({
      where: { workspaceId: workspace.id },
      include: { client: true },
      orderBy: { domain: "asc" },
    }),
    getPrisma().alertRule.findMany({
      where: { workspaceId: workspace.id },
      include: {
        client: true,
        domain: true,
        alerts: { take: 3, orderBy: { createdAt: "desc" } },
      },
      orderBy: [{ enabled: "desc" }, { createdAt: "desc" }],
    }),
    getPrisma().alert.findMany({
      where: { workspaceId: workspace.id },
      include: {
        alertRule: true,
        domain: true,
        page: true,
        changeEvent: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return { workspace, clients, domains, rules, alerts };
}

export async function createAlertRule({
  channel,
  clientId,
  domainId,
  eventType,
  escalationChannel,
  escalationTargetEmail,
  escalationTargetUrl,
  name,
  severityThreshold,
  targetEmail,
  targetUrl,
}: {
  channel: AlertChannel;
  clientId?: string;
  domainId?: string;
  eventType: string;
  escalationChannel?: AlertChannel;
  escalationTargetEmail?: string;
  escalationTargetUrl?: string;
  name: string;
  severityThreshold: IssueSeverity;
  targetEmail?: string;
  targetUrl?: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before creating alert rules.");
  }

  return getPrisma().alertRule.create({
    data: {
      workspaceId: workspace.id,
      clientId,
      domainId,
      eventType,
      name,
      severityThreshold,
      channel,
      targetEmail: channel === "EMAIL" ? targetEmail : undefined,
      targetUrl: channel === "EMAIL" ? undefined : targetUrl,
      escalationChannel,
      escalationTargetEmail:
        escalationChannel === "EMAIL" ? escalationTargetEmail : undefined,
      escalationTargetUrl:
        escalationChannel && escalationChannel !== "EMAIL"
          ? escalationTargetUrl
          : undefined,
    },
  });
}

export async function evaluateAlertRules() {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before evaluating alerts.");
  }

  const rules = await getPrisma().alertRule.findMany({
    where: { workspaceId: workspace.id, enabled: true },
    include: { client: { include: { domains: true } } },
  });

  let created = 0;

  for (const rule of rules) {
    const domainIds = getRuleDomainIds(rule);

    const events = await getPrisma().changeEvent.findMany({
      where: {
        domainId: domainIds ? { in: domainIds } : undefined,
        domain: { workspaceId: workspace.id },
        changeType:
          rule.eventType === "ANY_CRITICAL_CHANGE" ? undefined : rule.eventType,
        severity: { in: severitiesAtOrAbove(rule.severityThreshold) },
        alerts: { none: { alertRuleId: rule.id } },
      },
      take: 25,
      orderBy: { createdAt: "desc" },
    });

    for (const event of events) {
      const delivery = await deliverAlert({
        channel: rule.channel,
        subject: `${rule.name}: ${event.changeType}`,
        body: `A ${event.severity.toLowerCase()} SEO change was detected for domain ${event.domainId}.`,
        targetEmail: rule.targetEmail,
        targetUrl: rule.targetUrl,
        workspaceId: workspace.id,
      });
      const escalation =
        delivery.status === "SENT" || !rule.escalationChannel
          ? null
          : await deliverAlert({
              channel: rule.escalationChannel,
              subject: `Escalated ${rule.name}: ${event.changeType}`,
              body: `Primary ${rule.channel.toLowerCase()} alert delivery failed. ${event.severity.toLowerCase()} SEO change was detected for domain ${event.domainId}.`,
              targetEmail: rule.escalationTargetEmail,
              targetUrl: rule.escalationTargetUrl,
              workspaceId: workspace.id,
            });
      const finalDelivery = escalation ?? delivery;

      await getPrisma().alert.create({
        data: {
          alertRuleId: rule.id,
          workspaceId: workspace.id,
          domainId: event.domainId,
          pageId: event.pageId,
          eventId: event.id,
          status: finalDelivery.status,
          sentAt: finalDelivery.status === "SENT" ? new Date() : null,
          escalatedAt: escalation ? new Date() : null,
        },
      });
      created += 1;
    }
  }

  return { created };
}

async function deliverAlert({
  body,
  channel,
  subject,
  targetEmail,
  targetUrl,
  workspaceId,
}: {
  body: string;
  channel: AlertChannel;
  subject: string;
  targetEmail: string | null;
  targetUrl: string | null;
  workspaceId: string;
}) {
  if (channel === "SLACK") {
    return deliverJsonAlert({
      channel,
      payload: buildSlackAlertPayload(subject, body),
      targetUrl: targetUrl ?? (await getWorkspaceSlackWebhookUrl(workspaceId)),
    });
  }

  if (channel === "TEAMS") {
    return deliverJsonAlert({
      channel,
      payload: buildTeamsAlertPayload(subject, body),
      targetUrl,
    });
  }

  if (channel === "WEBHOOK") {
    return deliverJsonAlert({
      channel,
      payload: buildWebhookAlertPayload(subject, body),
      targetUrl,
    });
  }

  if (channel !== "EMAIL") {
    return { status: "PENDING" as const };
  }

  const recipient =
    targetEmail ?? (await getPrimaryAlertRecipient(workspaceId));
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL;

  if (!recipient || !apiKey || !from) {
    logger.warn(
      "Email alert delivery skipped because email environment is incomplete.",
      {
        hasRecipient: Boolean(recipient),
        hasApiKey: Boolean(apiKey),
        hasFrom: Boolean(from),
      },
    );
    return { status: "FAILED" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipient,
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    logger.error("Email alert delivery failed.", {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return { status: response.ok ? ("SENT" as const) : ("FAILED" as const) };
}

async function deliverJsonAlert({
  channel,
  payload,
  targetUrl,
}: {
  channel: Exclude<AlertChannel, "EMAIL">;
  payload: Record<string, unknown>;
  targetUrl: string | null;
}) {
  if (!targetUrl) {
    logger.warn(
      `${channel} alert delivery skipped because target URL is not configured.`,
    );
    return { status: "FAILED" as const };
  }

  if (!(await isSafeAlertDestinationUrl(targetUrl))) {
    logger.warn(
      `${channel} alert delivery skipped because target URL is unsafe.`,
    );
    return { status: "FAILED" as const };
  }

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    logger.error(`${channel} alert delivery failed.`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return { status: response.ok ? ("SENT" as const) : ("FAILED" as const) };
}

export function buildSlackAlertPayload(subject: string, body: string) {
  return {
    text: `*${subject}*\n${body}`,
  };
}

export function buildTeamsAlertPayload(subject: string, body: string) {
  return {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: subject,
    title: subject,
    text: body,
  };
}

export function buildWebhookAlertPayload(subject: string, body: string) {
  return {
    subject,
    body,
    source: "all-in-one-seo",
  };
}

export async function isSafeAlertDestinationUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") {
    return false;
  }

  try {
    await assertCrawlUrlIsSafe(value);
  } catch {
    return false;
  }

  return true;
}

async function getPrimaryAlertRecipient(workspaceId: string) {
  const member = await getPrisma().workspaceMember.findFirst({
    where: { workspaceId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return member?.user.email ?? null;
}

export function getRuleDomainIds(rule: {
  domainId: string | null;
  client: { domains: Array<{ id: string }> } | null;
}) {
  if (rule.domainId) {
    return [rule.domainId];
  }

  if (rule.client?.domains.length) {
    return rule.client.domains.map((domain) => domain.id);
  }

  return null;
}

export function severitiesAtOrAbove(threshold: IssueSeverity) {
  return (Object.keys(severityRank) as IssueSeverity[]).filter(
    (severity) => severityRank[severity] >= severityRank[threshold],
  );
}
