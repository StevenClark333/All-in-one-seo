import { completeShopifyOAuth } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const shop = requestUrl.searchParams.get("shop");
  const state = requestUrl.searchParams.get("state");

  if (!code || !shop || !state) {
    return Response.redirect(
      new URL("/integrations?shopify=missing_code", requestUrl.origin),
    );
  }

  try {
    await completeShopifyOAuth({
      code,
      origin: requestUrl.origin,
      query: requestUrl.searchParams,
      shop,
      state,
    });

    return Response.redirect(
      new URL("/integrations?shopify=connected", requestUrl.origin),
    );
  } catch {
    return Response.redirect(
      new URL("/integrations?shopify=error", requestUrl.origin),
    );
  }
}
