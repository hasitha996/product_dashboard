
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/products",
];

const AUTH_PATHS = ["/login", "/register"];

function clearSessionCookies(response: NextResponse) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("access_token", "", cookieOptions);
  response.cookies.set("refresh_token", "", cookieOptions);
}

function setAccessCookie(response: NextResponse, token: string, expiresAt: string) {
  const expires = new Date(expiresAt);

  if (!Number.isFinite(expires.getTime())) {
    throw new Error("Laravel returned an invalid access-token expiration.");
  }

  response.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  let token = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isProtectedPath = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const isAuthPath = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const isProductApiPath = pathname.startsWith("/api/products/");
  let response: NextResponse | undefined;
  let refreshTokenRejected = false;

  if (!token && refreshToken) {
    const apiUrl = process.env.LARAVEL_API_URL;

    if (!apiUrl) {
      if (isProtectedPath || isProductApiPath) {
        return NextResponse.json(
          { message: "Laravel API URL is not configured." },
          { status: 500 },
        );
      }
    } else {
      try {
        const refreshResponse = await fetch(
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
        const result = await refreshResponse.json().catch(() => null);

        if (refreshResponse.status === 401 || refreshResponse.status === 403) {
          refreshTokenRejected = true;
        } else if (!refreshResponse.ok) {
          if (isProtectedPath || isProductApiPath) {
            return NextResponse.json(
              { message: result?.message ?? "Unable to refresh your session." },
              { status: 502 },
            );
          }
        } else {
          const refreshedToken: unknown = result?.token;
          const accessExpiresAt: unknown = result?.ac_expiration_time;

          if (
            typeof refreshedToken === "string" &&
            refreshedToken &&
            typeof accessExpiresAt === "string" &&
            Number.isFinite(Date.parse(accessExpiresAt))
          ) {
            token = refreshedToken;
            request.cookies.set("access_token", refreshedToken);
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("cookie", request.cookies.toString());
            response = NextResponse.next({
              request: { headers: requestHeaders },
            });
            setAccessCookie(response, refreshedToken, accessExpiresAt);
          } else {
            console.error("Unexpected Laravel refresh-token response structure.");
            if (isProtectedPath || isProductApiPath) {
              return NextResponse.json(
                { message: "Unexpected session refresh response from Laravel." },
                { status: 502 },
              );
            }
          }
        }
      } catch (error) {
        console.error("Session refresh proxy error:", error);
        if (isProtectedPath || isProductApiPath) {
          return NextResponse.json(
            { message: "Unable to connect to the Laravel API." },
            { status: 502 },
          );
        }
      }
    }
  }

  // Require a token for protected pages.
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);

    const redirect = NextResponse.redirect(loginUrl);
    if (refreshTokenRejected) {
      clearSessionCookies(redirect);
    }
    return redirect;
  }

  if (isProductApiPath && !token && refreshToken) {
    const unauthorized = NextResponse.json(
      { message: "Your session has expired. Please sign in again." },
      { status: 401 },
    );
    if (refreshTokenRejected) {
      clearSessionCookies(unauthorized);
    }
    return unauthorized;
  }

  // Redirect users with a cookie away from login/register.
  if (isAuthPath && token) {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    if (response) {
      for (const cookie of response.cookies.getAll()) {
        redirect.cookies.set(cookie);
      }
    }
    return redirect;
  }

  if (response) {
    return response;
  }

  const next = NextResponse.next();
  if (refreshTokenRejected) {
    clearSessionCookies(next);
  }
  return next;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/api/products/:path*",
    "/login",
    "/register",
  ],
};