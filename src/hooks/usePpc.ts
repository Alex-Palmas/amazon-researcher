import { useCallback, useEffect, useState } from "react";
import { loadOptionalJson } from "../lib/optionalJson";
import {
  DEFAULT_PPC_SETTINGS,
  PPC_STORAGE,
  type HarvestQueueItem,
  type NegateQueueItem,
  type PpcFile,
  type PpcImportMeta,
  type PpcSettings,
  type SearchTermRow,
} from "../types";

export interface PpcPersisted {
  settings: PpcSettings;
  harvestQueue: HarvestQueueItem[];
  negateQueue: NegateQueueItem[];
  importedSearchTerms: SearchTermRow[];
  lastImportMeta: PpcImportMeta | null;
  dismissedIds: string[];
}

const EMPTY_SEED: PpcFile = {
  settings: DEFAULT_PPC_SETTINGS,
  blueprints: [],
  harvestQueue: [],
  negateQueue: [],
  importedSearchTerms: [],
  lastImportMeta: null,
  dismissedIds: [],
};

function readStore(): Partial<PpcPersisted> | null {
  try {
    const raw = localStorage.getItem(PPC_STORAGE);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PpcPersisted>;
  } catch {
    return null;
  }
}

function hydrate(seed: PpcFile, stored: Partial<PpcPersisted> | null): PpcPersisted {
  return {
    settings: { ...DEFAULT_PPC_SETTINGS, ...seed.settings, ...stored?.settings },
    harvestQueue: stored?.harvestQueue ?? seed.harvestQueue ?? [],
    negateQueue: stored?.negateQueue ?? seed.negateQueue ?? [],
    importedSearchTerms: stored?.importedSearchTerms ?? seed.importedSearchTerms ?? [],
    lastImportMeta: stored?.lastImportMeta ?? seed.lastImportMeta ?? null,
    dismissedIds: stored?.dismissedIds ?? seed.dismissedIds ?? [],
  };
}

export function usePpc() {
  const [seed, setSeed] = useState<PpcFile>(EMPTY_SEED);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PpcPersisted>(() => hydrate(EMPTY_SEED, readStore()));

  useEffect(() => {
    let cancelled = false;
    loadOptionalJson<PpcFile>("ppc.json").then((data) => {
      if (cancelled) return;
      const nextSeed = data ?? EMPTY_SEED;
      setSeed(nextSeed);
      setState(hydrate(nextSeed, readStore()));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(PPC_STORAGE, JSON.stringify(state));
  }, [state, ready]);

  const saveSettings = useCallback((settings: PpcSettings) => {
    setState((prev) => ({ ...prev, settings }));
  }, []);

  const resetSettings = useCallback(() => {
    setState((prev) => ({ ...prev, settings: { ...DEFAULT_PPC_SETTINGS, ...seed.settings } }));
  }, [seed.settings]);

  const importTerms = useCallback((rows: SearchTermRow[], meta: PpcImportMeta) => {
    setState((prev) => ({
      ...prev,
      importedSearchTerms: rows,
      lastImportMeta: meta,
      dismissedIds: [],
    }));
  }, []);

  const addHarvest = useCallback((item: HarvestQueueItem) => {
    setState((prev) => {
      if (
        prev.harvestQueue.some(
          (row) =>
            row.searchTerm.toLowerCase() === item.searchTerm.toLowerCase() &&
            row.destination === item.destination,
        )
      ) {
        return prev;
      }
      return { ...prev, harvestQueue: [...prev.harvestQueue, item] };
    });
  }, []);

  const addNegate = useCallback((item: NegateQueueItem) => {
    setState((prev) => {
      if (
        prev.negateQueue.some(
          (row) =>
            row.searchTerm.toLowerCase() === item.searchTerm.toLowerCase() &&
            row.negativeType === item.negativeType,
        )
      ) {
        return prev;
      }
      return { ...prev, negateQueue: [...prev.negateQueue, item] };
    });
  }, []);

  const removeHarvest = useCallback((id: string) => {
    setState((prev) => ({ ...prev, harvestQueue: prev.harvestQueue.filter((row) => row.id !== id) }));
  }, []);

  const removeNegate = useCallback((id: string) => {
    setState((prev) => ({ ...prev, negateQueue: prev.negateQueue.filter((row) => row.id !== id) }));
  }, []);

  const dismissTerm = useCallback((id: string) => {
    setState((prev) =>
      prev.dismissedIds.includes(id) ? prev : { ...prev, dismissedIds: [...prev.dismissedIds, id] },
    );
  }, []);

  const resetLocal = useCallback(() => {
    const next = hydrate(seed, null);
    setState(next);
    localStorage.removeItem(PPC_STORAGE);
  }, [seed]);

  return {
    ready,
    seed,
    settings: state.settings,
    harvestQueue: state.harvestQueue,
    negateQueue: state.negateQueue,
    importedSearchTerms: state.importedSearchTerms,
    lastImportMeta: state.lastImportMeta,
    dismissedIds: state.dismissedIds,
    saveSettings,
    resetSettings,
    importTerms,
    addHarvest,
    addNegate,
    removeHarvest,
    removeNegate,
    dismissTerm,
    resetLocal,
  };
}
