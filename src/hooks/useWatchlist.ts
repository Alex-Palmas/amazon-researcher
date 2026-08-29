import { useCallback, useEffect, useState } from "react";
import { SEED_WATCH, WATCH_STORAGE } from "../types";

export interface WatchItem {
  asin: string;
  notes: string;
}

function seed(): WatchItem[] {
  return SEED_WATCH.map((asin) => ({ asin, notes: "" }));
}

function readStore(): WatchItem[] {
  try {
    const raw = localStorage.getItem(WATCH_STORAGE);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as WatchItem[];
    if (!Array.isArray(parsed)) return seed();
    return parsed;
  } catch {
    return seed();
  }
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchItem[]>(readStore);

  useEffect(() => {
    localStorage.setItem(WATCH_STORAGE, JSON.stringify(items));
  }, [items]);

  const unpin = useCallback((asin: string) => {
    setItems((prev) => prev.filter((item) => item.asin !== asin));
  }, []);

  const pin = useCallback((asin: string) => {
    setItems((prev) =>
      prev.some((item) => item.asin === asin) ? prev : [...prev, { asin, notes: "" }],
    );
  }, []);

  const setNotes = useCallback((asin: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.asin === asin ? { ...item, notes } : item)),
    );
  }, []);

  return { items, pin, unpin, setNotes };
}
