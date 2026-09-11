export type Sourced = "yes" | "no" | "unknown";
export type ChartList = "accessories" | "bestsellers" | "newReleases";
export type ChartView = ChartList | "all";

export interface FeeAssumptions {
  referralPct: number;
  fbaFuelPct: number;
  tacosPct: number;
  dutyBagsPct: number;
  dutyBallsPct: number;
  dutyOtherSportsPct: number;
  oceanDdpPerKg: number;
  reciprocalOverlay: boolean;
  monthlyProfitNote: string;
}

export interface Listing {
  asin: string;
  brand: string | null;
  title: string;
  price: number | null;
  listPrice: number | null;
  rating: number | null;
  reviews: number | null;
  units: number | null;
  unitsLabel: string | null;
  image: string;
  url: string | null;
  rank: number | null;
  lists?: ChartList[] | null;
  /** Pickleball Accessories Best Sellers, node 213609101011 */
  bestsellerRank?: number | null;
  /** Pickleball Accessories New Releases, node 213609101011 */
  newReleaseRank?: number | null;
  page: number | null;
  category: string | null;
  packQty: string | number | null;
  mine: boolean;
  trending: boolean;
  sourced: Sourced;
  fob: number | null;
  freight: number | null;
  duty: number | null;
  landed: number | null;
  referral: number | null;
  fba: number | null;
  unit: number | null;
  margin: number | null;
  monthlyRevenue: number | null;
  monthlyProfit: number | null;
  afterAdsMonthly: number | null;
  alibaba: string | null;
  alibabaUrl?: string | null;
  notes: string | null;
  profitExcluded: boolean;
  opportunity: number | null;
  badge?: "BEST" | null;
  parentPool?: string | null;
}

export interface ParentPool {
  asins: string[];
  reviews: number;
  note: string;
}

export interface CatalogMeta {
  scrapedAt: string;
  timezone: string;
  source: string;
  catalogReviews: number;
  weightedRating: number;
  listingCount: number;
  researchCount: number;
  sourcedCount: number;
  trendingCount: number;
  bestsellerCount?: number;
  newReleaseCount?: number;
  feeAssumptions: FeeAssumptions;
  parentPools: ParentPool[];
}

export interface Catalog {
  meta: CatalogMeta;
  listings: Listing[];
}

export type RouteId =
  | "overview"
  | "alerts"
  | "research"
  | "mine"
  | "competitors"
  | "keywords"
  | "studio"
  | "profit"
  | "ppc"
  | "sourcing"
  | "history"
  | "track"
  | "settings";

export interface NavItem {
  id: RouteId;
  label: string;
  group: string;
}

export const ROUTES: NavItem[] = [
  { id: "overview", label: "Overview", group: "Command" },
  { id: "alerts", label: "Alerts", group: "Command" },
  { id: "research", label: "Research", group: "Find" },
  { id: "competitors", label: "Competitors", group: "Find" },
  { id: "keywords", label: "Keywords", group: "Find" },
  { id: "mine", label: "My listings", group: "Roore" },
  { id: "studio", label: "Studio", group: "Roore" },
  { id: "profit", label: "Profit lab", group: "Money" },
  { id: "ppc", label: "PPC", group: "Money" },
  { id: "sourcing", label: "Sourcing", group: "Money" },
  { id: "history", label: "History", group: "Ops" },
  { id: "track", label: "Track", group: "Ops" },
  { id: "settings", label: "Settings", group: "Ops" },
];

export type AlertSeverity = "info" | "watch" | "warn";

export interface AppAlert {
  id: string;
  severity: AlertSeverity;
  kind: string;
  title: string;
  body: string;
  asin: string | null;
  date: string;
}

export interface AlertsFile {
  generatedAt: string;
  timezone?: string;
  note: string;
  alerts: AppAlert[];
}

export interface HistoryKeywordSlots {
  [phrase: string]: number | null;
}

export interface HistoryRooreSku {
  asin: string;
  title: string;
  image: string;
  price: number | null;
  rating: number | null;
  reviews: number | null;
  units: number | null;
  bestsellerRank: number | null;
  newReleaseRank: number | null;
  keywords: HistoryKeywordSlots;
}

export interface SerpHit {
  position: number;
  asin: string;
  title: string;
}

export interface NewReleaseTapeRow {
  asin: string;
  title: string;
  image: string;
  newReleaseRank: number | null;
  reviews: number | null;
  price: string | number | null;
  mine: boolean;
}

export interface HistoryCounts {
  listings: number;
  bestsellers: number;
  newReleases: number;
  catalogReviews: number;
  weightedRating: number;
}

export interface HistorySnapshot {
  date: string;
  timezone: string;
  source: string;
  counts: HistoryCounts;
  roore: HistoryRooreSku[];
  serpTop10: Record<string, SerpHit[]>;
  newReleaseTape: NewReleaseTapeRow[];
}

