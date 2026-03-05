import  { useEffect } from "react";
import BASE_URL from "../url";
// import BASE_URL from "../../url";

// const API_BASE = "http://localhost:8080";

// const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const API_BASE = BASE_URL



function getSessionId() {
  const key = "viewer_session_id";
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(key, sid);
  }
  return sid;
}

export function useTrackListingView(listingId?: string) {
  useEffect(() => {
    if (!listingId) return;

    const sid = getSessionId();

    // fire-and-forget (don’t block UI)
    fetch(`${API_BASE}/api/listings/${encodeURIComponent(listingId)}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid }),
    }).catch(() => {});
  }, [listingId]);
}
