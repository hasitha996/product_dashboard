import "server-only";

import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

function getExpiration(expiresAt: string): Date {
  const expires = new Date(expiresAt);

  if (!Number.isFinite(expires.getTime()) || expires <= new Date()) {
    throw new Error("The token expiration returned by Laravel is invalid.");
  }

  return expires;
}

export async function setAccessToken(
  token: string,
  expiresAt?: string,
): Promise<void> {
  const cookieStore = await cookies();

  if (!expiresAt) {
    cookieStore.set(ACCESS_TOKEN_COOKIE, token, getCookieOptions());
    return;
  }

  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    ...getCookieOptions(),
    expires: getExpiration(expiresAt),
  });
}

export async function setRefreshToken(
  token: string,
  expiresAt: string,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    ...getCookieOptions(),
    expires: getExpiration(expiresAt),
  });
}

export async function setSessionTokens(
  accessToken: string,
  accessExpiresAt: string,
  refreshToken: string,
  refreshExpiresAt: string,
): Promise<void> {
  await setAccessToken(accessToken, accessExpiresAt);
  await setRefreshToken(refreshToken, refreshExpiresAt);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function getSessionTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const cookieOptions = getCookieOptions();

  cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
    ...cookieOptions,
    expires: new Date(0),
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
  });
}
