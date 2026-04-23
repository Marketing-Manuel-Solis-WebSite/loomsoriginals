"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { page: () => void; track: (event: string, data?: unknown) => void };
  }
}

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (typeof window === "undefined") return;
    window.gtag?.("event", "page_view", { page_path: url, page_location: window.location.href });
    window.fbq?.("track", "PageView");
    window.ttq?.page();
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
