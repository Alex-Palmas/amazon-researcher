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

export function deltaLabel(
  current: number | null | undefined,
  previous: number | null | undefined,
  hasPriorWeek: boolean,
): string {
  if (!hasPriorWeek) return "next Monday";
  if (current == null || previous == null) return "—";
  const delta = current - previous;
  if (delta === 0) return "0";
  return delta > 0 ? `+${delta}` : String(delta);
}

export const TUNGSTEN_SERP_PHRASE = "tungsten pickleball tape";
