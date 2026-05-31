import { completeGoogleAnalyticsOAuth } from "@/lib/google-analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return Response.redirect(
      new URL("/integrations?ga=error", requestUrl.origin),
    );
  }

  if (!code || !state) {
    return Response.redirect(
      new URL("/integrations?ga=missing_code", requestUrl.origin),
    );
  }

  await completeGoogleAnalyticsOAuth({
    code,
    origin: requestUrl.origin,
    state,
  });

  return Response.redirect(
    new URL("/integrations?ga=connected", requestUrl.origin),
  );
}
