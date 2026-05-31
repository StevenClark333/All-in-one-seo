import { NextRequest, NextResponse } from "next/server";

export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function getRequestBase(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin) {
    return origin;
  }

  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : request.url;
}

export function redirectToPath(
  request: NextRequest,
  path: string,
  params: Record<string, string> = {},
) {
  const url = new URL(path, getRequestBase(request));

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url, 303);
}
