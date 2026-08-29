import { useEffect, useState } from "react";
import { ROUTES, type RouteId } from "../types";

function parseHash(): RouteId {
  const raw = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  const match = ROUTES.find((route) => route.id === raw);
  return match?.id ?? "overview";
}

export function useHashRoute(): [RouteId, (id: RouteId) => void] {
  const [route, setRoute] = useState<RouteId>(parseHash);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) {
      window.location.hash = "overview";
    }
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (id: RouteId) => {
    window.location.hash = id;
  };

  return [route, navigate];
}
