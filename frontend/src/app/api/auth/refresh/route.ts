import { NextResponse } from "next/server";
import {
  clearSession,
  getRefreshToken,
  setAccessToken,
} from "@/src/lib/auth/session";

export async function POST() {
  const refreshToken = await getRefreshToken();
  const apiUrl = process.env.LARAVEL_API_URL;

  if (!refreshToken) {
    await clearSession();
    return NextResponse.json(
      { message: "Your session has expired. Please sign in again." },
      { status: 401 },
    );
  }

  if (!apiUrl) {
    return NextResponse.json(
      { message: "Laravel API URL is not configured." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/auth/refresh_token`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
        cache: "no-store",
      },
    );
    const result = await response.json().catch(() => null);

    if (response.status === 401 || response.status === 403) {
      await clearSession();
      return NextResponse.json(
        { message: "Your session has expired. Please sign in again." },
        { status: 401 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: result?.message ?? "Unable to refresh your session." },
        { status: response.status },
      );
    }

    if (
      typeof result?.token !== "string" ||
      !result.token ||
      typeof result.ac_expiration_time !== "string" ||
      !Number.isFinite(Date.parse(result.ac_expiration_time)) ||
      Date.parse(result.ac_expiration_time) <= Date.now()
    ) {
      console.error("Unexpected Laravel refresh-token response structure.");
      return NextResponse.json(
        { message: "Unexpected session refresh response from Laravel." },
        { status: 502 },
      );
    }

    await setAccessToken(result.token, result.ac_expiration_time);

    return NextResponse.json({
      message: result.message ?? "Session refreshed.",
    });
  } catch (error) {
    console.error("Session refresh API error:", error);
    return NextResponse.json(
      { message: "Unable to connect to the Laravel API." },
      { status: 502 },
    );
  }
}
