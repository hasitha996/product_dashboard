import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/src/lib/auth/session";

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  const apiUrl = process.env.LARAVEL_API_URL;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthenticated. Please sign in again." },
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
    const formData = await request.formData();
    const forwardedData = new FormData();

    for (const field of ["name", "category_id", "price", "rating", "image"]) {
      const value = formData.get(field);

      if (value instanceof File) {
        if (value.size > 0) {
          forwardedData.append(field, value, value.name);
        }
      } else if (typeof value === "string" && value !== "") {
        forwardedData.append(field, value);
      }
    }

    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/products`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: forwardedData,
        cache: "no-store",
      },
    );

    const result = await response.json().catch(() => null);

    return NextResponse.json(
      result ?? {
        message: response.ok
          ? "Product created successfully."
          : "Unable to create the product.",
      },
      { status: response.status },
    );
  } catch (error) {
    console.error("Product creation proxy error:", error);

    return NextResponse.json(
      { message: "Unable to connect to the Laravel API." },
      { status: 502 },
    );
  }
}
