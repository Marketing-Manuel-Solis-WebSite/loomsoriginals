import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
  },
  async redirects() {
    return [
      // Legacy paths — preserve link juice
      { source: "/episodio/:path*", destination: "/series/uniendo-familias-manuel-solis/t1/:path*", permanent: true },
      // Force apex / strip trailing slash on legal pages — single canonical
      { source: "/sobre/", destination: "/sobre", permanent: true },
      { source: "/series/", destination: "/series", permanent: true },
      { source: "/categorias/", destination: "/categorias", permanent: true },
      { source: "/contacto/", destination: "/contacto", permanent: true },
      { source: "/buscar/", destination: "/buscar", permanent: true },
      { source: "/privacidad/", destination: "/privacidad", permanent: true },
      { source: "/terminos/", destination: "/terminos", permanent: true },
      { source: "/cookies/", destination: "/cookies", permanent: true },
    ];
  },
  async headers() {
    const SecurityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
      },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    ];
    const ImmutableCache = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];
    const StaticAssetsCache = [
      { key: "Cache-Control", value: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000" },
    ];
    return [
      { source: "/:path*", headers: SecurityHeaders },
      { source: "/_next/static/:path*", headers: ImmutableCache },
      { source: "/:asset(favicon.ico|favicon-16x16.png|favicon-32x32.png|apple-touch-icon.png|android-chrome-192x192.png|android-chrome-512x512.png|og-default.jpg|site.webmanifest)", headers: StaticAssetsCache },
      { source: "/sitemap.xml", headers: [{ key: "Cache-Control", value: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" }] },
      { source: "/sitemap-videos.xml", headers: [{ key: "Cache-Control", value: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" }] },
      { source: "/feed.xml", headers: [{ key: "Cache-Control", value: "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400" }] },
      { source: "/robots.txt", headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" }] },
    ];
  },
};

export default nextConfig;
