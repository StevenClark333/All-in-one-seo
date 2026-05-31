import { completeGoogleSearchConsoleOAuth } from "@/lib/google-search-console";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return Response.redirect(
      new URL(`/integrations?gsc=error`, requestUrl.origin),
    );
  }

  if (!code || !state) {
    return Response.redirect(
      new URL(`/integrations?gsc=missing_code`, requestUrl.origin),
    );
  }

  await completeGoogleSearchConsoleOAuth({
    code,
    origin: requestUrl.origin,
    state,
  });

  return Response.redirect(
    new URL(`/integrations?gsc=connected`, requestUrl.origin),
  );
}
