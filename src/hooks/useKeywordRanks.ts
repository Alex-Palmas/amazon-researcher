import { useEffect, useState } from "react";
import { loadKeywordRanks, type KeywordRanksFile } from "../lib/ranks";

export function useKeywordRanks() {
  const [ranks, setRanks] = useState<KeywordRanksFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadKeywordRanks()
      .then((data) => {
        if (!cancelled) setRanks(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load keyword ranks");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ranks, error };
}
