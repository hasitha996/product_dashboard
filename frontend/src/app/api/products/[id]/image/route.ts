import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/src/lib/auth/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
) {
  const { id } = await params;
  const token = await getAccessToken();
  const apiUrl = process.env.LARAVEL_API_URL;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { message: "Invalid product ID." },
      { status: 400 },
    );
  }

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
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { message: "Please select an image." },
        { status: 422 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(image.type) || image.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Use a JPEG, PNG, or WebP image up to 2 MB." },
        { status: 422 },
      );
    }

    const forwardedData = new FormData();
    forwardedData.append("image", image, image.name);

    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/products/${id}/image`,
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
          ? "Image uploaded successfully."
          : "Image upload failed.",
      },
      { status: response.status },
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to upload the image." },
      { status: 502 },
    );
  }
}