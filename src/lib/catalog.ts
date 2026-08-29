import { AD_STRESS, type Catalog, type Listing } from "../types";

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

export function isTrendingNew(row: Listing): boolean {
  if (row.trending) return true;
  return (
    row.units != null &&
    row.units >= 200 &&
    row.reviews != null &&
    row.reviews <= 80
  );
}

export function hasCostInputs(row: Listing): boolean {
  return row.fob != null || row.unit != null;
}

export function netAfterAdStress(row: Listing): number | null {
  if (!hasCostInputs(row)) return null;
  return row.price - (row.fob ?? 0) - (row.unit ?? 0) - row.price * AD_STRESS;
}

export function survivesAdStress(row: Listing): boolean {
  if (row.sourced !== "yes") return false;
  const net = netAfterAdStress(row);
  return net != null && net > 0;
}

export function monthlyRevenue(row: Listing): number | null {
  if (row.units == null) return null;
  return row.price * row.units;
}

export function observedAcos(row: Listing): number | null {
  const rev = monthlyRevenue(row);
  if (rev == null || row.ads == null || rev <= 0) return null;
  return row.ads / rev;
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US");
}

export function formatUnits(row: Listing): string {
  if (row.unitsLabel) return row.unitsLabel;
  if (row.units == null) return "—";
  return row.units.toLocaleString("en-US");
}

export function formatRating(row: Listing): string {
  if (row.rating == null) return "—";
  const reviews = row.reviews != null ? ` / ${formatNumber(row.reviews)}` : "";
  return `${row.rating.toFixed(1)}${reviews}`;
}

export function amazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}`;
}

export function titleHasPhrase(title: string, phrase: string): boolean {
  return title.toLowerCase().includes(phrase.toLowerCase());
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
