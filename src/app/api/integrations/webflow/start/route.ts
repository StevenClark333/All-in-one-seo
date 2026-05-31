import { createWebflowAuthUrl } from "@/lib/webflow";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  try {
    const url = await createWebflowAuthUrl(requestUrl.origin);

    return Response.redirect(url);
  } catch {
    return Response.redirect(
      new URL("/integrations?webflow=error", requestUrl.origin),
    );
  }
}
