"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Stores the browser's IANA time zone in a cookie so the server can work out
 * the viewer's local "today" for expiry calculations.
 */
export function TimezoneSync({ current, cookieName }: { current: string; cookieName: string }) {
  const router = useRouter();
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone || zone === current) return;
    document.cookie = `${cookieName}=${encodeURIComponent(zone)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [current, cookieName, router]);
  return null;
}
