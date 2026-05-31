import {
  ApiProtectionError,
  apiProtectionResponse,
  readLimitedText,
  requireRequestRateLimit,
} from "@/lib/api-protection";
import {
  DeploymentWebhookError,
  ingestVercelDeploymentWebhook,
} from "@/lib/deployment-checks";

export const dynamic = "force-dynamic";

const maxPayloadBytes = 131_072;

export async function POST(request: Request) {
  let rawBody: string;

  try {
    requireRequestRateLimit({
      limit: 180,
      prefix: "vercel-webhook",
      request,
    });
    rawBody = await readLimitedText(request, maxPayloadBytes);

    const check = await ingestVercelDeploymentWebhook({
      rawBody,
      signature: request.headers.get("x-vercel-signature"),
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
