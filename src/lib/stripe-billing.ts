import Stripe from "stripe";
import { getCurrentUser } from "@/lib/auth";
import { ensureBillingPlans, getPlanStripePriceId } from "@/lib/billing";
import { getPrisma } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe billing.");
  }

  stripeClient ??= new Stripe(secretKey, { typescript: true });

  return stripeClient;
}

export async function createStripeCheckoutSession(
  planKey: string,
  origin: string,
) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before starting checkout.");
  }

  await ensureBillingPlans();

  const plan = await getPrisma().billingPlan.findUnique({
    where: { key: planKey },
  });

  if (!plan || !plan.active) {
    throw new Error("Billing plan is not available.");
  }

  const priceId = getPlanStripePriceId(plan);

  if (!priceId) {
    throw new Error(`Stripe price ID is not configured for ${plan.name}.`);
  }

  const user = await getCurrentUser();
  const subscription = await getPrisma().workspaceSubscription.findFirst({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });
  const stripe = getStripeClient();
  const customerId =
    subscription?.stripeCustomerId ??
    (
      await stripe.customers.create({
        email: user?.email,
        metadata: { workspaceId: workspace.id },
        name: workspace.name,
      })
    ).id;

  if (!subscription?.stripeCustomerId) {
    const localPlanSubscription = subscription
      ? await getPrisma().workspaceSubscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        })
      : await getPrisma().workspaceSubscription.create({
          data: {
            billingProvider: "STRIPE",
            planId: plan.id,
            status: "CHECKOUT_STARTED",
            stripeCustomerId: customerId,
            workspaceId: workspace.id,
          },
        });

    if (!subscription && localPlanSubscription.planId !== plan.id) {
      await getPrisma().workspaceSubscription.update({
        where: { id: localPlanSubscription.id },
        data: { planId: plan.id },
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    cancel_url: `${origin}/billing?checkout=cancelled`,
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      planKey: plan.key,
      workspaceId: workspace.id,
    },
    mode: "subscription",
    subscription_data: {
      metadata: {
        planKey: plan.key,
        workspaceId: workspace.id,
      },
      trial_period_days: plan.trialDays,
    },
    success_url: `${origin}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return session.url;
}

export async function createStripePortalSession(origin: string) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before opening billing management.");
  }

  const subscription = await getPrisma().workspaceSubscription.findFirst({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription?.stripeCustomerId) {
    throw new Error("Stripe customer is not connected yet.");
  }

  const session = await getStripeClient().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${origin}/billing`,
  });

  return session.url;
}

export async function handleStripeWebhookEvent(
  rawBody: string,
  signature: string | null,
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required for Stripe webhooks.");
  }

  if (!signature) {
    throw new Error("Stripe signature is missing.");
  }

  const event = getStripeClient().webhooks.constructEvent(
    rawBody,
    signature,
    webhookSecret,
  );

  await applyStripeBillingEvent(event);

  return event;
}

export async function applyStripeBillingEvent(event: Stripe.Event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const workspaceId = session.metadata?.workspaceId;
    const planKey = session.metadata?.planKey;

    if (!workspaceId || !planKey) {
      return;
    }

    await updateWorkspaceSubscriptionFromStripe({
      currentPeriodEndsAt: null,
      customerId:
        typeof session.customer === "string" ? session.customer : undefined,
      planKey,
      status: "ACTIVE",
      subscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : undefined,
      trialEndsAt: null,
      workspaceId,
    });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const workspaceId = subscription.metadata?.workspaceId;
    const planKey = subscription.metadata?.planKey;

    if (!workspaceId || !planKey) {
      return;
    }

    await updateWorkspaceSubscriptionFromStripe({
      currentPeriodEndsAt: readStripeTimestampField(
        subscription,
        "current_period_end",
      ),
      customerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : undefined,
      planKey,
      status: normalizeStripeSubscriptionStatus(subscription.status),
      subscriptionId: subscription.id,
      trialEndsAt: readStripeTimestampField(subscription, "trial_end"),
      workspaceId,
    });
  }

  if (
    event.type === "invoice.payment_failed" ||
    event.type === "invoice.payment_succeeded"
  ) {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId =
      typeof invoice.customer === "string" ? invoice.customer : undefined;

    if (!customerId) {
      return;
    }

    await getPrisma().workspaceSubscription.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        status:
          event.type === "invoice.payment_succeeded" ? "ACTIVE" : "PAST_DUE",
      },
    });
  }
}

export function normalizeStripeSubscriptionStatus(status: string) {
  const map: Record<string, string> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    incomplete: "INCOMPLETE",
    incomplete_expired: "INCOMPLETE_EXPIRED",
    past_due: "PAST_DUE",
    paused: "PAUSED",
    trialing: "TRIALING",
    unpaid: "UNPAID",
  };

  return map[status] ?? status.toUpperCase();
}

async function updateWorkspaceSubscriptionFromStripe({
  currentPeriodEndsAt,
  customerId,
  planKey,
  status,
  subscriptionId,
  trialEndsAt,
  workspaceId,
}: {
  currentPeriodEndsAt: Date | null;
  customerId?: string;
  planKey: string;
  status: string;
  subscriptionId?: string;
  trialEndsAt: Date | null;
  workspaceId: string;
}) {
  await ensureBillingPlans();

  const plan = await getPrisma().billingPlan.findUnique({
    where: { key: planKey },
  });

  if (!plan) {
    return;
  }

  const existingSubscription =
    await getPrisma().workspaceSubscription.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

  await getPrisma().workspace.update({
    where: { id: workspaceId },
    data: { plan: plan.key },
  });

  const data = {
    billingProvider: "STRIPE",
    currentPeriodEndsAt,
    planId: plan.id,
    status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    trialEndsAt,
  };

  if (existingSubscription) {
    await getPrisma().workspaceSubscription.update({
      where: { id: existingSubscription.id },
      data,
    });
    return;
  }

  await getPrisma().workspaceSubscription.create({
    data: {
      ...data,
      workspaceId,
    },
  });
}

function readStripeTimestamp(value: number | null | undefined) {
  return value ? new Date(value * 1000) : null;
}

function readStripeTimestampField(value: object, key: string) {
  const item = (value as Record<string, unknown>)[key];

  return readStripeTimestamp(typeof item === "number" ? item : null);
}
