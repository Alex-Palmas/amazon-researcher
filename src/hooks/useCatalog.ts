import { useEffect, useState } from "react";
import { loadCatalog } from "../lib/catalog";
import type { Catalog } from "../types";

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadCatalog()
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load catalog");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, error };
}
