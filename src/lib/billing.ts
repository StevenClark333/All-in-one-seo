import { addDays } from "@/lib/date-utils";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

export const billingProvider = {
  key: "STRIPE",
  name: "Stripe Billing",
  portal: "Stripe Customer Portal",
};

export type PlanKey = "agency" | "agency_pro" | "growth" | "starter";

export const planCatalog = [
  {
    aiRecommendationLimit: 100,
    crawlFrequency: "WEEKLY",
    description:
      "For one business website getting a gentle weekly care check.",
    domainLimit: 1,
    key: "starter",
    monthlyPriceCents: 2900,
    name: "Starter",
    pageCrawlLimit: 500,
    renderedCrawling: false,
    reportLimit: 4,
    teamSeatLimit: 2,
    trialDays: 14,
    whiteLabelReports: false,
  },
  {
    aiRecommendationLimit: 750,
    crawlFrequency: "DAILY",
    description:
      "For growing teams keeping several websites checked every day.",
    domainLimit: 5,
    key: "growth",
    monthlyPriceCents: 9900,
    name: "Growth",
    pageCrawlLimit: 5000,
    renderedCrawling: true,
    reportLimit: 20,
    teamSeatLimit: 8,
    trialDays: 14,
    whiteLabelReports: false,
  },
  {
    aiRecommendationLimit: 3000,
    crawlFrequency: "DAILY",
    description:
      "For agencies caring for client websites, reports, and connected tools.",
    domainLimit: 25,
    key: "agency",
    monthlyPriceCents: 24900,
    name: "Agency",
    pageCrawlLimit: 50000,
    renderedCrawling: true,
    reportLimit: 100,
    teamSeatLimit: 20,
    trialDays: 14,
    whiteLabelReports: true,
  },
  {
    aiRecommendationLimit: 10000,
    crawlFrequency: "DAILY",
    description:
      "For larger agencies needing high-volume website care and white-label handoffs.",
    domainLimit: 100,
    key: "agency_pro",
    monthlyPriceCents: 59900,
    name: "Agency Pro",
    pageCrawlLimit: 250000,
    renderedCrawling: true,
    reportLimit: 500,
    teamSeatLimit: 50,
    trialDays: 14,
    whiteLabelReports: true,
  },
] as const;

