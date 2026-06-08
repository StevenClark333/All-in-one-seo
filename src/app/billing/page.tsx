import { CreditCard, Gauge, ShieldCheck } from "lucide-react";
import {
  openStripePortalAction,
  startBillingTrialAction,
  startStripeCheckoutAction,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import {
  billingProvider,
  formatPlanPrice,
  getBillingPageData,
  getPlanStripePriceId,
  trialStatusLabel,
} from "@/lib/billing";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { plans, subscription, usage, workspace } = await getBillingPageData();
  const workspacePlanKey = workspace?.plan?.toLowerCase();
  const currentPlan =
    subscription?.plan ??
    plans.find((plan) => plan.key === workspacePlanKey) ??
    plans.at(0);
  const nearLimitCount =
    usage && currentPlan
      ? getUsageItems(usage, currentPlan).filter((item) => item.percent >= 80)
          .length
      : 0;

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Billing" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Plan and usage
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                See what is included, how much room is left, and where to change
                billing details when you need to.
              </p>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <CreditCard className="size-4" aria-hidden="true" />
              Billing by {billingProvider.name}
            </div>
          </header>

          <BillingComfortPlan
            currentPlanName={
              subscription?.plan.name ?? workspace?.plan ?? currentPlan?.name
            }
            hasStripeCustomer={Boolean(subscription?.stripeCustomerId)}
            nearLimitCount={nearLimitCount}
            planCount={plans.length}
            trialLabel={trialStatusLabel(subscription ?? null)}
          />

          <section
            id="current-plan"
            className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="size-5 text-slate-500"
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold">What you have now</h3>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <Meta
                label="Plan"
                value={subscription?.plan.name ?? workspace?.plan ?? "Not set"}
              />
              <Meta
                label="Plan state"
                value={
                  subscription ? formatEnum(subscription.status) : "Manual"
                }
              />
              <Meta
                label="Trial"
                value={trialStatusLabel(subscription ?? null)}
              />
              <Meta label="Billing help" value={billingProvider.portal} />
            </div>
            {subscription?.stripeCustomerId ? (
              <form action={openStripePortalAction} className="mt-5">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Open billing portal
                </button>
              </form>
            ) : null}
          </section>

          {usage && currentPlan ? (
            <section
              id="usage"
              className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Gauge className="size-5 text-slate-500" aria-hidden="true" />
                <h3 className="text-lg font-semibold">Room left this month</h3>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <UsageMeter
                  label="Websites"
                  limit={currentPlan.domainLimit}
                  used={usage.domains}
                />
                <UsageMeter
                  label="Pages checked"
                  limit={currentPlan.pageCrawlLimit}
                  used={usage.pages}
                />
                <UsageMeter
                  label="Ideas and fixes"
                  limit={currentPlan.aiRecommendationLimit}
                  used={usage.aiRecommendations}
                />
                <UsageMeter
                  label="Seats"
                  limit={currentPlan.teamSeatLimit}
                  used={usage.teamSeats}
                />
                <UsageMeter
                  label="Client updates"
                  limit={currentPlan.reportLimit}
                  used={usage.reports}
                />
              </div>
            </section>
          ) : null}

          <section id="plans" className="mt-6">
            <div className="mb-4 flex flex-col gap-1">
              <p className="text-sm font-medium text-slate-500">
                Compare options
              </p>
              <h3 className="text-xl font-semibold tracking-normal">
                Pick the plan that matches your workload.
              </h3>
            </div>
            <div className="grid gap-4 xl:grid-cols-4">
              {plans.map((plan) => {
                const isCurrent = currentPlan?.key === plan.key;
                const stripePriceId = getPlanStripePriceId(plan);

                return (
                  <article
                    key={plan.key}
                    className={`rounded-lg border bg-white p-5 shadow-sm ${
                      isCurrent ? "border-orange-200" : "border-slate-200"
                    }`}
                  >
                    <div className="flex min-h-28 flex-col justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        {isCurrent ? (
                          <p className="mt-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                            Current plan
                          </p>
                        ) : null}
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {plan.description}
                        </p>
                      </div>
                      <p className="text-2xl font-semibold">
                        {formatPlanPrice(plan.monthlyPriceCents)}
                      </p>
                    </div>

                    <dl className="mt-5 grid gap-3 text-sm">
                      <PlanLimit label="Websites" value={plan.domainLimit} />
                      <PlanLimit
                        label="Pages checked"
                        value={plan.pageCrawlLimit.toLocaleString()}
                      />
                      <PlanLimit
                        label="Check rhythm"
                        value={formatCheckRhythm(plan.crawlFrequency)}
                      />
                      <PlanLimit
                        label="Ideas and fixes"
                        value={`${plan.aiRecommendationLimit.toLocaleString()}/mo`}
                      />
                      <PlanLimit
                        label="Team seats"
                        value={plan.teamSeatLimit}
                      />
                      <PlanLimit
                        label="Reports"
                        value={`${plan.reportLimit}/mo`}
                      />
                    </dl>

                    <form action={startBillingTrialAction} className="mt-5">
                      <input type="hidden" name="planKey" value={plan.key} />
                      <button
                        disabled={isCurrent}
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {isCurrent
                          ? "Current plan"
                          : `Try for ${plan.trialDays} days`}
                      </button>
                    </form>
                    <form action={startStripeCheckoutAction} className="mt-2">
                      <input type="hidden" name="planKey" value={plan.key} />
                      <button
                        disabled={!stripePriceId}
                        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {stripePriceId
                          ? "Choose this plan"
                          : "Plan setup needed"}
                      </button>
                    </form>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function BillingComfortPlan({
  currentPlanName,
  hasStripeCustomer,
  nearLimitCount,
  planCount,
  trialLabel,
}: {
  currentPlanName?: string;
  hasStripeCustomer: boolean;
  nearLimitCount: number;
  planCount: number;
  trialLabel: string;
}) {
  const plan = [
    {
      detail: currentPlanName
        ? "Your current plan is active here. Check room left before changing anything."
        : "Pick a plan only after you know how many websites, pages, reports, and teammates you need.",
      href: "#current-plan",
      label: currentPlanName ? "Your plan" : "Choose a plan",
      value: currentPlanName ?? "Not selected",
    },
    {
      detail: nearLimitCount
        ? "One or more areas is almost full. Check usage before adding more work."
        : "Your account has room left for more checks and updates.",
      href: "#usage",
      label: nearLimitCount ? "Check room left" : "Usage looks okay",
      value: nearLimitCount ? `${nearLimitCount} almost full` : "All calm",
    },
    {
      detail: hasStripeCustomer
        ? "Open the portal when you need invoices, payment details, or plan changes."
        : "Compare the options below when you are ready to try a plan.",
      href: hasStripeCustomer ? "#current-plan" : "#plans",
      label: hasStripeCustomer ? "Invoices and payment" : "Compare options",
      value: hasStripeCustomer ? "Portal ready" : `${planCount} plans`,
    },
  ];

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-600">
            Account comfort plan
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-normal">
            Know what is included before changing anything.
          </h3>
        </div>
        <span className="inline-flex w-fit items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
          {trialLabel}
        </span>
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

function PlanLimit({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function UsageMeter({
  label,
  limit,
  used,
}: {
  label: string;
  limit: number;
  used: number;
}) {
  const percent = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const isNearLimit = percent >= 80;

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-sm font-semibold text-slate-800">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${
            isNearLimit ? "bg-amber-500" : "bg-slate-950"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {isNearLimit ? (
        <p className="mt-2 text-xs font-medium text-amber-700">
          Upgrade recommended
        </p>
      ) : null}
    </div>
  );
}

function getUsageItems(
  usage: NonNullable<Awaited<ReturnType<typeof getBillingPageData>>["usage"]>,
  currentPlan: NonNullable<
    Awaited<ReturnType<typeof getBillingPageData>>["plans"][number]
  >,
) {
  return [
    {
      limit: currentPlan.domainLimit,
      used: usage.domains,
    },
    {
      limit: currentPlan.pageCrawlLimit,
      used: usage.pages,
    },
    {
      limit: currentPlan.aiRecommendationLimit,
      used: usage.aiRecommendations,
    },
    {
      limit: currentPlan.teamSeatLimit,
      used: usage.teamSeats,
    },
    {
      limit: currentPlan.reportLimit,
      used: usage.reports,
    },
  ].map((item) => ({
    ...item,
    percent: Math.min(
      100,
      Math.round((item.used / Math.max(item.limit, 1)) * 100),
    ),
  }));
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCheckRhythm(value: string) {
  if (value === "DAILY") {
    return "Every day";
  }

  if (value === "WEEKLY") {
    return "Every week";
  }

  if (value === "MANUAL") {
    return "Manual checks";
  }

  return formatEnum(value);
}
