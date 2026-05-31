import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth-constants";
import {
  consumeAuthRateLimit,
  getNextFailedLoginState,
  isAccountLocked,
  normalizeAuthEmail,
} from "@/lib/auth-security";
import { verifyPassword } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";
import {
  getFormString,
  getRequestBase,
  redirectToPath,
} from "@/lib/route-helpers";

const sessionDays = 14;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");

  if (!email || !password) {
    return redirectToLogin(request, "invalid");
  }

  const normalizedEmail = normalizeAuthEmail(email);

  if (!consumeAuthRateLimit(`login:${normalizedEmail}`)) {
    return redirectToLogin(request, "rate-limited");
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { workspaceMembers: true },
  });

  if (user && isAccountLocked(user.lockedUntil)) {
    return redirectToLogin(request, "locked");
  }

  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: getNextFailedLoginState(user.failedLoginCount),
      });
    }

    return redirectToLogin(request, "invalid");
  }

  if (user.failedLoginCount || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + sessionDays);

  await prisma.authSession.create({
    data: {
      expiresAt,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      userId: user.id,
    },
  });

  const workspaceId = user.workspaceMembers.at(0)?.workspaceId;

  if (workspaceId) {
    await prisma.auditLog.create({
      data: {
        action: "auth.login",
        entityId: user.id,
        entityType: "user",
        userId: user.id,
        workspaceId,
      },
    });
  }

  const response = NextResponse.redirect(
    new URL("/", getRequestBase(request)),
    303,
  );
  response.cookies.set(sessionCookieName, token, {
    expires: expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function redirectToLogin(request: NextRequest, error: string) {
  return redirectToPath(request, "/login", { error });
}
