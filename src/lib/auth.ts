import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import type { AppRole } from "./roles";

const COOKIE = "rp_session";

export type Role = AppRole;

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
}

export type SessionUser = {
  id: string;
  name: string;
  email: string | null;
  role: Role;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: (payload.email as string) || null,
      role: String(payload.role) as Role,
    };
  } catch {
    return null;
  }
}

export async function requireRole(roles: Role[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}

export async function loginWithPassword(emailOrPhone: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      isActive: true,
    },
  });
  if (!user?.passwordHash) return { ok: false as const, message: "Invalid credentials." };
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { ok: false as const, message: "Invalid credentials." };
  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  });
  return { ok: true as const, user };
}
