import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/auth/", "/mi-lista", "/perfil", "/login"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
