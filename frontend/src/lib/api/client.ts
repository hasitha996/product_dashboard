import type { ApiErrorResponse } from "@/src/types/product";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface ClientApiOptions extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;
}

export async function clientApi<T>(
  endpoint: string,
  options: ClientApiOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: "same-origin",
  };

  let response = await fetch(endpoint, requestOptions);

  if (response.status === 401 && endpoint !== "/api/auth/refresh") {
    const refreshResponse = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    });

    if (refreshResponse.ok) {
      response = await fetch(endpoint, requestOptions);
    } else {
      const refreshError = (await refreshResponse
        .json()
        .catch(() => null)) as ApiErrorResponse | null;

      throw new ApiClientError(
        refreshError?.message ?? "Your session has expired. Please sign in again.",
        refreshResponse.status,
        refreshError?.errors,
      );
    }
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | ApiErrorResponse
      | null;

    throw new ApiClientError(
      errorBody?.message ?? `Request failed (${response.status})`,
      response.status,
      errorBody?.errors,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
