import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, clientApi } from "../src/lib/api/client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("clientApi", () => {
  it("sends JSON requests with same-origin credentials and parses JSON responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ id: 12, name: "Desk lamp" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      clientApi<{ id: number; name: string }>("/api/products", {
        method: "POST",
        body: JSON.stringify({ name: "Desk lamp" }),
      }),
    ).resolves.toEqual({ id: 12, name: "Desk lamp" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/products");
    expect(options.credentials).toBe("same-origin");
    expect(new Headers(options.headers).get("Accept")).toBe("application/json");
    expect(new Headers(options.headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("does not set a JSON content type for multipart form data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    const body = new FormData();
    body.set("name", "Desk lamp");

    await clientApi("/api/products", { method: "POST", body });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(options.headers).has("Content-Type")).toBe(false);
    expect(options.body).toBe(body);
  });

  it("returns undefined for successful 204 responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(clientApi<void>("/api/products/1", { method: "DELETE" })).resolves
      .toBeUndefined();
  });

  it("surfaces API error messages, status codes, and field errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            message: "The given data was invalid.",
            errors: { name: ["The name field is required."] },
          },
          { status: 422 },
        ),
      ),
    );

    const request = clientApi("/api/products", { method: "POST" });

    await expect(request).rejects.toMatchObject({
      name: "ApiClientError",
      message: "The given data was invalid.",
      status: 422,
      errors: { name: ["The name field is required."] },
    });
    await expect(request).rejects.toBeInstanceOf(ApiClientError);
  });

  it("refreshes once after a 401 and retries the original request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ refreshed: true }))
      .mockResolvedValueOnce(Response.json({ id: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    const options: RequestInit = {
      method: "POST",
      body: JSON.stringify({ name: "Desk lamp" }),
    };

    await expect(clientApi("/api/products", options)).resolves.toEqual({ id: 1 });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe("/api/auth/refresh");
    expect(fetchMock.mock.calls[2][0]).toBe("/api/products");
    expect(fetchMock.mock.calls[2][1]).toMatchObject(options);
  });

  it("returns a session error when refresh fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        Response.json(
          { message: "Refresh token expired." },
          { status: 401 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(clientApi("/api/products")).rejects.toMatchObject({
      name: "ApiClientError",
      message: "Refresh token expired.",
      status: 401,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