export async function getBillingPageData() {
  if (!hasDatabaseUrl()) {
    return { plans: planCatalog, subscription: null, workspace: null };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { plans: planCatalog, subscription: null, workspace: null };
  }

  await ensureBillingPlans();

  const [plans, subscription, usage] = await Promise.all([
    getPrisma().billingPlan.findMany({
      where: { active: true },
      orderBy: { monthlyPriceCents: "asc" },
    }),
    getPrisma().workspaceSubscription.findFirst({
      where: { workspaceId: workspace.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    getWorkspaceUsage(workspace.id),
  ]);

  return { plans, subscription, usage, workspace };
}

export async function getWorkspaceUsage(workspaceId: string) {
  const monthStart = getMonthStart();
  const [domains, pages, aiRecommendations, teamSeats, reports] =
    await Promise.all([
      getPrisma().domain.count({ where: { workspaceId } }),
      getPrisma().page.count({ where: { domain: { workspaceId } } }),
      getPrisma().aiUsageEvent.count({
        where: { workspaceId, createdAt: { gte: monthStart } },
      }),
      getBillableTeamSeatCount(workspaceId),
      getPrisma().report.count({
        where: { workspaceId, createdAt: { gte: monthStart } },
      }),
    ]);

  return { aiRecommendations, domains, pages, reports, teamSeats };
}

export async function startPlanTrial(planKey: string) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before starting a trial.");
  }

  await ensureBillingPlans();

  const plan = await getPrisma().billingPlan.findUnique({
    where: { key: planKey },
  });

  if (!plan || !plan.active) {
    throw new Error("Billing plan is not available.");
  }

  const trialEndsAt = addDays(new Date(), plan.trialDays);
  const existingSubscription =
    await getPrisma().workspaceSubscription.findFirst({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });

  await getPrisma().workspace.update({
    where: { id: workspace.id },
    data: { plan: plan.key },
  });

  if (existingSubscription) {
    return getPrisma().workspaceSubscription.update({
      where: { id: existingSubscription.id },
      data: {
        billingProvider: billingProvider.key,
        currentPeriodEndsAt: trialEndsAt,
        planId: plan.id,
        status: "TRIALING",
        trialEndsAt,
      },
    });
  }

  return getPrisma().workspaceSubscription.create({
    data: {
      billingProvider: billingProvider.key,
      currentPeriodEndsAt: trialEndsAt,
      planId: plan.id,
      status: "TRIALING",
      trialEndsAt,
      workspaceId: workspace.id,
    },
  });
}

export async function getWorkspacePlanLimits(workspaceId: string) {
  await ensureBillingPlans();

  const subscription = await getPrisma().workspaceSubscription.findFirst({
    where: { workspaceId },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (subscription?.plan) {
    return subscription.plan;
  }

  const workspace = await getPrisma().workspace.findUnique({
    where: { id: workspaceId },
  });
  const planKey = workspace?.plan || "starter";
  const plan = await getPrisma().billingPlan.findUnique({
    where: { key: planKey },
  });

  if (plan) {
    return plan;
  }

  const starterPlan = await getPrisma().billingPlan.findUnique({
    where: { key: "starter" },
  });

  if (!starterPlan) {
    throw new Error("Starter billing plan is not configured.");
  }

  return starterPlan;
}

export async function assertCanCreateDomain(workspaceId: string) {
  const [plan, domainsUsed] = await Promise.all([
    getWorkspacePlanLimits(workspaceId),
    getPrisma().domain.count({ where: { archivedAt: null, workspaceId } }),
  ]);

  if (domainsUsed >= plan.domainLimit) {
    throw new BillingLimitError(
      `Domain limit reached for ${plan.name}. Upgrade to add more domains.`,
      "DOMAIN_LIMIT",
    );
  }
}

export async function assertCanUseCrawlFrequency({
  frequency,
  workspaceId,
}: {
  frequency: string;
  workspaceId: string;
}) {
  const plan = await getWorkspacePlanLimits(workspaceId);

  if (!isCrawlFrequencyAllowed(frequency, plan.crawlFrequency)) {
    throw new BillingLimitError(
      `${frequency.toLowerCase()} crawls are not available on ${plan.name}.`,
      "CRAWL_FREQUENCY_LIMIT",
    );
  }
}

export async function assertCanStartCrawl(domainId: string) {
  const domain = await getPrisma().domain.findUnique({
    where: { id: domainId },
    include: {
      pages: { select: { id: true } },
      verifications: {
        where: { status: "VERIFIED" },
        take: 1,
      },
    },
  });

  if (!domain) {
    throw new Error("Domain not found.");
  }

  if (
    domain.verificationStatus !== "VERIFIED" &&
    domain.verifications.length === 0
  ) {
    throw new BillingLimitError(
      "Domain must be verified before running a full crawl.",
      "DOMAIN_NOT_VERIFIED",
    );
  }

  const plan = await getWorkspacePlanLimits(domain.workspaceId);

  if (domain.pages.length >= plan.pageCrawlLimit) {
    throw new BillingLimitError(
      `Page crawl limit reached for ${plan.name}. Upgrade to crawl more pages.`,
      "PAGE_CRAWL_LIMIT",
    );
  }

  await assertCanUseCrawlFrequency({
    frequency: domain.crawlFrequency,
    workspaceId: domain.workspaceId,
  });
}

export async function assertCanUseAi(workspaceId: string) {
  const [plan, used] = await Promise.all([
    getWorkspacePlanLimits(workspaceId),
    getPrisma().aiUsageEvent.count({
      where: { workspaceId, createdAt: { gte: getMonthStart() } },
    }),
  ]);

  if (used >= plan.aiRecommendationLimit) {
    throw new BillingLimitError(
      `AI usage limit reached for ${plan.name}. Upgrade for more recommendations.`,
      "AI_USAGE_LIMIT",
    );
  }
}

export async function getAiUsageLimit(workspaceId: string) {
  const plan = await getWorkspacePlanLimits(workspaceId);
  return plan.aiRecommendationLimit;
}

export async function assertCanCreateReport(workspaceId: string) {
  const plan = await getWorkspacePlanLimits(workspaceId);
  const monthStart = getMonthStart();
  const reportsUsed = await getPrisma().report.count({
    where: { workspaceId, createdAt: { gte: monthStart } },
  });

  if (reportsUsed >= plan.reportLimit) {
    throw new BillingLimitError(
      `Report limit reached for ${plan.name}. Upgrade for more reports.`,
      "REPORT_LIMIT",
    );
  }
}

export async function assertCanAddTeamSeat(workspaceId: string) {
  const [plan, seatsUsed] = await Promise.all([
    getWorkspacePlanLimits(workspaceId),
    getBillableTeamSeatCount(workspaceId),
  ]);

  if (seatsUsed >= plan.teamSeatLimit) {
    throw new BillingLimitError(
      `Team seat limit reached for ${plan.name}. Upgrade to invite more teammates.`,
      "TEAM_SEAT_LIMIT",
    );
  }
}

export async function getBillableTeamSeatCount(workspaceId: string) {
  const [members, pendingInvitations] = await Promise.all([
    getPrisma().workspaceMember.count({ where: { workspaceId } }),
    getPrisma().workspaceInvitation.count({
      where: { workspaceId, status: "PENDING" },
    }),
  ]);

  return members + pendingInvitations;
}

export function formatPlanPrice(monthlyPriceCents: number) {
  return `$${Math.round(monthlyPriceCents / 100).toLocaleString()}/mo`;
}

export function getPlanStripePriceId(plan: {
  key: string;
  stripePriceId?: string | null;
}) {
  return plan.stripePriceId || process.env[getPlanStripePriceEnvKey(plan.key)];
}

export function getPlanStripePriceEnvKey(planKey: string) {
  return `STRIPE_PRICE_${planKey.toUpperCase()}`;
}

export function trialStatusLabel(
  subscription: { status: string; trialEndsAt: Date | null } | null,
  now = new Date(),
) {
  if (!subscription) {
    return "No trial started";
  }

  if (subscription.status !== "TRIALING" || !subscription.trialEndsAt) {
    return formatStatus(subscription.status);
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (subscription.trialEndsAt.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  return `${daysRemaining} trial days remaining`;
}

export function isCrawlFrequencyAllowed(
  requestedFrequency: string,
  planFrequency: string,
) {
  const rank: Record<string, number> = {
    MANUAL: 0,
    WEEKLY: 1,
    CUSTOM: 1,
    DAILY: 2,
  };

  return (
    (rank[requestedFrequency.toUpperCase()] ?? 0) <=
    (rank[planFrequency.toUpperCase()] ?? 0)
  );
}

export function getMonthStart(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function ensureBillingPlans() {
  await Promise.all(
    planCatalog.map((plan) =>
      getPrisma().billingPlan.upsert({
        where: { key: plan.key },
        create: plan,
        update: plan,
      }),
    ),
  );
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export class BillingLimitError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}
