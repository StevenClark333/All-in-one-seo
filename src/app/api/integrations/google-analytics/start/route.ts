import { createGoogleAnalyticsAuthUrl } from "@/lib/google-analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = await createGoogleAnalyticsAuthUrl(new URL(request.url).origin);

  return Response.redirect(url);
}
