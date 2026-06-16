import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

const API_BASE = "http://localhost:3000";

/** Returns a stable session ID for this browser tab, stored in sessionStorage. */
function getSessionId(): string {
  const key = "psb_sid";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

/**
 * Fires a fire-and-forget POST to /analytics/pageview on every route change.
 * Skips admin routes so internal navigation isn't counted.
 */
export function usePageView() {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;

    // Don't track admin pages
    if (pathname.startsWith("/admin")) return;

    const sessionId = getSessionId();

    fetch(`${API_BASE}/analytics/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname, sessionId }),
    }).catch(() => {
      // Silently ignore — analytics should never break the app
    });
  }, [location.pathname]);
}
