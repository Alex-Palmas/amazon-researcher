import { useEffect, useState } from "react";
import { loadOptionalJson } from "../lib/optionalJson";
import type { AlertsFile } from "../types";

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertsFile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadOptionalJson<AlertsFile>("alerts.json").then((data) => {
      if (!cancelled) {
        setAlerts(data);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { alerts, ready };
}
