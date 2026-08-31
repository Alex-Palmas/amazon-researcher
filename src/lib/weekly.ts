import { MINE_ASINS, type HistoryFile, type HistoryRooreSku, type HistorySnapshot } from "../types";

export function latestSnapshot(file: HistoryFile | null): HistorySnapshot | null {
  if (!file?.snapshots.length) return null;
  return file.snapshots[file.snapshots.length - 1] ?? null;
}

export function previousSnapshot(file: HistoryFile | null): HistorySnapshot | null {
  if (!file || file.snapshots.length < 2) return null;
  return file.snapshots[file.snapshots.length - 2] ?? null;
}

export function canSpark(file: HistoryFile | null): boolean {
  return (file?.snapshots.length ?? 0) >= 2;
}

export function rooreOf(snapshot: HistorySnapshot | null, asin: string): HistoryRooreSku | undefined {
  return snapshot?.roore.find((row) => row.asin === asin);
}

export function keywordSlots(row: HistoryRooreSku): { phrase: string; rank: number }[] {
  return Object.entries(row.keywords)
    .filter((entry): entry is [string, number] => entry[1] != null)
    .map(([phrase, rank]) => ({ phrase, rank }))
    .sort((a, b) => a.rank - b.rank);
}

export function isRooreAsin(asin: string): boolean {
  return (MINE_ASINS as readonly string[]).includes(asin);
}

export function keywordSlotDiffs(
  current: HistoryRooreSku,
  previous?: HistoryRooreSku,
): { phrase: string; rank: number | null; prevRank: number | null }[] {
  const phrases = new Set([...Object.keys(current.keywords), ...Object.keys(previous?.keywords ?? {})]);
  return [...phrases]
    .map((phrase) => ({
      phrase,
      rank: current.keywords[phrase] ?? null,
      prevRank: previous?.keywords[phrase] ?? null,
    }))
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
}

export function signedDelta(current: number | null | undefined, previous: number | null | undefined): string | null {
  if (current == null || previous == null) return null;
  const delta = current - previous;
  if (delta === 0) return "0";
  return delta > 0 ? `+${delta}` : String(delta);
}

export function deltaLabel(
  current: number | null | undefined,
  previous: number | null | undefined,
  hasPriorWeek: boolean,
): string {
  if (!hasPriorWeek) return "next Monday";
  return signedDelta(current, previous) ?? "—";
}

export function changeSummary(current: HistoryRooreSku, previous: HistoryRooreSku | undefined, hasPriorWeek: boolean): string {
  if (!hasPriorWeek) return "next Monday";
  if (!previous) return "—";
  const parts: string[] = [];
  const reviews = signedDelta(current.reviews, previous.reviews);
  if (reviews && reviews !== "0") parts.push(`reviews ${reviews}`);
  const bs = signedDelta(current.bestsellerRank, previous.bestsellerRank);
  if (bs && bs !== "0") parts.push(`BS ${bs}`);
  for (const slot of keywordSlotDiffs(current, previous)) {
    if (slot.rank == null && slot.prevRank != null) {
      parts.push(`${slot.phrase} off`);
    } else if (slot.rank != null && slot.prevRank != null && slot.rank !== slot.prevRank) {
      parts.push(`${slot.phrase} ${slot.prevRank}→${slot.rank}`);
    }
  }
  return parts.length ? parts.join(" · ") : "0";
}

export const TUNGSTEN_SERP_PHRASE = "tungsten pickleball tape";
export const STRIPS_PHRASE = "tungsten tape strips pickleball";
