
import "server-only";

import { cookies } from "next/headers";

function getApiUrl(): string {
  const url = process.env.LARAVEL_API_URL;

  if (!url) {
    throw new Error("LARAVEL_API_URL is not configured.");
  }

  return url;
}

interface ServerApiOptions extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;
  authenticated?: boolean;
}

export async function serverApi<T>(
  endpoint: string,
  options: ServerApiOptions = {},
): Promise<T> {
  const {
    headers: customHeaders,
    authenticated = true,
    ...requestOptions
  } = options;

  const headers = new Headers(customHeaders);

  headers.set("Accept", "application/json");

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const baseUrl = getApiUrl().replace(/\/+$/, "");
  const path = endpoint.replace(/^\/+/, "");

  const response = await fetch(`${baseUrl}/${path}`, {
    ...requestOptions,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.message ??
        `API request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
