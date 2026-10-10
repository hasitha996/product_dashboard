import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { setSessionTokens } from "@/src/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const apiUrl = process.env.LARAVEL_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "Laravel API URL is not configured." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const validation = loginSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { message: "Please enter a valid email and password." },
      { status: 422 },
    );
  }

  try {
    const baseUrl = apiUrl.replace(/\/+$/, "");

    const response = await fetch(
      `${baseUrl}/auth/login`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
        cache: "no-store",
      },
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            result?.message ?? "Invalid email or password.",
          errors: result?.errors,
        },
        { status: response.status },
      );
    }

    // Laravel returns "token", not "access_token".
    if (
      typeof result?.token !== "string" ||
      !result.token ||
      typeof result?.user?.id !== "number" ||
      typeof result.user.name !== "string" ||
      typeof result.user.email !== "string" ||
      typeof result.ac_expiration_time !== "string" ||
      !Number.isFinite(Date.parse(result.ac_expiration_time)) ||
      Date.parse(result.ac_expiration_time) <= Date.now() ||
      typeof result.refresh_token !== "string" ||
      !result.refresh_token ||
      typeof result.rt_expiration_time !== "string" ||
      !Number.isFinite(Date.parse(result.rt_expiration_time)) ||
      Date.parse(result.rt_expiration_time) <= Date.now()
    ) {
      console.error(
        "Unexpected Laravel login response structure.",
      );

      return NextResponse.json(
        { message: "Unexpected login response from Laravel." },
        { status: 502 },
      );
    }

    // Store the access token in the server-side session cookie.
    await setSessionTokens(
      result.token,
      result.ac_expiration_time,
      result.refresh_token,
      result.rt_expiration_time,
    );

    return NextResponse.json({
      message: result.message ?? "Login successful.",
      user: result.user,
      token_type: result.token_type ?? "Bearer",
      ac_expiration_time: result.ac_expiration_time ?? null,
      rt_expiration_time: result.rt_expiration_time,
    });
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      { message: "Unable to connect to the Laravel API." },
      { status: 502 },
    );
  }
}
