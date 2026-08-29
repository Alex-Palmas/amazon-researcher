import type { Listing } from "../types";

export function formatMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPct(value: number | null | undefined, alreadyPercent = false): string {
  if (value == null || Number.isNaN(value)) return "—";
  const pct = alreadyPercent ? value : value * 100;
  return `${pct.toFixed(1)}%`;
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

export function pnlClass(value: number | null | undefined): string {
  if (value == null) return "";
  if (value > 0) return "pos";
  if (value < 0) return "neg";
  return "";
}

export function categoryLabel(category: string | null | undefined): string {
  if (!category) return "—";
  return category.replaceAll("_", " ");
}

export function amazonUrl(listing: Listing): string {
  return listing.url || `https://www.amazon.com/dp/${listing.asin}`;
}

export function notChecked(value: number | null | undefined): string {
  if (value == null) return "not checked";
  return formatNumber(value);
}
