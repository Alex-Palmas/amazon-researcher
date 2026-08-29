import { BAG_CATEGORIES, type Catalog, type FeeAssumptions, type Listing } from "../types";

export async function loadCatalog(): Promise<Catalog> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/listings.json`);
  if (!res.ok) {
    throw new Error(`Failed to load listings (${res.status})`);
  }
  return res.json() as Promise<Catalog>;
}

export function researchListings(listings: Listing[]): Listing[] {
  return listings.filter((row) => !row.mine);
}

export function mineListings(listings: Listing[]): Listing[] {
  return listings.filter((row) => row.mine);
}

export function isRecommendedPlay(row: Listing): boolean {
  return (
    row.sourced === "yes" &&
    !row.mine &&
    !row.profitExcluded &&
    row.afterAdsMonthly != null &&
    row.afterAdsMonthly > 0
  );
}

export function isTrendingNew(row: Listing): boolean {
  return Boolean(row.trending);
}

export function bestPlay(listings: Listing[]): Listing | undefined {
  return listings.find((row) => row.badge === "BEST");
}

export function findAsin(listings: Listing[], asin: string): Listing | undefined {
  return listings.find((row) => row.asin === asin);
}

export function categoriesOf(listings: Listing[]): string[] {
  return [...new Set(listings.map((row) => row.category).filter((cat): cat is string => Boolean(cat)))].sort();
}

export function dutyRateForCategory(category: string | null, fees: FeeAssumptions): number {
  if (category && BAG_CATEGORIES.has(category)) return fees.dutyBagsPct;
  return fees.dutyOtherSportsPct;
}

export function compareValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

export function searchListings(listings: Listing[], query: string): Listing[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return listings
    .filter((row) => {
      return (
        row.asin.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        (row.brand ?? "").toLowerCase().includes(q)
      );
    })
    .slice(0, 20);
}
