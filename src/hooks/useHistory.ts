import { useEffect, useState } from "react";
import { loadOptionalJson } from "../lib/optionalJson";
import type { HistoryFile } from "../types";

export function useHistory() {
  const [history, setHistory] = useState<HistoryFile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadOptionalJson<HistoryFile>("history.json").then((data) => {
      if (!cancelled) {
        setHistory(data);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { history, ready };
}
