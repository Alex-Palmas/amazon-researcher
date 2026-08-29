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
  bestsellerRank?: number | null;
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
  feeAssumptions: FeeAssumptions;
  parentPools: ParentPool[];
}

export interface Catalog {
  meta: CatalogMeta;
  listings: Listing[];
}

export type RouteId =
  | "overview"
  | "research"
  | "mine"
  | "competitors"
  | "keywords"
  | "studio"
  | "profit"
  | "sourcing"
  | "track"
  | "settings";

export interface NavItem {
  id: RouteId;
  label: string;
  group: string;
}

export const ROUTES: NavItem[] = [
  { id: "overview", label: "Overview", group: "Command" },
  { id: "research", label: "Research", group: "Find" },
  { id: "competitors", label: "Competitors", group: "Find" },
  { id: "keywords", label: "Keywords", group: "Find" },
  { id: "mine", label: "My listings", group: "Roore" },
  { id: "studio", label: "Studio", group: "Roore" },
  { id: "profit", label: "Profit lab", group: "Money" },
  { id: "sourcing", label: "Sourcing", group: "Money" },
  { id: "track", label: "Track", group: "Ops" },
  { id: "settings", label: "Settings", group: "Ops" },
];

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

export const KEYWORD_STORAGE = "amazon-researcher.keywords.v2";
export const SETTINGS_STORAGE = "amazon-researcher.settings.v1";
export const WATCH_STORAGE = "amazon-researcher.watchlist.v1";
export const CLUSTER_STORAGE = "amazon-researcher.clusters.v1";