export interface HistoryFile {
  snapshots: HistorySnapshot[];
}

export interface KeywordRow {
  id: string;
  phrase: string;
  rank: number | null;
  volume: number | null;
  watching: string[];
}

export const MINE_ASINS = [
  "B0GDC2M73C",
  "B0H696X4G4",
  "B0DJ5M2MMW",
  "B0GJTZW6L2",
] as const;

export const ROORE_TAPE_ASINS = [
  "B0GDC2M73C",
  "B0DJ5M2MMW",
  "B0GJTZW6L2",
] as const;

export const TRENDING_ASINS = [
  "B0GW8PD7KT",
  "B0FR1W6326",
  "B0H1BMN3T9",
  "B0GWRV7HTY",
  "B0GSDNQ2YS",
  "B0H41CDCMP",
] as const;

export const SEED_WATCH = [
  ...MINE_ASINS,
  "B0BY34Q2ML",
  "B0972GTS8W",
  ...TRENDING_ASINS,
] as const;

export const SEED_KEYWORDS = [
  "tungsten pickleball tape",
  "pickleball paddle weights",
  "lead tape alternative pickleball",
  "foam core pickleball paddle",
  "pickleball tungsten tape 1 gram per inch",
] as const;

export const AUDIT_SUGGESTIONS = [
  "tungsten tape",
  "paddle weights",
  "lead alternative",
  "1 gram per inch",
  "foam core",
  "T700",
  "thermoformed",
] as const;

export const TAPE_CATEGORIES = ["tungsten_tape", "lead_tape"] as const;
export const CARRY_CATEGORIES = ["sling", "backpack", "tote", "bag"] as const;
export const BAG_CATEGORIES = new Set(["sling", "backpack", "tote", "bag"]);

/** Amazon Browse node 213609101011 — Pickleball Accessories, not Equipment 13287931 */
export const ACCESSORIES_CHART_NODE = "213609101011";
export const BESTSELLERS_CHART_URL =
  "https://www.amazon.com/Best-Sellers-Sports-Outdoors-Pickleball-Accessories/zgbs/sporting-goods/213609101011";
export const NEW_RELEASES_CHART_URL =
  "https://www.amazon.com/gp/new-releases/sporting-goods/213609101011";

export const KEYWORD_STORAGE = "amazon-researcher.keywords.v2";
export const SETTINGS_STORAGE = "amazon-researcher.settings.v1";
export const WATCH_STORAGE = "amazon-researcher.watchlist.v1";
export const CLUSTER_STORAGE = "amazon-researcher.clusters.v1";
export const PPC_STORAGE = "amazon-researcher.ppc.v1";

export type PpcTag = "harvest_exact" | "phrase_expand" | "negate" | "watch" | "ignore";
export type PpcNegativeType = "exact" | "phrase";
export type PpcHarvestDestination = "exact" | "phrase";
export type PpcNegateTarget = "auto" | "broad" | "auto_and_broad";

export interface PpcSettings {
  targetAcosPct: number;
  negateSpendMultiplier: number;
  negateClicksZeroOrders: number;
  lookbackDays: number;
}

export interface PpcBlueprintSeed {
  asin: string;
  short: string;
  family: string | null;
  note: string | null;
}

export interface SearchTermRow {
  id: string;
  searchTerm: string;
  impressions: number | null;
  clicks: number | null;
  spend: number | null;
  sales: number | null;
  orders: number | null;
  acosPct: number | null;
  cvr: number | null;
  campaignName: string | null;
  matchType: string | null;
  advertisedAsin: string | null;
  example: boolean;
}

export interface HarvestQueueItem {
  id: string;
  searchTerm: string;
  destination: PpcHarvestDestination;
  asin: string | null;
  sourceCampaign: string | null;
  addedAt: string;
  example: boolean;
}

export interface NegateQueueItem {
  id: string;
  searchTerm: string;
  negativeType: PpcNegativeType;
  applyTo: PpcNegateTarget;
  asin: string | null;
  sourceCampaign: string | null;
  reason: string;
  addedAt: string;
  example: boolean;
}

export interface PpcImportMeta {
  fileName: string;
  importedAt: string;
  rowCount: number;
}

export interface PpcFile {
  settings: PpcSettings;
  blueprints: PpcBlueprintSeed[];
  harvestQueue: HarvestQueueItem[];
  negateQueue: NegateQueueItem[];
  importedSearchTerms: SearchTermRow[];
  lastImportMeta: PpcImportMeta | null;
  dismissedIds: string[];
}

export const DEFAULT_PPC_SETTINGS: PpcSettings = {
  targetAcosPct: 30,
  negateSpendMultiplier: 2,
  negateClicksZeroOrders: 15,
  lookbackDays: 14,
};
