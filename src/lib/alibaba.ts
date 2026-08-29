import type { Listing } from "../types";

export function alibabaSearchQuery(match: string): string {
  const cleaned = match
    .replace(/\bAlibaba\b/gi, " ")
    .replace(/\$[\d,]+(?:\.\d+)?/g, " ")
    .replace(/@\s*>=?\s*\d+\+?/g, " ")
    .replace(/\([^)]*origin[^)]*\)/gi, " ")
    .replace(/\bMOQ\b[:\s]*\d+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || match;
}

export function alibabaHref(listing: Listing): string | null {
  if (listing.alibabaUrl) return listing.alibabaUrl;
  if (!listing.alibaba) return null;
  const query = alibabaSearchQuery(listing.alibaba);
  return `https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&SearchText=${encodeURIComponent(query)}`;
}
