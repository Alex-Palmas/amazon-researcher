import { tokenize } from "./tokens";
import { isAutoLike, isBroadLike } from "./ppcCsv";
import type {
  Listing,
  PpcNegativeType,
  PpcNegateTarget,
  PpcSettings,
  PpcTag,
  SearchTermRow,
} from "../types";

export interface ClassifiedTerm extends SearchTermRow {
  tag: PpcTag;
  reasons: string[];
  relevant: boolean;
  negativeType: PpcNegativeType | null;
  applyTo: PpcNegateTarget | null;
  matchedAsin: string | null;
  acosUsed: number | null;
  beCpa: number | null;
  beCpaSource: "unit_profit" | "target_acos_price" | null;
  strongCvr: boolean;
}

const FAMILY_KEYWORDS: Record<string, string[]> = {
  tungsten_tape: [
    "tungsten",
    "tape",
    "pickleball",
    "paddle",
    "weight",
    "weights",
    "lead",
    "alternative",
    "strip",
    "strips",
    "gram",
  ],
  paddle_set: [
    "pickleball",
    "paddle",
    "paddles",
    "foam",
    "thermoformed",
    "carbon",
    "t700",
    "racket",
    "elongated",
  ],
};

const IRRELEVANT_THEMES: Array<{ re: RegExp; label: string }> = [
  { re: /\b(used|pre-?owned|refurbished|second[- ]hand)\b/i, label: "used/refurbished" },
  { re: /\b(rental|rent[- ]a|for rent)\b/i, label: "rental" },
  {
    re: /\b(baseball|softball|soccer|football|basketball|hockey|cricket|lacrosse|volleyball)\b/i,
    label: "wrong sport",
  },
];

export function breakEvenCpa(
  listing: Listing | undefined,
  settings: PpcSettings,
): { value: number | null; source: ClassifiedTerm["beCpaSource"] } {
  if (listing?.unit != null && listing.unit > 0) {
    return { value: listing.unit, source: "unit_profit" };
  }
  if (listing?.price != null && listing.price > 0) {
    return { value: listing.price * (settings.targetAcosPct / 100), source: "target_acos_price" };
  }
  return { value: null, source: null };
}

function campaignCvrAvg(rows: SearchTermRow[], campaignName: string | null): number | null {
  if (!campaignName) return null;
  const peers = rows.filter((row) => row.campaignName === campaignName && !row.example);
  const pool = peers.length >= 2 ? peers : rows.filter((row) => !row.example);
  const clicks = pool.reduce((sum, row) => sum + (row.clicks ?? 0), 0);
  const orders = pool.reduce((sum, row) => sum + (row.orders ?? 0), 0);
  if (clicks <= 0) return null;
  return (orders / clicks) * 100;
}

function resolveListing(
  row: SearchTermRow,
  listings: Listing[],
): Listing | undefined {
  const mine = listings.filter((item) => item.mine);
  if (row.advertisedAsin) {
    const advertised = mine.find((item) => item.asin === row.advertisedAsin);
    if (advertised) return advertised;
  }
  const campaign = (row.campaignName ?? "").toLowerCase();
  const byCampaign = mine.find(
    (item) => campaign.includes(item.asin.toLowerCase()) || campaign.includes(shortFromTitle(item).toLowerCase()),
  );
  if (byCampaign) return byCampaign;

  let best: { listing: Listing; score: number } | null = null;
  const termTokens = new Set(tokenize(row.searchTerm));
  for (const listing of mine) {
    const titleTokens = tokenize(listing.title);
    const score = titleTokens.filter((token) => termTokens.has(token)).length;
    if (!best || score > best.score) best = { listing, score };
  }
  return best && best.score > 0 ? best.listing : mine[0];
}

export function shortFromTitle(listing: Listing): string {
  if (/strip/i.test(listing.title)) return "Strips";
  if (listing.category === "paddle_set" || /foam core/i.test(listing.title)) return "Foam Paddle";
  if (/1 gram per inch|1g/i.test(listing.title)) return "1g Tape";
  if (listing.category === "tungsten_tape") return "Tape";
  return listing.asin.slice(-6);
}

function categoricalIrrelevant(term: string, listing: Listing | undefined): string | null {
  const title = listing?.title ?? "";
  for (const theme of IRRELEVANT_THEMES) {
    if (theme.re.test(term) && !theme.re.test(title)) return theme.label;
  }
  return null;
}

