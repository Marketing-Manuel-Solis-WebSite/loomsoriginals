import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const { pathname } = request.nextUrl;

  const protectedPrefixes = ["/mi-lista", "/perfil", "/en/my-list", "/en/profile"];
  const adminPrefix = "/admin";
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  const isAdmin = pathname.startsWith(adminPrefix);

  if ((isProtected || isAdmin) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin && user) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!adminEmails.includes((user.email ?? "").toLowerCase())) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.svg|api/|embed|robots.txt|sitemap.xml|feed.xml|og-default.jpg).*)",
  ],
};
