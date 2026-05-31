import { createGoogleSearchConsoleAuthUrl } from "@/lib/google-search-console";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = await createGoogleSearchConsoleAuthUrl(
    new URL(request.url).origin,
  );

  return Response.redirect(url);
}