function isRelevant(term: string, listing: Listing | undefined): { relevant: boolean; detail: string } {
  const irrelevant = categoricalIrrelevant(term, listing);
  if (irrelevant) return { relevant: false, detail: `not relevant (${irrelevant})` };
  const termTokens = tokenize(term);
  if (termTokens.length === 0) return { relevant: false, detail: "empty term" };
  const titleTokens = new Set(tokenize(listing?.title ?? ""));
  const overlap = termTokens.filter((token) => titleTokens.has(token));
  const family = new Set(FAMILY_KEYWORDS[listing?.category ?? ""] ?? ["pickleball", "paddle"]);
  const familyHits = termTokens.filter((token) => family.has(token));
  if (overlap.length > 0 || familyHits.length > 0) {
    return {
      relevant: true,
      detail:
        overlap.length > 0
          ? `title overlap: ${overlap.slice(0, 4).join(", ")}`
          : `family keywords: ${familyHits.slice(0, 4).join(", ")}`,
    };
  }
  return { relevant: false, detail: "no title/family overlap" };
}

export function classifySearchTerm(
  row: SearchTermRow,
  settings: PpcSettings,
  listings: Listing[],
  allRows: SearchTermRow[],
): ClassifiedTerm {
  const listing = resolveListing(row, listings);
  const relevance = isRelevant(row.searchTerm, listing);
  const { value: beCpa, source: beCpaSource } = breakEvenCpa(listing, settings);
  const orders = row.orders ?? 0;
  const clicks = row.clicks ?? 0;
  const spend = row.spend ?? 0;
  const acosUsed =
    row.acosPct ?? (row.spend != null && row.sales != null && row.sales > 0 ? (row.spend / row.sales) * 100 : null);
  const campaignAvg = campaignCvrAvg(allRows, row.campaignName);
  const termCvr = row.cvr ?? (clicks > 0 ? (orders / clicks) * 100 : null);
  const strongCvr =
    termCvr != null && campaignAvg != null && campaignAvg > 0 && termCvr >= campaignAvg * 1.5 && orders >= 1;
  const reasons: string[] = [relevance.detail];
  if (strongCvr) {
    reasons.push(`strong CVR ${termCvr!.toFixed(1)}% vs campaign ${campaignAvg!.toFixed(1)}%`);
  }

  const auto = isAutoLike(row.matchType, row.campaignName);
  const broad = isBroadLike(row.matchType, row.campaignName);
  const applyTo: PpcNegateTarget = auto && broad ? "auto_and_broad" : broad ? "broad" : "auto";
  const slightlyOver = settings.targetAcosPct * 1.2;
  const spendCap = beCpa != null ? settings.negateSpendMultiplier * beCpa : null;

  let tag: PpcTag = "ignore";
  let negativeType: PpcNegativeType | null = null;

  const theme = categoricalIrrelevant(row.searchTerm, listing);
  if (theme && orders === 0 && (spend > 0 || clicks > 0)) {
    tag = "negate";
    negativeType = "phrase";
    reasons.push(`negative phrase for ${theme} — not exact`);
  } else if (relevance.relevant && orders >= 2 && acosUsed != null && acosUsed <= settings.targetAcosPct) {
    tag = "harvest_exact";
    reasons.push(`≥2 orders and ACoS ${acosUsed.toFixed(1)}% ≤ target ${settings.targetAcosPct}%`);
  } else if (
    relevance.relevant &&
    (orders === 1 || (orders >= 2 && acosUsed != null && acosUsed <= slightlyOver))
  ) {
    tag = "phrase_expand";
    if (orders === 1) reasons.push("1 order — watch / phrase expand, not Exact harvest");
    else reasons.push(`ACoS ${acosUsed!.toFixed(1)}% slightly over target — watch / phrase expand`);
  } else if (orders === 0 && spendCap != null && spend >= spendCap) {
    tag = "negate";
    negativeType = "exact";
    reasons.push(
      `0 orders and spend ${spend.toFixed(2)} ≥ ${settings.negateSpendMultiplier}× ${
        beCpaSource === "unit_profit" ? "unit profit" : "target CPA"
      } ${beCpa!.toFixed(2)}`,
    );
  } else if (orders === 0 && beCpa == null && clicks >= settings.negateClicksZeroOrders) {
    tag = "negate";
    negativeType = "exact";
    reasons.push(`0 orders, CPA unknown, clicks ${clicks} ≥ ${settings.negateClicksZeroOrders}`);
  } else if (relevance.relevant && (clicks > 0 || (row.impressions ?? 0) > 0)) {
    tag = "watch";
    reasons.push("relevant but below harvest / negate thresholds");
  } else {
    reasons.push("no harvest/negate signal");
  }

  return {
    ...row,
    tag,
    reasons,
    relevant: relevance.relevant,
    negativeType,
    applyTo: tag === "negate" || tag === "harvest_exact" ? applyTo : null,
    matchedAsin: listing?.asin ?? row.advertisedAsin,
    acosUsed,
    beCpa,
    beCpaSource,
    strongCvr,
  };
}

export function classifyAll(
  rows: SearchTermRow[],
  settings: PpcSettings,
  listings: Listing[],
): ClassifiedTerm[] {
  return rows.map((row) => classifySearchTerm(row, settings, listings, rows));
}
