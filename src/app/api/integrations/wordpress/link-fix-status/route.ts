import { NextRequest, NextResponse } from "next/server";
import { confirmWordPressLinkFixStatus } from "@/lib/link-fixes";

export async function POST(request: NextRequest) {
  const receiverKey = request.headers.get("x-all-in-one-seo-key") ?? "";
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const fixId = readString(payload, "fixId");
  const status = readString(payload, "status");
  const postId = readString(payload, "postId");

  if (!fixId || !status || !receiverKey) {
    return NextResponse.json(
      { error: "fixId, status, and receiver key are required." },
      { status: 400 },
    );
  }

  try {
    const result = await confirmWordPressLinkFixStatus({
      fixId,
      postId,
      receiverKey,
      status,
    });

    return NextResponse.json({ accepted: true, ...result });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}

function readString(value: object, key: string) {
  return key in value && typeof value[key as keyof typeof value] === "string"
    ? String(value[key as keyof typeof value])
    : "";
}
