import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/src/lib/auth/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const token = await getAccessToken();
  const apiUrl = process.env.LARAVEL_API_URL;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ message: "Invalid product ID." }, { status: 400 });
  }

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
    forwardedData.append("_method", "PUT");

    for (const field of ["name", "category_id", "price", "rating", "image"]) {
      const value = formData.get(field);

      if (value instanceof File) {
        if (value.size > 0) {
          forwardedData.append(field, value, value.name);
        }
      } else if (typeof value === "string") {
        if (value !== "" || (field === "image" && formData.get("remove_image") === "true")) {
          forwardedData.append(field, value);
        }
      }
    }

    if (formData.get("remove_image") === "true") {
      forwardedData.set("image", "");
    }

    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/products/${id}`,
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
          ? "Product updated successfully."
          : "Unable to update the product.",
      },
      { status: response.status },
    );
  } catch (error) {
    console.error("Product update proxy error:", error);
    return NextResponse.json(
      { message: "Unable to connect to the Laravel API." },
      { status: 502 },
    );
  }
}
