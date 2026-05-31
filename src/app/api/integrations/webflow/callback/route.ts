import { completeWebflowOAuth } from "@/lib/webflow";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  if (!code || !state) {
    return Response.redirect(
      new URL("/integrations?webflow=missing_code", requestUrl.origin),
    );
  }

  try {
    await completeWebflowOAuth({
      code,
      origin: requestUrl.origin,
      state,
    });

    return Response.redirect(
      new URL("/integrations?webflow=connected", requestUrl.origin),
    );
  } catch {
    return Response.redirect(
      new URL("/integrations?webflow=error", requestUrl.origin),
    );
  }
}
