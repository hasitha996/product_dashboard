import { NextRequest, NextResponse } from "next/server";
import {
  clearSession,
  getSessionTokens,
} from "@/src/lib/auth/session";

export async function POST() {
  const { accessToken, refreshToken } = await getSessionTokens();
  const apiUrl = process.env.LARAVEL_API_URL;

  try {
    if (accessToken && apiUrl) {
      await fetch(`${apiUrl.replace(/\/+$/, "")}/auth/logout`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...(refreshToken ? { "X-Refresh-Token": refreshToken } : {}),
        },
        cache: "no-store",
      });
    }
  } catch {
    // Clear the local session even if the API is unavailable.
  }

  await clearSession();

  return NextResponse.json({ message: "Logged out successfully." });
}

// Used when a server-side session check discovers an expired token.
export async function GET(request: NextRequest) {
  await clearSession();

  const requestedRedirect = request.nextUrl.searchParams.get("redirect");
  const target =
    requestedRedirect === "/login" ? "/login" : "/login";

  return NextResponse.redirect(new URL(target, request.url));
}