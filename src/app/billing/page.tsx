import { CreditCard, ShieldCheck } from "lucide-react";
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
  const currentPlan = subscription?.plan ?? plans.at(0);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Billing" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Billing and plans
              </h2>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <CreditCard className="size-4" aria-hidden="true" />
              {billingProvider.name}
            </div>
          </header>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="size-5 text-slate-500"
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold">Current plan</h3>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <Meta
                label="Plan"
                value={subscription?.plan.name ?? workspace?.plan ?? "Not set"}
              />
              <Meta
                label="Status"
                value={
                  subscription ? formatEnum(subscription.status) : "Manual"
                }
              />
              <Meta
                label="Trial"
                value={trialStatusLabel(subscription ?? null)}
              />
              <Meta label="Provider" value={billingProvider.portal} />
            </div>
            {subscription?.stripeCustomerId ? (
              <form action={openStripePortalAction} className="mt-5">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Manage subscription and invoices
                </button>
              </form>
            ) : null}
          </section>

          {usage && currentPlan ? (
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <CreditCard
                  className="size-5 text-slate-500"
                  aria-hidden="true"
                />
                <h3 className="text-lg font-semibold">Usage this month</h3>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <UsageMeter
                  label="Domains"
                  limit={currentPlan.domainLimit}
                  used={usage.domains}
                />
                <UsageMeter
                  label="Pages"
                  limit={currentPlan.pageCrawlLimit}
                  used={usage.pages}
                />
                <UsageMeter
                  label="AI"
                  limit={currentPlan.aiRecommendationLimit}
                  used={usage.aiRecommendations}
                />
                <UsageMeter
                  label="Seats"
                  limit={currentPlan.teamSeatLimit}
                  used={usage.teamSeats}
                />
                <UsageMeter
                  label="Reports"
                  limit={currentPlan.reportLimit}
                  used={usage.reports}
                />
              </div>
            </section>
          ) : null}

          <section className="mt-6">
            <div className="grid gap-4 xl:grid-cols-4">
              {plans.map((plan) => {
                const isCurrent = subscription?.plan.key === plan.key;
                const stripePriceId = getPlanStripePriceId(plan);

                return (
                  <article
                    key={plan.key}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex min-h-28 flex-col justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {plan.description}
                        </p>
                      </div>
                      <p className="text-2xl font-semibold">
                        {formatPlanPrice(plan.monthlyPriceCents)}
                      </p>
                    </div>

                    <dl className="mt-5 grid gap-3 text-sm">
                      <PlanLimit label="Domains" value={plan.domainLimit} />
                      <PlanLimit
                        label="Crawled pages"
                        value={plan.pageCrawlLimit.toLocaleString()}
                      />
                      <PlanLimit
                        label="Crawl cadence"
                        value={formatEnum(plan.crawlFrequency)}
                      />
                      <PlanLimit
                        label="AI recommendations"
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
                          : `Start ${plan.trialDays}-day trial`}
                      </button>
                    </form>
                    <form action={startStripeCheckoutAction} className="mt-2">
                      <input type="hidden" name="planKey" value={plan.key} />
                      <button
                        disabled={!stripePriceId}
                        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {stripePriceId
                          ? "Subscribe with Stripe"
                          : "Add Stripe price ID"}
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
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
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

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
