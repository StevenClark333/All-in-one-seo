import {
  ApiProtectionError,
  apiProtectionResponse,
  readLimitedText,
  requireRequestRateLimit,
} from "@/lib/api-protection";
import { handleStripeWebhookEvent } from "@/lib/stripe-billing";

export const dynamic = "force-dynamic";

const maxPayloadBytes = 262_144;

export async function POST(request: Request) {
  let rawBody: string;

  try {
    requireRequestRateLimit({
      limit: 120,
      prefix: "stripe-webhook",
      request,
    });
    rawBody = await readLimitedText(request, maxPayloadBytes);

    const event = await handleStripeWebhookEvent(
      rawBody,
      request.headers.get("stripe-signature"),
    );

    return Response.json({ id: event.id, received: true });
  } catch (error) {
    if (error instanceof ApiProtectionError) {
      return apiProtectionResponse(error);
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe webhook could not be processed.",
      },
      { status: 400 },
    );
  }
}
