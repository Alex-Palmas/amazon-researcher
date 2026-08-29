import { useCallback, useEffect, useState } from "react";
import {
  MINE_ASINS,
  SEED_KEYWORDS,
  STORAGE_KEY,
  type KeywordRow,
} from "../types";

function seedRows(): KeywordRow[] {
  return SEED_KEYWORDS.map((phrase, index) => ({
    id: `seed-${index}`,
    phrase,
    rank: null,
    volume: null,
    watching: [...MINE_ASINS],
  }));
}

function readStore(): KeywordRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedRows();
    const parsed = JSON.parse(raw) as KeywordRow[];
    if (!Array.isArray(parsed)) return seedRows();
    return parsed;
  } catch {
    return seedRows();
  }
}

export function useKeywords() {
  const [keywords, setKeywords] = useState<KeywordRow[]>(readStore);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
  }, [keywords]);

  const addKeyword = useCallback((phrase: string) => {
    const trimmed = phrase.trim();
    if (!trimmed) return;
    setKeywords((prev) => {
      if (prev.some((row) => row.phrase.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return [
        ...prev,
        {
          id: `kw-${Date.now()}`,
          phrase: trimmed,
          rank: null,
          volume: null,
          watching: [...MINE_ASINS],
        },
      ];
    });
  }, []);

  const removeKeyword = useCallback((id: string) => {
    setKeywords((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const updateKeyword = useCallback((id: string, patch: Partial<KeywordRow>) => {
    setKeywords((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }, []);

  const toggleWatch = useCallback((id: string, asin: string) => {
    setKeywords((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const watching = row.watching.includes(asin)
          ? row.watching.filter((item) => item !== asin)
          : [...row.watching, asin];
        return { ...row, watching };
      }),
    );
  }, []);

  const trackPhrase = useCallback((phrase: string) => {
    addKeyword(phrase);
  }, [addKeyword]);

  return {
    keywords,
    addKeyword,
    removeKeyword,
    updateKeyword,
    toggleWatch,
    trackPhrase,
  };
}
