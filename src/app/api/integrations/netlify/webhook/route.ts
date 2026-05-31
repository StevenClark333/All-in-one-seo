import {
  ApiProtectionError,
  apiProtectionResponse,
  readLimitedText,
  requireRequestRateLimit,
} from "@/lib/api-protection";
import {
  DeploymentWebhookError,
  ingestNetlifyDeploymentWebhook,
} from "@/lib/deployment-checks";

export const dynamic = "force-dynamic";

const maxPayloadBytes = 131_072;

export async function POST(request: Request) {
  let rawBody: string;

  try {
    requireRequestRateLimit({
      limit: 180,
      prefix: "netlify-webhook",
      request,
    });
    rawBody = await readLimitedText(request, maxPayloadBytes);

    const check = await ingestNetlifyDeploymentWebhook({
      rawBody,
      signature: request.headers.get("x-webhook-signature"),
    });

    return Response.json({ id: check.id, ok: true });
  } catch (error) {
    if (error instanceof DeploymentWebhookError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ApiProtectionError) {
      return apiProtectionResponse(error);
    }

    throw error;
  }
}
