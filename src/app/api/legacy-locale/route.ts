import { NextRequest, NextResponse } from "next/server";
import { localeCookieName } from "@/i18n/config";

export function GET(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get("redirect") ?? "/";
  const safePath = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
  const target = new URL(safePath, request.nextUrl.origin);
  for (const [key, value] of request.nextUrl.searchParams) if (key !== "redirect") target.searchParams.append(key, value);
  const response = NextResponse.redirect(target);
  response.cookies.set(localeCookieName, "el", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
