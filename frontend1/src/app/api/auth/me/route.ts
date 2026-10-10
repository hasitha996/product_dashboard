import { NextResponse } from "next/server";
import { clearSession, getAccessToken } from "@/src/lib/auth/session";


export async function GET() {
  const token = await getAccessToken();
  const apiUrl = process.env.LARAVEL_API_URL;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthenticated." },
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
    const response = await fetch(`${apiUrl.replace(/\/+$/, "")}/auth/user`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      await clearSession();

      return NextResponse.json(
        { message: "Your session has expired. Please sign in again." },
        { status: 401 },
      );
    }

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { message: result?.message ?? "Unable to retrieve user." },
        { status: response.status },
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the Laravel API." },
      { status: 502 },
    );
  }
}