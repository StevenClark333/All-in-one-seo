import { createHash, randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookieName } from "@/lib/auth-constants";
import {
  consumeAuthToken,
  consumeAuthRateLimit,
  createAuthToken,
  getNextFailedLoginState,
  isAccountLocked,
  normalizeAuthEmail,
} from "@/lib/auth-security";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";

const sessionDays = 14;

export async function signUpWithPassword({
  email,
  name,
  password,
  workspaceName,
}: {
  email: string;
  name?: string;
  password: string;
  workspaceName: string;
}) {
  const normalizedEmail = normalizeAuthEmail(email);
  assertAuthRateLimit(`signup:${normalizedEmail}`);

  const user = await getPrisma().user.create({
    data: {
      email: normalizedEmail,
      name,
      passwordHash: hashPassword(password),
      workspaceMembers: {
        create: {
          role: "OWNER",
          workspace: {
            create: {
              name: workspaceName,
              type: "AGENCY",
              plan: "agency",
            },
          },
        },
      },
    },
    include: { workspaceMembers: true },
  });
  await createAuthToken({
    purpose: "EMAIL_VERIFICATION",
    userId: user.id,
  });

  await createSession(user.id);
  await writeAuditLog({
    workspaceId: user.workspaceMembers[0].workspaceId,
    userId: user.id,
    action: "auth.signup",
    entityType: "user",
    entityId: user.id,
  });
}

export async function loginWithPassword(email: string, password: string) {
  const normalizedEmail = normalizeAuthEmail(email);
  assertAuthRateLimit(`login:${normalizedEmail}`);

  const user = await getPrisma().user.findUnique({
    where: { email: normalizedEmail },
    include: { workspaceMembers: true },
  });

  if (user && isAccountLocked(user.lockedUntil)) {
    throw new Error("Account is temporarily locked. Try again later.");
  }

  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    if (user) {
      const nextState = getNextFailedLoginState(user.failedLoginCount);
      await getPrisma().user.update({
        where: { id: user.id },
        data: nextState,
      });
    }

    throw new Error("Invalid email or password.");
  }

  if (user.failedLoginCount || user.lockedUntil) {
    await getPrisma().user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }

  await createSession(user.id);

  const workspaceId = user.workspaceMembers.at(0)?.workspaceId;

  if (workspaceId) {
    await writeAuditLog({
      workspaceId,
      userId: user.id,
      action: "auth.login",
      entityType: "user",
      entityId: user.id,
    });
  }
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = normalizeAuthEmail(email);
  assertAuthRateLimit(`password-reset:${normalizedEmail}`);

  const user = await getPrisma().user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return null;
  }

  return createAuthToken({
    purpose: "PASSWORD_RESET",
    userId: user.id,
  });
}

export async function resetPasswordWithToken(token: string, password: string) {
  const authToken = await consumeAuthToken({
    purpose: "PASSWORD_RESET",
    token,
  });

  await getPrisma().user.update({
    where: { id: authToken.userId },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      passwordHash: hashPassword(password),
    },
  });
}

export async function verifyEmailWithToken(token: string) {
  const authToken = await consumeAuthToken({
    purpose: "EMAIL_VERIFICATION",
    token,
  });

  await getPrisma().user.update({
    where: { id: authToken.userId },
    data: { emailVerifiedAt: new Date() },
  });
}

export async function logoutCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await getPrisma().authSession.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await getPrisma().authSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          workspaceMembers: {
            include: { workspace: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function writeAuditLog({
  action,
  entityId,
  entityType,
  metadataJson,
  userId,
  workspaceId,
}: {
  action: string;
  entityId?: string;
  entityType?: string;
  metadataJson?: Prisma.InputJsonValue;
  userId?: string;
  workspaceId: string;
}) {
  await getPrisma().auditLog.create({
    data: {
      workspaceId,
      userId,
      action,
      entityId,
      entityType,
      metadataJson,
    },
  });
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + sessionDays);

  await getPrisma().authSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function assertAuthRateLimit(key: string) {
  if (!consumeAuthRateLimit(key)) {
    throw new Error("Too many authentication attempts. Try again shortly.");
  }
}
