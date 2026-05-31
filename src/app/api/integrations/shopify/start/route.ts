import { createShopifyAuthUrl } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const shop = requestUrl.searchParams.get("shop");
  const domainId = requestUrl.searchParams.get("domainId");

  if (!shop) {
    return Response.redirect(
      new URL("/integrations?shopify=missing_shop", requestUrl.origin),
    );
  }

  try {
    const url = await createShopifyAuthUrl({
      domainId,
      origin: requestUrl.origin,
      shop,
    });

    return Response.redirect(url);
  } catch {
    return Response.redirect(
      new URL("/integrations?shopify=error", requestUrl.origin),
    );
  }
}
