import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = url.searchParams.get("redirect") ?? "/";
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", errorParam);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(loginUrl);
  }

  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/";
  return NextResponse.redirect(new URL(safeRedirect, request.url));
}
