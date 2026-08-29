import {
  BAG_CATEGORIES,
  type Catalog,
  type ChartList,
  type ChartView,
  type FeeAssumptions,
  type Listing,
} from "../types";

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

export function hasChartFields(listings: Listing[]): boolean {
  return listings.some(
    (row) =>
      (row.lists && row.lists.length > 0) ||
      row.bestsellerRank != null ||
      row.newReleaseRank != null,
  );
}

export function onChart(row: Listing, list: ChartList): boolean {
  if (row.lists?.includes(list)) return true;
  if (list === "bestsellers") return row.bestsellerRank != null;
  if (list === "newReleases") return row.newReleaseRank != null;
  if (list === "accessories") {
    return row.lists == null && row.rank != null;
  }
  return false;
}

export function chartListings(listings: Listing[], view: ChartView): Listing[] {
  if (view === "all") {
    if (!hasChartFields(listings)) {
      return listings.filter((row) => !row.mine);
    }
    return listings.filter(
      (row) => onChart(row, "accessories") || onChart(row, "bestsellers") || onChart(row, "newReleases"),
    );
  }
  const rows = listings.filter((row) => onChart(row, view));
  if (view === "accessories") {
    return rows.filter((row) => !row.mine);
  }
  return rows;
}

export function chartCounts(listings: Listing[]): Record<ChartList, number> {
  return {
    accessories: listings.filter((row) => onChart(row, "accessories")).length,
    bestsellers: listings.filter((row) => onChart(row, "bestsellers")).length,
    newReleases: listings.filter((row) => onChart(row, "newReleases")).length,
  };
}

export function isBestseller(row: Listing): boolean {
  return onChart(row, "bestsellers");
}

export function isNewRelease(row: Listing): boolean {
  return onChart(row, "newReleases");
}

export function newReleaseRail(listings: Listing[]): Listing[] {
  return chartListings(listings, "newReleases").sort((a, b) =>
    compareValues(a.newReleaseRank, b.newReleaseRank),
  );
}

export function defaultChartSort(view: ChartView): {
  key: "rank" | "bestsellerRank" | "newReleaseRank" | "afterAdsMonthly";
  dir: "asc" | "desc";
} {
  if (view === "bestsellers") return { key: "bestsellerRank", dir: "asc" };
  if (view === "newReleases") return { key: "newReleaseRank", dir: "asc" };
  if (view === "accessories") return { key: "rank", dir: "asc" };
  return { key: "afterAdsMonthly", dir: "desc" };
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
