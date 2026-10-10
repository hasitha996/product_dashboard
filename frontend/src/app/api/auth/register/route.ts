import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setSessionTokens } from "@/src/lib/auth/session";

const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    email: z.string().trim().email().max(255),
    password: z.string().min(8),
    password_confirmation: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Password confirmation does not match.",
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
  const validation = registerSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        message: "Please correct the highlighted fields.",
        errors: validation.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/auth/register`,
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
          message: result?.message ?? "Unable to create your account.",
          errors: result?.errors,
        },
        { status: response.status },
      );
    }

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
      console.error("Unexpected Laravel registration response structure.");
      return NextResponse.json(
        { message: "Unexpected registration response from Laravel." },
        { status: 502 },
      );
    }

    await setSessionTokens(
      result.token,
      result.ac_expiration_time,
      result.refresh_token,
      result.rt_expiration_time,
    );

    return NextResponse.json({
      message: result.message ?? "Registration successful.",
      user: result.user,
    });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { message: "Unable to connect to the Laravel API." },
      { status: 502 },
    );
  }
}
