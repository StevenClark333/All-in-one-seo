import { NextRequest } from "next/server";
import { logoutCurrentSession } from "@/lib/auth";
import { redirectToPath } from "@/lib/route-helpers";

export async function POST(request: NextRequest) {
  await logoutCurrentSession();

  return redirectToPath(request, "/login");
}
