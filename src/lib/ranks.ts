import { MINE_ASINS, type Listing } from "../types";

export interface OrganicHit {
  position: number;
  asin: string;
  title: string;
  sponsored: boolean;
}

export interface RankedKeyword {
  phrase: string;
  searchUrl: string;
  organic: OrganicHit[];
}

export interface KeywordRanksFile {
  checkedAt: string | null;
  timezone: string;
  source: string;
  keywords: RankedKeyword[];
}

export async function loadKeywordRanks(): Promise<KeywordRanksFile> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/keyword-ranks.json`);
  if (!res.ok) {
    throw new Error(`Failed to load keyword ranks (${res.status})`);
  }
  return res.json() as Promise<KeywordRanksFile>;
}

export function pageFromPosition(position: number): number {
  return Math.ceil(position / 16);
}

export function ranksForAsin(file: KeywordRanksFile, asin: string) {
  return file.keywords
    .map((keyword) => {
      const hit = keyword.organic.find((row) => row.asin === asin);
      if (!hit) return null;
      const roorePositions = keyword.organic
        .filter((row) => (MINE_ASINS as readonly string[]).includes(row.asin))
        .map((row) => row.position);
      return {
        phrase: keyword.phrase,
        searchUrl: keyword.searchUrl,
        position: hit.position,
        page: pageFromPosition(hit.position),
        sponsored: hit.sponsored,
        rooreBest: roorePositions.length ? Math.min(...roorePositions) : null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
    .sort((a, b) => a.position - b.position);
}

export function checkedKeywordCount(file: KeywordRanksFile, asin: string): number | null {
  if (!file.keywords.length) return null;
  return file.keywords.filter((keyword) => keyword.organic.some((row) => row.asin === asin)).length;
}

export interface DemandProxy {
  phrase: string;
  demandProxy: number | null;
  inCatalog: number;
  organicCount: number;
  withUnits: number;
}

export function demandProxies(file: KeywordRanksFile, listings: Listing[]): Map<string, DemandProxy> {
  const byAsin = new Map(listings.map((row) => [row.asin, row]));
  const map = new Map<string, DemandProxy>();
  for (const keyword of file.keywords) {
    let inCatalog = 0;
    let withUnits = 0;
    let sum = 0;
    let hasUnits = false;
    for (const hit of keyword.organic) {
      const listing = byAsin.get(hit.asin);
      if (!listing) continue;
      inCatalog += 1;
      if (listing.units != null) {
        hasUnits = true;
        withUnits += 1;
        sum += listing.units;
      }
    }
    map.set(keyword.phrase.toLowerCase(), {
      phrase: keyword.phrase,
      demandProxy: hasUnits ? sum : null,
      inCatalog,
      organicCount: keyword.organic.length,
      withUnits,
    });
  }
  return map;
}

export function maxDemandProxy(proxies: Map<string, DemandProxy>): number {
  let max = 0;
  for (const row of proxies.values()) {
    if (row.demandProxy != null && row.demandProxy > max) max = row.demandProxy;
  }
  return max;
}
